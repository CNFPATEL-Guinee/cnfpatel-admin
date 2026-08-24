import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function Presences() {
  const { classeId } = useParams();
  const [presences, setPresences] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    api.get(`/presences/${classeId}`)
      .then((r) => setPresences(r.data))
      .catch(() => setErreur("Impossible de charger les présences."))
      .finally(() => setChargement(false));
  }, [classeId]);

  const formatDateHeure = (d) =>
    new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <MiseEnPage>
      <Link to="/formations" style={styles.retour}>← Retour aux formations</Link>
      <h1 style={{ marginTop: "12px" }}>Présences à la session</h1>
      <p style={{ color: "#6b7280", marginBottom: "24px" }}>
        Enregistrées automatiquement quand l'apprenant clique sur "Rejoindre" dans l'application.
      </p>

      {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

      <div style={styles.carte}>
        {chargement ? (
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        ) : presences.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucun apprenant n'a encore rejoint cette session.</p>
        ) : (
          <table style={styles.tableau}>
            <thead>
              <tr>
                <th style={styles.th}>Apprenant</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>A rejoint le</th>
              </tr>
            </thead>
            <tbody>
              {presences.map((p) => (
                <tr key={p._id}>
                  <td style={styles.td}>{p.utilisateurId?.prenom} {p.utilisateurId?.nom}</td>
                  <td style={styles.td}>{p.utilisateurId?.telephone}</td>
                  <td style={styles.td}>{formatDateHeure(p.createdAt)}</td>
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
  retour: { color: "#6b7280", textDecoration: "none", fontSize: "13px" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  tableau: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
};
