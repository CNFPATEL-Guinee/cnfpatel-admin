import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Connexion() {
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const { connecter, erreur, chargement } = useAuth();
  const navigate = useNavigate();

  async function soumettre(e) {
    e.preventDefault();
    const succes = await connecter(telephone, motDePasse);
    if (succes) {
      navigate("/");
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={soumettre} style={styles.carte}>
        <h1 style={styles.titre}>CNFPATEL Guinée</h1>
        <p style={styles.sousTitre}>Portail administrateur</p>

        {erreur && <div style={styles.erreur}>{erreur}</div>}

        <label style={styles.label}>Numéro de téléphone</label>
        <input
          style={styles.input}
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Ex : 622000000"
          required
        />

        <label style={styles.label}>Mot de passe</label>
        <div style={styles.conteneurMotDePasse}>
          <input
            style={styles.inputMotDePasse}
            type={motDePasseVisible ? "text" : "password"}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setMotDePasseVisible(!motDePasseVisible)}
            style={styles.boutonOeil}
            tabIndex={-1}
          >
            {motDePasseVisible ? "🙈" : "👁"}
          </button>
        </div>

        <button style={styles.bouton} disabled={chargement}>
          {chargement ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F7",
    fontFamily: "system-ui, sans-serif",
  },
  carte: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    width: "360px",
  },
  titre: {
    color: "#1F3864",
    textAlign: "center",
    marginBottom: "4px",
    marginTop: 0,
    fontSize: "22px",
    lineHeight: "1.4",
    fontStyle: "italic",
    fontWeight: 700,
  },
  sousTitre: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "14px",
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
  },
  conteneurMotDePasse: {
    position: "relative",
    marginBottom: "16px",
  },
  inputMotDePasse: {
    width: "100%",
    padding: "10px 40px 10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  boutonOeil: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
  },
  bouton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1F3864",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
  },
  erreur: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "16px",
  },
};
