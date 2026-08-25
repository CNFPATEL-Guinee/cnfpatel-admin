import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";

export default function MiseEnPage({ children }) {
  const { utilisateur, deconnecter } = useAuth();
  const location = useLocation();
  const estMobile = useIsMobile();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const liens = [
    { chemin: "/", label: "Tableau de bord", icone: "📊" },
    { chemin: "/formations", label: "Formations", icone: "📚" },
    { chemin: "/utilisateurs", label: "Utilisateurs", icone: "👥" },
    { chemin: "/formateurs", label: "Formateurs", icone: "🎓" },
    { chemin: "/certificats", label: "Certificats", icone: "🏆" },
    { chemin: "/notifications", label: "Notifications", icone: "🔔" },
  ];

  const menuVisible = !estMobile || menuOuvert;

  return (
    <div style={styles.conteneur(estMobile)}>
      {estMobile && (
        <div style={styles.barreMobile}>
          <span style={styles.titreMobile}>CNFPATEL Guinée</span>
          <button onClick={() => setMenuOuvert(!menuOuvert)} style={styles.boutonHamburger}>
            {menuOuvert ? "✕" : "☰"}
          </button>
        </div>
      )}

      {menuVisible && (
        <aside style={styles.menu(estMobile)}>
          {!estMobile && (
            <div style={styles.enTeteMenu}>
              <h2 style={styles.titreMenu}>CNFPATEL Guinée</h2>
              <p style={styles.sousTitreMenu}>Portail administrateur</p>
            </div>
          )}

          <nav style={styles.nav}>
            {liens.map((lien) => (
              <Link
                key={lien.chemin}
                to={lien.chemin}
                onClick={() => setMenuOuvert(false)}
                style={{
                  ...styles.lien,
                  ...(location.pathname === lien.chemin ? styles.lienActif : {}),
                }}
              >
                <span>{lien.icone}</span> {lien.label}
              </Link>
            ))}
          </nav>

          <div style={styles.bas}>
            <p style={styles.nomUtilisateur}>
              {utilisateur?.prenom} {utilisateur?.nom}
            </p>
            <button onClick={deconnecter} style={styles.boutonDeconnexion}>
              Se déconnecter
            </button>
          </div>
        </aside>
      )}

      <main style={styles.contenu(estMobile)}>{children}</main>
    </div>
  );
}

const styles = {
  conteneur: (mobile) => ({
    display: "flex",
    flexDirection: mobile ? "column" : "row",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#F3F4F7",
  }),
  barreMobile: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "white",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  titreMobile: { color: "#1F3864", fontWeight: 700, fontStyle: "italic", fontSize: "16px" },
  boutonHamburger: { background: "none", border: "none", fontSize: "22px", cursor: "pointer", padding: "4px 8px" },
  menu: (mobile) => ({
    width: mobile ? "100%" : "240px",
    backgroundColor: "white",
    borderRight: mobile ? "none" : "1px solid #e5e7eb",
    borderBottom: mobile ? "1px solid #e5e7eb" : "none",
    display: "flex",
    flexDirection: "column",
    padding: mobile ? "8px 0" : "20px 0",
  }),
  enTeteMenu: {
    padding: "0 20px 20px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "16px",
  },
  titreMenu: {
    color: "#1F3864",
    margin: 0,
    fontSize: "18px",
    fontStyle: "italic",
  },
  sousTitreMenu: {
    color: "#6b7280",
    margin: "2px 0 0",
    fontSize: "12px",
  },
  nav: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "0 12px",
  },
  lien: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "8px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "14px",
  },
  lienActif: {
    backgroundColor: "#DCE6F1",
    color: "#1F3864",
    fontWeight: 600,
  },
  bas: {
    padding: "16px 20px 0",
    borderTop: "1px solid #e5e7eb",
    marginTop: "12px",
  },
  nomUtilisateur: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    margin: "0 0 8px",
  },
  boutonDeconnexion: {
    width: "100%",
    padding: "8px",
    backgroundColor: "transparent",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  contenu: (mobile) => ({
    flex: 1,
    padding: mobile ? "16px" : "32px",
    minWidth: 0,
  }),
};
