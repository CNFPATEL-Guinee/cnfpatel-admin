import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

const roles = [
  { valeur: "apprenant", label: "Apprenant" },
  { valeur: "formateur", label: "Formateur" },
  { valeur: "admin_regional", label: "Admin régional" },
  { valeur: "admin_national", label: "Admin national" },
];

const rangs = ["Prefet", "Sous-prefet", "Secretaire-general", "Maire", "Chef-cabinet"];

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
  const [rang, setRang] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null);

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

  function reinitialiserForm() {
    setNom("");
    setPrenom("");
    setTelephone("");
    setMotDePasse("");
    setRole("apprenant");
    setRang("");
    setUtilisateurEnEdition(null);
  }

  function commencerEdition(u) {
    setUtilisateurEnEdition(u._id);
    setNom(u.nom);
    setPrenom(u.prenom);
    setTelephone(u.telephone);
    setMotDePasse("");
    setRole(u.role);
    setRang(u.rang || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function soumettreUtilisateur(e) {
    e.preventDefault();
    setEnregistrement(true);
    setSucces(null);
    try {
      if (utilisateurEnEdition) {
        const donnees = { nom, prenom, telephone, role, rang: role === "apprenant" && rang ? rang : null };
        if (motDePasse) donnees.motDePasse = motDePasse;
        await api.patch(`/admin/utilisateurs/${utilisateurEnEdition}`, donnees);
        setSucces("Utilisateur modifié avec succès.");
      } else {
        await api.post("/admin/utilisateurs", {
          nom, prenom, telephone, motDePasse, role,
          rang: role === "apprenant" && rang ? rang : undefined,
        });
        setSucces("Utilisateur créé avec succès.");
      }
      reinitialiserForm();
      await chargerUtilisateurs();
    } catch (e) {
      setErreur(
        e.response?.status === 409
          ? "Ce numéro de téléphone est déjà utilisé."
          : "Erreur lors de l'enregistrement de l'utilisateur."
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ ...styles.titreCarte, marginBottom: 0 }}>
              {utilisateurEnEdition ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
            {utilisateurEnEdition && (
              <button onClick={reinitialiserForm} style={styles.lienAnnuler}>Annuler</button>
            )}
          </div>
          {succes && <p style={styles.succes}>{succes}</p>}
          {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
          <form onSubmit={soumettreUtilisateur}>
            <label style={styles.label}>Prénom</label>
            <input style={styles.input} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />

            <label style={styles.label}>Nom</label>
            <input style={styles.input} value={nom} onChange={(e) => setNom(e.target.value)} required />

            <label style={styles.label}>Téléphone</label>
            <input style={styles.input} value={telephone} onChange={(e) => setTelephone(e.target.value)} required />

            <label style={styles.label}>
              Mot de passe {utilisateurEnEdition ? "(laisser vide pour ne pas changer)" : "temporaire"}
            </label>
            <input
              style={styles.input}
              type="text"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              required={!utilisateurEnEdition}
            />

            <label style={styles.label}>Rôle</label>
            <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r.valeur} value={r.valeur}>{r.label}</option>
              ))}
            </select>

            {role === "apprenant" && (
              <>
                <label style={styles.label}>Rang / Fonction (optionnel)</label>
                <select style={styles.input} value={rang} onChange={(e) => setRang(e.target.value)}>
                  <option value="">— Non précisé —</option>
                  {rangs.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </>
            )}

            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Enregistrement..." : utilisateurEnEdition ? "Enregistrer les modifications" : "Créer l'utilisateur"}
            </button>
          </form>
        </div>

        <div style={{ ...styles.carte, overflowX: "auto" }}>
          <h2 style={styles.titreCarte}>Utilisateurs existants ({utilisateurs.length})</h2>
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : (
            <table style={styles.tableau}>
              <thead>
                <tr>
                  <th style={styles.thNom}>Nom</th>
                  <th style={styles.thEtroit}>Téléphone</th>
                  <th style={styles.thEtroit}>Rôle</th>
                  <th style={styles.thEtroit}>Rang</th>
                  <th style={styles.thAction}></th>
                  <th style={styles.thAction}></th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u._id}>
                    <td style={styles.td}>{u.prenom} {u.nom}</td>
                    <td style={styles.tdEtroit}>{u.telephone}</td>
                    <td style={styles.tdEtroit}>
                      <span style={u.role.includes("admin") ? styles.badgeAdmin : styles.badge}>
                        {libelleRole(u.role)}
                      </span>
                    </td>
                    <td style={styles.tdEtroit}>{u.rang || "—"}</td>
                    <td style={styles.tdAction}>
                      <button onClick={() => commencerEdition(u)} style={styles.boutonModifier}>✏️</button>
                    </td>
                    <td style={styles.tdAction}>
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
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color:"white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonModifier: { padding: "4px 8px", backgroundColor: "#fef9c3", color: "#854d0e", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  boutonSupprimer: { padding: "4px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  lienAnnuler: { background: "none", border: "none", color: "#6b7280", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },
  succes: { backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "13px" },
  tableau: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  thNom: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280", width: "180px" },
  thEtroit: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280", width: "100px" },
  thAction: { padding: "10px", borderBottom: "2px solid #e5e7eb", width: "40px" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tdEtroit: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px", width: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  tdAction: { padding: "10px", borderBottom: "1px solid #f3f4f6", width: "40px", textAlign: "center" },
  badge: { backgroundColor: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" },
  badgeAdmin: { backgroundColor: "#DCE6F1", color: "#1F3864", padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 },
};

