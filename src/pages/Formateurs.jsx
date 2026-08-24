import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Formateurs() {
  const [formateurs, setFormateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  async function chargerFormateurs() {
    setChargement(true);
    try {
      const reponse = await api.get("/admin/utilisateurs");
      setFormateurs(reponse.data.filter((u) => u.role === "formateur"));
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les formateurs.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerFormateurs();
  }, []);

  async function creerFormateur(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(null);
    try {
      await api.post("/admin/utilisateurs", { nom, prenom, telephone, motDePasse, role: "formateur" });
      setNom(""); setPrenom(""); setTelephone(""); setMotDePasse("");
      setSucces("Formateur créé avec succès.");
      await chargerFormateurs();
    } catch (e) {
      setErreur(
        e.response?.status === 409
          ? "Ce numéro de téléphone est déjà utilisé."
          : "Erreur lors de la création du formateur."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimerFormateur(id) {
    if (!window.confirm("Supprimer ce formateur ?")) return;
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      await chargerFormateurs();
    } catch (e) {
      setErreur(e.response?.data?.message || "Erreur lors de la suppression.");
    }
  }

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "24px" }}>Formateurs</h1>

      <div style={styles.grille}>
        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Nouveau formateur</h2>
          {succes && <p style={styles.succes}>{succes}</p>}
          {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
          <form onSubmit={creerFormateur}>
            <label style={styles.label}>Prénom</label>
            <input style={styles.input} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            <label style={styles.label}>Nom</label>
            <input style={styles.input} value={nom} onChange={(e) => setNom(e.target.value)} required />
            <label style={styles.label}>Téléphone</label>
            <input style={styles.input} value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            <label style={styles.label}>Mot de passe temporaire</label>
            <input style={styles.input} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Création..." : "Créer le formateur"}
            </button>
          </form>
        </div>

        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Formateurs existants ({formateurs.length})</h2>
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : formateurs.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Aucun formateur pour le moment.</p>
          ) : (
            <table style={styles.tableau}>
              <thead>
                <tr><th style={styles.th}>Nom</th><th style={styles.th}>Téléphone</th><th style={styles.th}></th></tr>
              </thead>
              <tbody>
                {formateurs.map((f) => (
                  <tr key={f._id}>
                    <td style={styles.td}>{f.prenom} {f.nom}</td>
                    <td style={styles.td}>{f.telephone}</td>
                    <td style={styles.td}>
                      <button onClick={() => supprimerFormateur(f._id)} style={styles.boutonSupprimer}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MiseEnPage>
  );
}

const styles = {
  grille: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  titreCarte: { fontSize: "16px", marginTop: 0, marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  succes: { backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "13px" },
  tableau: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
};
