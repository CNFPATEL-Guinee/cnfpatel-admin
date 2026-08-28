import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import { useIsMobile } from "../hooks/useIsMobile";
import api from "../api/client";

const rangs = ["Prefet", "Sous-prefet", "Secretaire-general", "Maire", "Chef-cabinet"];

export default function Formations() {
  const estMobile = useIsMobile();
  const [formations, setFormations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [rangCible, setRangCible] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const [formationEnEdition, setFormationEnEdition] = useState(null);

  async function chargerFormations() {
    setChargement(true);
    try {
      const reponse = await api.get("/formations");
      setFormations(reponse.data);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les formations. Vérifiez votre connexion.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerFormations();
  }, []);

  function reinitialiserForm() {
    setTitre("");
    setDescription("");
    setRangCible("");
    setFormationEnEdition(null);
  }

  function commencerEdition(f) {
    setFormationEnEdition(f._id);
    setTitre(f.titre);
    setDescription(f.description || "");
    setRangCible(f.rangCible || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function soumettreFormation(e) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const donnees = { titre, description, rangCible: rangCible || null };
      if (formationEnEdition) {
        await api.patch(`/formations/${formationEnEdition}`, donnees);
      } else {
        await api.post("/formations", donnees);
      }
      reinitialiserForm();
      await chargerFormations();
    } catch (e) {
      setErreur(
        formationEnEdition
          ? "Erreur lors de la modification de la formation."
          : "Erreur lors de la création de la formation."
      );
    } finally {
      setEnregistrement(false);
    }
  }

  async function supprimerFormation(id) {
    if (!window.confirm("Supprimer cette formation et tout son contenu (modules, cours, quiz) ? Cette action est irréversible.")) return;
    try {
      await api.delete(`/formations/${id}`);
      await chargerFormations();
    } catch (e) {
      setErreur("Erreur lors de la suppression de la formation.");
    }
  }

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "24px" }}>Formations</h1>

      <div style={styles.grille(estMobile)}>
        <div style={styles.carte}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ ...styles.titreCarte, marginBottom: 0 }}>
              {formationEnEdition ? "Modifier la formation" : "Nouvelle formation"}
            </h2>
            {formationEnEdition && (
              <button onClick={reinitialiserForm} style={styles.lienAnnuler}>Annuler</button>
            )}
          </div>
          <form onSubmit={soumettreFormation}>
            <label style={styles.label}>Titre</label>
            <input
              style={styles.input}
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
            />
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, height: "80px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label style={styles.label}>Rang cible (optionnel)</label>
            <select style={styles.input} value={rangCible} onChange={(e) => setRangCible(e.target.value)}>
              <option value="">— Accessible à tous les rangs —</option>
              {rangs.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Enregistrement..." : formationEnEdition ? "Enregistrer les modifications" : "Créer la formation"}
            </button>
          </form>
        </div>

        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Formations existantes</h2>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "-8px" }}>
            Cliquez sur le titre pour gérer ses modules et cours.
          </p>
          {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : formations.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Aucune formation pour le moment.</p>
          ) : estMobile ? (
            <div>
              {formations.map((f) => (
                <div key={f._id} style={styles.carteFormationMobile}>
                  <Link to={`/formations/${f._id}`} style={{ textDecoration: "none", color: "#1F3864" }}>
                    <strong>{f.titre}</strong>
                  </Link>
                  <span style={styles.portee}>{f.rangCible || "Tous les rangs"}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => commencerEdition(f)} style={styles.boutonModifier}>✏️ Modifier</button>
                    <button onClick={() => supprimerFormation(f._id)} style={styles.boutonSupprimer}>🗑 Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table style={styles.tableau}>
              <thead>
                <tr>
                  <th style={styles.th}>Titre</th>
                  <th style={styles.th}>Rang cible</th>
                  <th style={styles.th}></th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => (
                  <tr key={f._id}>
                    <td style={styles.td}>
                      <Link to={`/formations/${f._id}`} style={styles.lienLigne}>
                        {f.titre}
                      </Link>
                    </td>
                    <td style={styles.td}>{f.rangCible || "Tous les rangs"}</td>
                    <td style={styles.td}>
                      <button onClick={() => commencerEdition(f)} style={styles.boutonModifier}>✏️</button>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => supprimerFormation(f._id)} style={styles.boutonSupprimer}>🗑</button>
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
  grille: (mobile) => ({
    display: "grid",
    gridTemplateColumns: mobile ? "1fr" : "360px 1fr",
    gap: "24px",
    alignItems: "start",
  }),
  carte: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  titreCarte: {
    fontSize: "16px",
    marginTop: 0,
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  bouton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#1F3864",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  boutonModifier: {
    padding: "4px 10px",
    backgroundColor: "#fef9c3",
    color: "#854d0e",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  boutonSupprimer: {
    padding: "4px 10px",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  },
  lienAnnuler: { background: "none", border: "none", color: "#6b7280", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },
  tableau: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    borderBottom: "2px solid #e5e7eb",
    fontSize: "13px",
    color: "#6b7280",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
  },
  lienLigne: {
    color: "#1F3864",
    fontWeight: 600,
    textDecoration: "none",
  },
  carteFormationMobile: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "10px",
  },
  portee: {
    fontSize: "12px",
    color: "#6b7280",
  },
};
