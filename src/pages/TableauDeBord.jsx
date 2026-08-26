import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function TableauDeBord() {
  const [stats, setStats] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/statistiques")
      .then((r) => setStats(r.data))
      .catch(() => setErreur("Impossible de charger les statistiques."));
  }, []);

  const cartes = stats
    ? [
        { label: "Apprenants", valeur: stats.nbApprenants, icone: "🎓", couleur: "#1F3864" },
        { label: "Formateurs", valeur: stats.nbFormateurs, icone: "👨‍🏫", couleur: "#0f766e" },
        { label: "Formations", valeur: stats.nbFormations, icone: "📚", couleur: "#7c3aed" },
        { label: "Classes virtuelles", valeur: stats.nbClassesVirtuelles, icone: "🎥", couleur: "#0369a1" },
        { label: "Certificats délivrés", valeur: stats.nbCertificats, icone: "🏆", couleur: "#b45309" },
        { label: "Quiz passés", valeur: stats.nbQuizPasses, icone: "📝", couleur: "#be123c" },
        { label: "Score moyen", valeur: `${stats.scoreMoyen}%`, icone: "📊", couleur: "#15803d" },
      ]
    : [];

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "8px" }}>Tableau de bord</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Vue d'ensemble du CNFPATEL Guinée.
      </p>

      {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

      {!stats && !erreur && <p style={{ color: "#6b7280" }}>Chargement...</p>}

      <div style={styles.grille}>
        {cartes.map((c) => (
          <div key={c.label} style={styles.carte}>
            <div style={{ ...styles.icone, backgroundColor: c.couleur + "20" }}>
              <span style={{ fontSize: "22px" }}>{c.icone}</span>
            </div>
            <div>
              <p style={styles.valeur}>{c.valeur}</p>
              <p style={styles.label}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </MiseEnPage>
  );
}

const styles = {
  grille: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  carte: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  icone: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  valeur: {
    fontSize: "24px",
    fontWeight: 700,
    margin: 0,
    color: "#111827",
  },
  label: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "2px 0 0",
  },
};

