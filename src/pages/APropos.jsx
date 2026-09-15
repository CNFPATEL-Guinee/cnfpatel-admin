import MiseEnPage from "../components/MiseEnPage";

export default function APropos() {
  return (
    <MiseEnPage>
      <div style={styles.conteneur}>
        <div style={styles.enTete}>
          <div style={styles.logo}>🎓</div>
          <h1 style={styles.titre}>CNFPATEL Guinée</h1>
          <p style={styles.sousTitre}>
            Centre National de Formation et de Perfectionnement des
            Administrateurs Territoriaux et Elus Locaux
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.titreSection}>Notre mission</h2>
          <p style={styles.texte}>
            Le CNFPATEL, sous la tutelle du Ministère de l'Administration du
            Territoire et de la Décentralisation (MATD), a pour mission de
            former et de perfectionner les cadres et élus locaux de la
            République de Guinée en gestion administrative, déconcentration
            et décentralisation, déontologie de la fonction d'autorité
            administrative, et leadership et management.
          </p>
        </div>

        <div style={styles.section}>
          <h2 style={styles.titreSection}>Contact</h2>
          <div style={styles.ligneContact}>
            <span>📞</span>
            <span style={styles.labelContact}>Téléphone :</span>
            <span style={styles.valeurContact}>À compléter</span>
          </div>
          <div style={styles.ligneContact}>
            <span>✉️</span>
            <span style={styles.labelContact}>Email :</span>
            <span style={styles.valeurContact}>À compléter</span>
          </div>
          <div style={styles.ligneContact}>
            <span>📍</span>
            <span style={styles.labelContact}>Adresse :</span>
            <span style={styles.valeurContact}>À compléter</span>
          </div>
        </div>

        <p style={styles.version}>Portail administrateur — Version 1.0.0</p>
      </div>
    </MiseEnPage>
  );
}

const styles = {
  conteneur: {
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #e5e7eb",
  },
  enTete: {
    textAlign: "center",
    marginBottom: "28px",
    paddingBottom: "24px",
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    width: "72px",
    height: "72px",
    borderRadius: "16px",
    backgroundColor: "#DCE6F1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    margin: "0 auto 16px",
  },
  titre: {
    color: "#1F3864",
    fontStyle: "italic",
    fontSize: "24px",
    margin: "0 0 8px",
  },
  sousTitre: {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: 0,
  },
  section: {
    marginBottom: "24px",
  },
  titreSection: {
    color: "#1F3864",
    fontSize: "16px",
    fontWeight: 700,
    margin: "0 0 10px",
  },
  texte: {
    color: "#374151",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: 0,
  },
  ligneContact: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 0",
    fontSize: "14px",
  },
  labelContact: {
    fontWeight: 600,
    color: "#374151",
  },
  valeurContact: {
    color: "#6b7280",
  },
  version: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "28px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
};
