import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function DetailFormationFormateur() {
  const { id } = useParams();
  const { utilisateur, deconnecter } = useAuth();
  const [modules, setModules] = useState([]);
  const [coursParModule, setCoursParModule] = useState({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [moduleChoisi, setModuleChoisi] = useState("");
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("video");
  const [fichier, setFichier] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);
  const [progressionUpload, setProgressionUpload] = useState(0);
  const [succes, setSucces] = useState(null);

  async function chargerTout() {
    setChargement(true);
    try {
      const repModules = await api.get(`/formations/${id}/modules`);
      setModules(repModules.data);
      if (repModules.data.length > 0 && !moduleChoisi) {
        setModuleChoisi(repModules.data[0]._id);
      }
      const coursMap = {};
      for (const m of repModules.data) {
        const rep = await api.get(`/modules/${m._id}/cours`);
        coursMap[m._id] = rep.data;
      }
      setCoursParModule(coursMap);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger la formation.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerTout();
  }, [id]);

  async function ajouterCours(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(null);
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
        onUploadProgress: (evt) => setProgressionUpload(Math.round((evt.loaded / evt.total) * 100)),
      });

      await api.post(`/modules/${moduleChoisi}/cours`, { titre, type, urlFichier: reponseUpload.data.url });
      setTitre("");
      setFichier(null);
      setProgressionUpload(0);
      setSucces("Cours ajouté avec succès.");
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de l'ajout du cours.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <div style={styles.conteneur}>
      <header style={styles.entete}>
        <div>
          <h1 style={styles.titre}>CNFPATEL Guinée</h1>
          <p style={styles.sousTitre}>Espace formateur</p>
        </div>
        <div style={styles.blocUtilisateur}>
          <span>{utilisateur.prenom} {utilisateur.nom}</span>
          <button onClick={deconnecter} style={styles.boutonDeconnexion}>Se déconnecter</button>
        </div>
      </header>

      <main style={styles.contenu}>
        <Link to="/formateur/formations" style={styles.retour}>← Retour aux formations</Link>
        <h2 style={{ marginTop: "12px" }}>Ajouter du contenu</h2>
        {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

        <div style={styles.grille}>
          <div style={styles.carte}>
            {succes && <p style={styles.succes}>{succes}</p>}
            <form onSubmit={ajouterCours}>
              <label style={styles.label}>Module</label>
              <select style={styles.input} value={moduleChoisi} onChange={(e) => setModuleChoisi(e.target.value)} required>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>{m.ordre}. {m.titre}</option>
                ))}
              </select>

              <label style={styles.label}>Titre du cours</label>
              <input style={styles.input} value={titre} onChange={(e) => setTitre(e.target.value)} required />

              <label style={styles.label}>Type</label>
              <select style={styles.input} value={type} onChange={(e) => { setType(e.target.value); setFichier(null); }}>
                <option value="video">Vidéo</option>
                <option value="document">Document (PDF)</option>
              </select>

              <label style={styles.label}>Fichier {type === "video" ? "vidéo" : "PDF"}</label>
              <input
                style={styles.input}
                type="file"
                accept={type === "video" ? "video/*" : "application/pdf"}
                onChange={(e) => setFichier(e.target.files[0])}
                required
              />
              {enregistrement && progressionUpload > 0 && (
                <p style={styles.astuce}>Envoi en cours... {progressionUpload}%</p>
              )}

              <button style={styles.bouton} disabled={enregistrement}>
                {enregistrement ? "Ajout..." : "Ajouter le cours"}
              </button>
            </form>
          </div>

          <div style={styles.carte}>
            <h3 style={{ marginTop: 0 }}>Contenu existant</h3>
            {chargement ? (
              <p style={{ color: "#6b7280" }}>Chargement...</p>
            ) : modules.length === 0 ? (
              <p style={{ color: "#6b7280" }}>Aucun module dans cette formation.</p>
            ) : (
              modules.sort((a, b) => a.ordre - b.ordre).map((m) => (
                <div key={m._id} style={styles.blocModule}>
                  <strong>{m.ordre}. {m.titre}</strong>
                  {coursParModule[m._id]?.length > 0 ? (
                    <ul style={styles.listeCours}>
                      {coursParModule[m._id].map((c) => (
                        <li key={c._id}>{c.type === "video" ? "🎬" : "📄"} {c.titre}</li>
                      ))}
                    </ul>
                  ) : <p style={styles.pasDeCours}>Aucun cours.</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  conteneur: { minHeight: "100vh", backgroundColor: "#F3F4F7", fontFamily: "system-ui, sans-serif" },
  entete: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", backgroundColor: "white", borderBottom: "1px solid #e5e7eb" },
  titre: { color: "#1F3864", margin: 0, fontSize: "20px", fontStyle: "italic" },
  sousTitre: { color: "#6b7280", margin: "2px 0 0", fontSize: "13px" },
  blocUtilisateur: { display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", fontWeight: 600, color: "#374151" },
  boutonDeconnexion: { padding: "6px 12px", backgroundColor: "transparent", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", cursor: "pointer" },
  contenu: { padding: "24px 32px" },
  retour: { color: "#6b7280", textDecoration: "none", fontSize: "13px" },
  grille: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start", marginTop: "16px" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" },
  astuce: { fontSize: "12px", color: "#1F3864", fontWeight: 600, marginBottom: "12px" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  succes: { backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" },
  blocModule: { padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", marginBottom: "12px" },
  listeCours: { marginTop: "8px", marginBottom: 0, paddingLeft: "18px", fontSize: "13px", color: "#4b5563" },
  pasDeCours: { marginTop: "8px", marginBottom: 0, fontSize: "13px", color: "#9ca3af" },
};
