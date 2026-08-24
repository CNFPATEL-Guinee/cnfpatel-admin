import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

const roles = [
  { valeur: "apprenant", label: "Apprenant" },
  { valeur: "formateur", label: "Formateur" },
  { valeur: "admin_regional", label: "Admin régional" },
  { valeur: "admin_national", label: "Admin national" },
];

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [role, setRole] = useState("apprenant");
  const [enregistrement, setEnregistrement] = useState(false);

  async function chargerUtilisateurs() {
    setChargement(true);
    try {
      const reponse = await api.get("/admin/utilisateurs");
      setUtilisateurs(reponse.data);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les utilisateurs.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  async function creerUtilisateur(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(null);
    try {
      await api.post("/admin/utilisateurs", { nom, prenom, telephone, motDePasse, role });
      setNom("");
      setPrenom("");
      setTelephone("");
      setMotDePasse("");
      setRole("apprenant");
      setSucces("Utilisateur créé avec succès.");
      await chargerUtilisateurs();
    } catch (e) {
      setErreur(
        e.response?.status === 409
          ? "Ce numéro de téléphone est déjà utilisé."
          : "Erreur lors de la création de l'utilisateur."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimerUtilisateur(id) {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/admin/utilisateurs/${id}`);
      await chargerUtilisateurs();
    } catch (e) {
      setErreur(e.response?.data?.message || "Erreur lors de la suppression.");
    }
  }

  const libelleRole = (r) => roles.find((x) => x.valeur === r)?.label || r;

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "24px" }}>Utilisateurs</h1>

      <div style={styles.grille}>
        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Nouvel utilisateur</h2>
          {succes && <p style={styles.succes}>{succes}</p>}
          {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
          <form onSubmit={creerUtilisateur}>
            <label style={styles.label}>Prénom</label>
            <input style={styles.input} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

            <label style={styles.label}>Nom</label>
            <input style={styles.input} value={nom} onChange={(e) => setNom(e.target.value)} required />

            <label style={styles.label}>Téléphone</label>
            <input style={styles.input} value={telephone} onChange={(e) => setTelephone(e.target.value)} required />

            <label style={styles.label}>Mot de passe temporaire</label>
            <input
              style={styles.input}
              type="text"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
            />

            <label style={styles.label}>Rôle</label>
            <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r.valeur} value={r.valeur}>{r.label}</option>
              ))}
            </select>

            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Création..." : "Créer l'utilisateur"}
            </button>
          </form>
        </div>

        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Utilisateurs existants ({utilisateurs.length})</h2>
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : (
            <table style={styles.tableau}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Téléphone</th>
                  <th style={styles.th}>Rôle</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u._id}>
                    <td style={styles.td}>{u.prenom} {u.nom}</td>
                    <td style={styles.td}>{u.telephone}</td>
                    <td style={styles.td}>
                      <span style={u.role.includes("admin") ? styles.badgeAdmin : styles.badge}>
                        {libelleRole(u.role)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => supprimerUtilisateur(u._id)} style={styles.boutonSupprimer}>🗑</button>
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
  badge: { backgroundColor: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" },
  badgeAdmin: { backgroundColor: "#DCE6F1", color: "#1F3864", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 },
};
