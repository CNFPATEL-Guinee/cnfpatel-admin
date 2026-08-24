import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function FormationsFormateur() {
  const { utilisateur, deconnecter } = useAuth();
  const [formations, setFormations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/formations")
      .then((r) => setFormations(r.data))
      .catch(() => setErreur("Impossible de charger les formations."))
      .finally(() => setChargement(false));
  }, []);

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
        <Link to="/formateur" style={styles.lien}>Mes sessions</Link>
        <Link to="/formateur/formations" style={styles.lienActif}>Mes formations</Link>
      </nav>

      <main style={styles.contenu}>
        <h2>Formations</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "-8px" }}>
          Cliquez sur une formation pour y ajouter des cours (vidéos, documents).
        </p>
        {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
        {chargement ? (
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        ) : (
          <div style={styles.grille}>
            {formations.map((f) => (
              <Link key={f._id} to={`/formateur/formations/${f._id}`} style={styles.carteFormation}>
                <strong>{f.titre}</strong>
                <p style={{ color: "#6b7280", fontSize: "13px", margin: "6px 0 0" }}>{f.description}</p>
              </Link>
            ))}
          </div>
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
  grille: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", marginTop: "16px" },
  carteFormation: { backgroundColor: "white", borderRadius: "12px", padding: "20px", textDecoration: "none", color: "#1F3864", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", display: "block" },
};

