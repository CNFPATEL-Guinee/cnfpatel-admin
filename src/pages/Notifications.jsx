import { useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Notifications() {
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);

  async function envoyer(e) {
    e.preventDefault();
    setEnvoi(true);
    setMessage(null);
    setErreur(null);
    try {
      const reponse = await api.post("/notifications/diffuser", { contenu });
      setMessage(reponse.data.message);
      setContenu("");
    } catch (e) {
      setErreur("Erreur lors de l'envoi de la notification.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "8px" }}>Notifications</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Envoyer une annonce à tous les apprenants de la plateforme.
      </p>

      <div style={styles.carte}>
        {message && <p style={styles.succes}>{message}</p>}
        {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}
        <form onSubmit={envoyer}>
          <label style={styles.label}>Message de l'annonce</label>
          <textarea
            style={{ ...styles.input, height: "100px", resize: "vertical" }}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Ex : Une nouvelle formation sur la gestion budgétaire est disponible."
            required
          />
          <button style={styles.bouton} disabled={envoi}>
            {envoi ? "Envoi..." : "Envoyer à tous les apprenants"}
          </button>
        </form>
      </div>
    </MiseEnPage>
  );
}

const styles = {
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", maxWidth: "500px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  succes: { backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "13px" },
};
