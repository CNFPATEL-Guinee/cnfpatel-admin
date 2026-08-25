import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import { useIsMobile } from "../hooks/useIsMobile";
import api from "../api/client";

export default function Formations() {
  const estMobile = useIsMobile();
  const [formations, setFormations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

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

  async function creerFormation(e) {
    e.preventDefault();
    setEnregistrement(true);
    try {
      await api.post("/formations", { titre, description });
      setTitre("");
      setDescription("");
      await chargerFormations();
    } catch (e) {
      setErreur("Erreur lors de la création de la formation.");
    } finally {
      setEnregistrement(false);
    }
  }

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "24px" }}>Formations</h1>

      <div style={styles.grille(estMobile)}>
        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Nouvelle formation</h2>
          <form onSubmit={creerFormation}>
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
            <button style={styles.bouton} disabled={enregistrement}>
              {enregistrement ? "Création..." : "Créer la formation"}
            </button>
          </form>
        </div>

        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Formations existantes</h2>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "-8px" }}>
            Cliquez sur une formation pour gérer ses modules et cours.
          </p>
          {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : formations.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Aucune formation pour le moment.</p>
          ) : estMobile ? (
            <div>
              {formations.map((f) => (
                <Link key={f._id} to={`/formations/${f._id}`} style={styles.carteFormationMobile}>
                  <strong>{f.titre}</strong>
                  <span style={styles.portee}>{f.regionId ? "Régionale" : "Nationale"}</span>
                </Link>
              ))}
            </div>
          ) : (
            <table style={styles.tableau}>
              <thead>
                <tr>
                  <th style={styles.th}>Titre</th>
                  <th style={styles.th}>Portée</th>
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
                    <td style={styles.td}>{f.regionId ? "Régionale" : "Nationale"}</td>
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
    gap: "4px",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    marginBottom: "10px",
    textDecoration: "none",
    color: "#1F3864",
  },
  portee: {
    fontSize: "12px",
    color: "#6b7280",
  },
};
