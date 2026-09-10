import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function QuestionsFormateur() {
  const { utilisateur, deconnecter } = useAuth();
  const [formationsAssignees, setFormationsAssignees] = useState([]);
  const [questionsParFormation, setQuestionsParFormation] = useState({});
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [reponseEnCours, setReponseEnCours] = useState({});
  const [envoi, setEnvoi] = useState(null);

  async function chargerTout() {
    setChargement(true);
    try {
      const repFormations = await api.get("/formations");
      // Seules les formations dont ce formateur est responsable.
      const assignees = repFormations.data.filter((f) => f.formateurId === utilisateur.id);
      setFormationsAssignees(assignees);

      const questionsMap = {};
      for (const f of assignees) {
        const repQuestions = await api.get(`/formations/${f._id}/questions`);
        questionsMap[f._id] = repQuestions.data;
      }
      setQuestionsParFormation(questionsMap);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les questions.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerTout();
  }, []);

  async function envoyerReponse(formationId, questionId) {
    const texte = (reponseEnCours[questionId] || "").trim();
    if (!texte) return;
    setEnvoi(questionId);
    try {
      await api.post(`/formations/${formationId}/questions/${questionId}/reponses`, { texte });
      setReponseEnCours((prev) => ({ ...prev, [questionId]: "" }));
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de l'envoi de la réponse.");
    } finally {
      setEnvoi(null);
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

  const totalQuestions = Object.values(questionsParFormation).reduce((acc, l) => acc + l.length, 0);

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
        <Link to="/formateur/formations" style={styles.lien}>Mes formations</Link>
        <Link to="/formateur/questions" style={styles.lienActif}>Questions</Link>
      </nav>

      <main style={styles.contenu}>
        <h2>Questions des apprenants</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "-8px" }}>
          {totalQuestions} question(s) sur vos formations assignées.
        </p>
        {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

        {chargement ? (
          <p style={{ color: "#6b7280" }}>Chargement...</p>
        ) : formationsAssignees.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aucune formation ne vous est assignée pour le moment.</p>
        ) : (
          formationsAssignees.map((f) => (
            <div key={f._id} style={{ marginBottom: "28px" }}>
              <h3 style={styles.titreFormation}>{f.titre}</h3>
              {questionsParFormation[f._id]?.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: "13px" }}>Aucune question pour cette formation.</p>
              ) : (
                questionsParFormation[f._id]?.map((q) => (
                  <div key={q._id} style={styles.carteQuestion}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "14px" }}>{q.utilisateurId?.prenom} {q.utilisateurId?.nom}</strong>
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>{formatDate(q.createdAt)}</span>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: "14px" }}>{q.texte}</p>

                    {q.reponses?.map((r) => (
                      <div key={r._id} style={styles.blocReponse}>
                        <strong style={{ fontSize: "12px", color: "#1F3864" }}>Vous</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "13px" }}>{r.texte}</p>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <input
                        style={styles.inputReponse}
                        placeholder="Votre réponse..."
                        value={reponseEnCours[q._id] || ""}
                        onChange={(e) => setReponseEnCours((prev) => ({ ...prev, [q._id]: e.target.value }))}
                      />
                      <button
                        onClick={() => envoyerReponse(f._id, q._id)}
                        style={styles.boutonRepondre}
                        disabled={envoi === q._id}
                      >
                        {envoi === q._id ? "..." : "Répondre"}
                      </button>
                    </div>
                  </div>
                ))
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
  titreFormation: { fontSize: "15px", color: "#1F3864", marginBottom: "10px" },
  carteQuestion: { backgroundColor: "white", borderRadius: "10px", padding: "16px", marginBottom: "10px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  blocReponse: { backgroundColor: "#F3F4F7", borderRadius: "8px", padding: "8px 10px", marginBottom: "6px" },
  inputReponse: { flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" },
  boutonRepondre: { padding: "8px 14px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
};
