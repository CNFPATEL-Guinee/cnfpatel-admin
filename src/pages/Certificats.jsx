import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Certificats() {
  const [certificats, setCertificats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  async function chargerCertificats() {
    setChargement(true);
    try {
      const r = await api.get("/certificats/tous");
      setCertificats(r.data);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les certificats.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerCertificats();
  }, []);

  async function supprimerCertificat(id) {
    if (!window.confirm("Révoquer ce certificat ? L'apprenant ne le verra plus dans son application.")) return;
    try {
      await api.delete(`/certificats/${id}`);
      await chargerCertificats();
    } catch (e) {
      setErreur("Erreur lors de la révocation du certificat.");
    }
  }

  // Ouvre le PDF officiel du certificat dans un nouvel onglet.
  function telechargerCertificat(id) {
    window.open(`${api.defaults.baseURL}/certificats/${id}/pdf`, "_blank");
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <MiseEnPage>
      <h1 style={{ marginBottom: "8px" }}>Certificats délivrés</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        {certificats.length} certificat(s) délivré(s) sur l'ensemble de la plateforme.
      </p>

      {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

      <div style={styles.carte}>
        {chargement ? (
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        ) : certificats.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucun certificat délivré pour le moment.</p>
        ) : (
          <table style={styles.tableau}>
            <thead>
              <tr>
                <th style={styles.th}>Apprenant</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Formation</th>
                <th style={styles.th}>Date de délivrance</th>
                <th style={styles.th}></th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {certificats.map((c) => (
                <tr key={c._id}>
                  <td style={styles.td}>
                    {c.utilisateurId?.prenom} {c.utilisateurId?.nom}
                  </td>
                  <td style={styles.td}>{c.utilisateurId?.telephone}</td>
                  <td style={styles.td}>{c.formationId?.titre}</td>
                  <td style={styles.td}>{formatDate(c.createdAt)}</td>
                  <td style={styles.td}>
                    <button onClick={() => telechargerCertificat(c._id)} style={styles.boutonVoir}>📄 PDF</button>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => supprimerCertificat(c._id)} style={styles.boutonSupprimer}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MiseEnPage>
  );
}

const styles = {
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  tableau: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
  boutonVoir: { padding: "4px 10px", backgroundColor: "#DCE6F1", color: "#1F3864", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
};
