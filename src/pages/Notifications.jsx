import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Notifications() {
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);

  const [historique, setHistorique] = useState([]);
  const [chargement, setChargement] = useState(true);

  async function chargerHistorique() {
    setChargement(true);
    try {
      const r = await api.get("/notifications/admin/historique");
      setHistorique(r.data);
    } catch (e) {
      setErreur("Impossible de charger l'historique des notifications.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerHistorique();
  }, []);

  async function envoyer(e) {
    e.preventDefault();
    setEnvoi(true);
    setMessage(null);
    setErreur(null);
    try {
      const reponse = await api.post("/notifications/diffuser", { contenu });
      setMessage(reponse.data.message);
      setContenu("");
      await chargerHistorique();
    } catch (e) {
      setErreur("Erreur lors de l'envoi de la notification.");
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimerDiffusion(lotId) {
    if (!window.confirm("Supprimer cette notification pour tous les destinataires ?")) return;
    try {
      await api.delete(`/notifications/admin/historique/${lotId}`);
      await chargerHistorique();
    } catch (e) {
      setErreur("Erreur lors de la suppression.");
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "8px" }}>Notifications</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Envoyer une annonce à tous les apprenants de la plateforme.
      </p>

      <div style={styles.grille}>
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

        <div style={{ ...styles.carte, overflowX: "auto" }}>
          <h2 style={{ marginTop: 0, fontSize: "16px" }}>Historique des annonces</h2>
          {chargement ? (
            <p style={{ color: "#6b7280" }}>Chargement...</p>
          ) : historique.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Aucune annonce envoyée pour le moment.</p>
          ) : (
            <div style={styles.zoneDefilementVertical}>
              <table style={styles.tableau}>
                <thead>
                  <tr>
                    <th style={styles.thMessage}>Message</th>
                    <th style={styles.thEtroit}>Destinataires</th>
                    <th style={styles.thEtroit}>Date</th>
                    <th style={styles.thAction}></th>
                  </tr>
                </thead>
                <tbody>
                  {historique.map((h) => (
                    <tr key={h._id}>
                      <td style={styles.tdMessage}>{h.contenu}</td>
                      <td style={styles.tdEtroit}>{h.nbDestinataires}</td>
                      <td style={styles.tdEtroit}>{formatDate(h.createdAt)}</td>
                      <td style={styles.tdAction}>
                        <button onClick={() => supprimerDiffusion(h._id)} style={styles.boutonSupprimer}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MiseEnPage>
  );
}

const styles = {
  grille: { display: "grid", gridTemplateColumns: "500px 1fr", gap: "24px", alignItems: "start" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box", fontFamily: "inherit" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color:"white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  succes: { backgroundColor: "#f0fdf4", color: "#15803d", padding: "10px", borderRadius: "8px", fontSize: "13px" },
  zoneDefilementVertical: { maxHeight: "480px", overflowY: "auto" },
  tableau: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  thMessage: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280", width: "260px" },
  thEtroit: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280", width: "110px" },
  thAction: { padding: "10px", borderBottom: "2px solid #e5e7eb", width: "40px" },
  tdMessage: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" },
  tdEtroit: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
  tdAction: { padding: "10px", borderBottom: "1px solid #f3f4f6", width: "40px", textAlign: "center" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
};
