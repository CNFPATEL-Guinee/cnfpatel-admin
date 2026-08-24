import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import LecteurVideoModal from "../components/LecteurVideoModal";
import api from "../api/client";

export default function DetailModule() {
  const { id } = useParams();
  const [cours, setCours] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [videoEnPreview, setVideoEnPreview] = useState(null);

  const [titre, setTitre] = useState("");
  const [type, setType] = useState("video");
  const [fichier, setFichier] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [progressionUpload, setProgressionUpload] = useState(0);

  async function chargerCours() {
    setChargement(true);
    try {
      const reponse = await api.get(`/modules/${id}/cours`);
      setCours(reponse.data);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les cours.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerCours();
  }, [id]);

  async function creerCours(e) {
    e.preventDefault();
    setEnregistrement(true);
    setErreur(null);
    setProgressionUpload(0);
    try {
      if (!fichier) {
        setErreur(`Choisissez un fichier ${type === "video" ? "vidéo" : "PDF"}.`);
        setEnregistrement(false);
        return;
      }

      const formData = new FormData();
      formData.append("fichier", fichier);
      const pointFinal = type === "video" ? "/upload/video" : "/upload/document";
      const reponseUpload = await api.post(pointFinal, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          setProgressionUpload(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      await api.post(`/modules/${id}/cours`, { titre, type, urlFichier: reponseUpload.data.url });
      setTitre("");
      setFichier(null);
      setProgressionUpload(0);
      await chargerCours();
    } catch (e) {
      setErreur(
        e.response?.status === 413
          ? "Le fichier est trop volumineux."
          : "Erreur lors de l'ajout du cours."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimerCours(coursId) {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await api.delete(`/modules/${id}/cours/${coursId}`);
      await chargerCours();
    } catch (e) {
      setErreur("Erreur lors de la suppression.");
    }
  }

  return (
    <MiseEnPage>
      <Link to="/formations" style={styles.retour}>← Retour aux formations</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
        <h1>Cours du module</h1>
        <Link to={`/modules/${id}/quiz`} style={styles.lienQuiz}>📝 Gérer le quiz de ce module →</Link>
      </div>

      <div style={styles.grille}>
        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Ajouter un cours</h2>
          <form onSubmit={creerCours}>
            <label style={styles.label}>Titre</label>
            <input style={styles.input} value={titre} onChange={(e) => setTitre(e.target.value)} required />

            <label style={styles.label}>Type</label>
            <select style={styles.input} value={type} onChange={(e) => { setType(e.target.value); setFichier(null); }}>
              <option value="video">Vidéo</option>
              <option value="document">Document (PDF)</option>
            </select>

            <label style={styles.label}>
              Fichier {type === "video" ? "vidéo (MP4...)" : "PDF"}
            </label>
            <input
              style={styles.input}
              type="file"
              accept={type === "video" ? "video/*" : "application/pdf"}
              onChange={(e) => setFichier(e.target.files[0])}
              required
            />
            {type === "video" && (
              <p style={styles.astuce}>Taille maximale : 300 Mo.</p>
            )}
            {enregistrement && progressionUpload > 0 && (
              <p style={styles.astuceEnvoi}>Envoi en cours... {progressionUpload}%</p>
            )}

            {erreur && <p style={{ color: "#b91c1c", fontSize: "13px" }}>{erreur}</p>}

            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Ajout..." : "Ajouter le cours"}
            </button>
          </form>
        </div>

        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Cours existants</h2>
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : cours.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Aucun cours pour le moment.</p>
          ) : (
            <table style={styles.tableau}>
              <thead><tr><th style={styles.th}>Type</th><th style={styles.th}>Titre</th><th style={styles.th}></th><th style={styles.th}></th></tr></thead>
              <tbody>
                {cours.map((c) => (
                  <tr key={c._id}>
                    <td style={styles.td}>{c.type === "video" ? "🎬 Vidéo" : "📄 Document"}</td>
                    <td style={styles.td}>{c.titre}</td>
                    <td style={styles.td}>
                      {c.type === "video" ? (
                        <button onClick={() => setVideoEnPreview(c.urlFichier)} style={styles.boutonVoir}>▶ Voir</button>
                      ) : (
                        <a href={c.urlFichier} target="_blank" rel="noreferrer" style={styles.lienGerer}>Voir le PDF</a>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => supprimerCours(c._id)} style={styles.boutonSupprimer}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <LecteurVideoModal url={videoEnPreview} onFermer={() => setVideoEnPreview(null)} />
    </MiseEnPage>
  );
}

const styles = {
  retour: { color: "#6b7280", textDecoration: "none", fontSize: "13px" },
  lienQuiz: { color: "#1F3864", textDecoration: "none", fontWeight: 600, fontSize: "14px" },
  grille: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start", marginTop: "20px" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  titreCarte: { fontSize: "16px", marginTop: 0, marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit" },
  astuce: { fontSize: "11px", color: "#9ca3af", marginTop: "-10px", marginBottom: "16px" },
  astuceEnvoi: { fontSize: "12px", color: "#1F3864", fontWeight: 600, marginBottom: "12px" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonVoir: { padding: "4px 10px", backgroundColor: "#DCE6F1", color: "#1F3864", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  tableau: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
  lienGerer: { fontSize: "13px", color: "#1F3864", textDecoration: "none", fontWeight: 600 },
};
