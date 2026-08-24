import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function EspaceFormateur() {
  const { utilisateur, deconnecter } = useAuth();
  const [classes, setClasses] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get(`/formateur/${utilisateur.id}/classes`)
      .then((r) => setClasses(r.data))
      .catch(() => setErreur("Impossible de charger vos sessions."))
      .finally(() => setChargement(false));
  }, [utilisateur.id]);

  const formatDateHeure = (d) =>
    new Date(d).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });

  const estPassee = (d) => new Date(d) < new Date();

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

      <nav style={styles.nav}>
        <Link to="/formateur" style={styles.lienActif}>Mes sessions</Link>
        <Link to="/formateur/formations" style={styles.lien}>Mes formations</Link>
      </nav>

      <main style={styles.contenu}>
        <h2>Mes sessions à venir</h2>
        {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
        {chargement ? (
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        ) : classes.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucune session ne vous est assignée pour le moment.</p>
        ) : (
          classes.map((c) => (
            <div key={c._id} style={styles.carteSession}>
              <div>
                <strong>{c.titre}</strong>
                <p style={styles.formation}>{c.formationId?.titre}</p>
                <p style={styles.date}>{formatDateHeure(c.dateHeure)}</p>
              </div>
              {estPassee(c.dateHeure) ? (
                <span style={styles.badgeTerminee}>Terminée</span>
              ) : (
                <a href={c.lienDirect} target="_blank" rel="noreferrer" style={styles.boutonRejoindre}>
                  Rejoindre la session
                </a>
              )}
            </div>
          ))
        )}
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
  nav: { display: "flex", gap: "8px", padding: "16px 32px 0" },
  lien: { padding: "10px 16px", textDecoration: "none", color: "#6b7280", fontSize: "14px", borderBottom: "2px solid transparent" },
  lienActif: { padding: "10px 16px", textDecoration: "none", color: "#1F3864", fontWeight: 600, fontSize: "14px", borderBottom: "2px solid #1F3864" },
  contenu: { padding: "24px 32px" },
  carteSession: { backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  formation: { color: "#6b7280", fontSize: "13px", margin: "4px 0" },
  date: { color: "#1F3864", fontSize: "13px", fontWeight: 600, margin: 0 },
  boutonRejoindre: { padding: "10px 18px", backgroundColor: "#1F3864", color: "white", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600 },
  badgeTerminee: { padding: "6px 12px", backgroundColor: "#f3f4f6", color: "#9ca3af", borderRadius: "8px", fontSize: "13px" },
};

