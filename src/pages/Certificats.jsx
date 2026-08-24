import { useEffect, useState } from "react";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Certificats() {
  const [certificats, setCertificats] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get("/certificats/tous")
      .then((r) => setCertificats(r.data))
      .catch(() => setErreur("Impossible de charger les certificats."))
      .finally(() => setChargement(false));
  }, []);

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
};
