import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import api from "../api/client";

export default function DetailQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [titreQuiz, setTitreQuiz] = useState("");
  const [seuil, setSeuil] = useState(50);

  const [texteQuestion, setTexteQuestion] = useState("");
  const [choix, setChoix] = useState([
    { texte: "", estCorrect: true },
    { texte: "", estCorrect: false },
  ]);

  async function chargerTout() {
    setChargement(true);
    try {
      const repQuiz = await api.get(`/modules/${id}/quiz`);
      setQuiz(repQuiz.data);
      if (repQuiz.data.length > 0) {
        const repQuestions = await api.get(`/quiz/${repQuiz.data[0]._id}/questions`);
        setQuestions(repQuestions.data);
      }
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger le quiz.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerTout();
  }, [id]);

  async function creerQuiz(e) {
    e.preventDefault();
    try {
      await api.post(`/modules/${id}/quiz`, { titre: titreQuiz, seuilReussite: Number(seuil) });
      setTitreQuiz("");
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la création du quiz.");
    }
  }

  async function supprimerQuiz() {
    if (!window.confirm("Supprimer ce quiz et toutes ses questions ? Les résultats déjà passés par les apprenants seront aussi effacés.")) return;
    try {
      await api.delete(`/modules/${id}/quiz/${quiz[0]._id}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression du quiz.");
    }
  }

  async function supprimerQuestion(questionId) {
    if (!window.confirm("Supprimer cette question ?")) return;
    try {
      await api.delete(`/quiz/${quiz[0]._id}/questions/${questionId}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression de la question.");
    }
  }

  function modifierChoix(index, champ, valeur) {
    const nouveauxChoix = [...choix];
    if (champ === "estCorrect") {
      nouveauxChoix.forEach((c, i) => (c.estCorrect = i === index));
    } else {
      nouveauxChoix[index][champ] = valeur;
    }
    setChoix(nouveauxChoix);
  }

  function ajouterChoix() {
    setChoix([...choix, { texte: "", estCorrect: false }]);
  }

  async function creerQuestion(e) {
    e.preventDefault();
    try {
      await api.post(`/quiz/${quiz[0]._id}/questions`, {
        texte: texteQuestion,
        ordre: questions.length + 1,
        choix,
      });
      setTexteQuestion("");
      setChoix([{ texte: "", estCorrect: true }, { texte: "", estCorrect: false }]);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de l'ajout de la question.");
    }
  }

  return (
    <MiseEnPage>
      <Link to="/formations" style={styles.retour}>← Retour aux formations</Link>
      <h1 style={{ marginTop: "12px" }}>Quiz du module</h1>
      {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

      {chargement ? (
        <p style={{ color: "#6b7280" }}>Chargement...</p>
      ) : quiz.length === 0 ? (
        <div style={styles.carte}>
          <h2 style={styles.titreCarte}>Créer le quiz de ce module</h2>
          <form onSubmit={creerQuiz}>
            <label style={styles.label}>Titre du quiz</label>
            <input style={styles.input} value={titreQuiz} onChange={(e) => setTitreQuiz(e.target.value)} required />
            <label style={styles.label}>Seuil de réussite (%)</label>
            <input style={styles.input} type="number" min="0" max="100" value={seuil} onChange={(e) => setSeuil(e.target.value)} />
            <button style={styles.bouton}>Créer le quiz</button>
          </form>
        </div>
      ) : (
        <div style={styles.grille}>
          <div style={styles.carte}>
            <h2 style={styles.titreCarte}>Nouvelle question</h2>
            <form onSubmit={creerQuestion}>
              <label style={styles.label}>Question</label>
              <input style={styles.input} value={texteQuestion} onChange={(e) => setTexteQuestion(e.target.value)} required />

              <label style={styles.label}>Choix de réponse (cochez le bon)</label>
              {choix.map((c, i) => (
                <div key={i} style={styles.ligneChoix}>
                  <input
                    type="radio"
                    checked={c.estCorrect}
                    onChange={() => modifierChoix(i, "estCorrect", true)}
                  />
                  <input
                    style={styles.inputChoix}
                    value={c.texte}
                    onChange={(e) => modifierChoix(i, "texte", e.target.value)}
                    placeholder={`Choix ${i + 1}`}
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={ajouterChoix} style={styles.boutonSecondaire}>
                + Ajouter un choix
              </button>

              <button style={{ ...styles.bouton, marginTop: "12px" }}>Ajouter la question</button>
            </form>
          </div>

          <div style={styles.carte}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ ...styles.titreCarte, marginBottom: 0 }}>{quiz[0].titre} — {questions.length} question(s)</h2>
              <button onClick={supprimerQuiz} style={styles.boutonSupprimerQuiz}>🗑 Supprimer le quiz</button>
            </div>
            {questions.length === 0 ? (
              <p style={{ color: "#6b7280" }}>Aucune question pour le moment.</p>
            ) : (
              questions.map((q, i) => (
                <div key={q._id} style={styles.blocQuestion}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <strong>{i + 1}. {q.texte}</strong>
                    <button onClick={() => supprimerQuestion(q._id)} style={styles.boutonSupprimer}>🗑</button>
                  </div>
                  <ul style={styles.listeChoix}>
                    {q.choix.map((c) => (
                      <li key={c._id}>{c.texte}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </MiseEnPage>
  );
}

const styles = {
  retour: { color: "#6b7280", textDecoration: "none", fontSize: "13px" },
  grille: { display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px", alignItems: "start", marginTop: "20px" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginTop: "20px" },
  titreCarte: { fontSize: "16px", marginTop: 0, marginBottom: "16px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonSecondaire: { width: "100%", padding: "8px", backgroundColor: "transparent", color: "#1F3864", border: "1px dashed #1F3864", borderRadius: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "8px" },
  boutonSupprimerQuiz: { padding: "6px 12px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  ligneChoix: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  inputChoix: { flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" },
  blocQuestion: { padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", marginBottom: "12px" },
  listeChoix: { marginTop: "8px", marginBottom: 0, fontSize: "13px", color: "#4b5563" },
};
