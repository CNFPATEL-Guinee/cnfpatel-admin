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
  const [quizEnEdition, setQuizEnEdition] = useState(false);

  const [texteQuestion, setTexteQuestion] = useState("");
  const [choix, setChoix] = useState([
    { texte: "", estCorrect: true },
    { texte: "", estCorrect: false },
  ]);
  const [questionEnEdition, setQuestionEnEdition] = useState(null);

  async function chargerTout() {
    setChargement(true);
    try {
      const repQuiz = await api.get(`/modules/${id}/quiz`);
      setQuiz(repQuiz.data);
      if (repQuiz.data.length > 0) {
        // Route admin : montre aussi la bonne reponse, necessaire pour modifier.
        const repQuestions = await api.get(`/quiz/${repQuiz.data[0]._id}/questions/admin`);
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

  function commencerEditionQuiz() {
    setTitreQuiz(quiz[0].titre);
    setSeuil(quiz[0].seuilReussite);
    setQuizEnEdition(true);
  }

  async function soumettreQuiz(e) {
    e.preventDefault();
    try {
      if (quizEnEdition) {
        await api.patch(`/modules/${id}/quiz/${quiz[0]._id}`, { titre: titreQuiz, seuilReussite: Number(seuil) });
        setQuizEnEdition(false);
      } else {
        await api.post(`/modules/${id}/quiz`, { titre: titreQuiz, seuilReussite: Number(seuil) });
      }
      setTitreQuiz("");
      await chargerTout();
    } catch (e) {
      setErreur(quizEnEdition ? "Erreur lors de la modification du quiz." : "Erreur lors de la création du quiz.");
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

  function reinitialiserFormQuestion() {
    setTexteQuestion("");
    setChoix([{ texte: "", estCorrect: true }, { texte: "", estCorrect: false }]);
    setQuestionEnEdition(null);
  }

  function commencerEditionQuestion(q) {
    setQuestionEnEdition(q._id);
    setTexteQuestion(q.texte);
    setChoix(q.choix.map((c) => ({ texte: c.texte, estCorrect: c.estCorrect })));
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  function supprimerChoix(index) {
    if (choix.length <= 2) return; // toujours garder au moins 2 choix
    const nouveauxChoix = choix.filter((_, i) => i !== index);
    if (!nouveauxChoix.some((c) => c.estCorrect)) nouveauxChoix[0].estCorrect = true;
    setChoix(nouveauxChoix);
  }

  async function soumettreQuestion(e) {
    e.preventDefault();
    try {
      if (questionEnEdition) {
        await api.patch(`/quiz/${quiz[0]._id}/questions/${questionEnEdition}`, {
          texte: texteQuestion,
          choix,
        });
      } else {
        await api.post(`/quiz/${quiz[0]._id}/questions`, {
          texte: texteQuestion,
          ordre: questions.length + 1,
          choix,
        });
      }
      reinitialiserFormQuestion();
      await chargerTout();
    } catch (e) {
      setErreur(questionEnEdition ? "Erreur lors de la modification de la question." : "Erreur lors de l'ajout de la question.");
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
          <form onSubmit={soumettreQuiz}>
            <label style={styles.label}>Titre du quiz</label>
            <input style={styles.input} value={titreQuiz} onChange={(e) => setTitreQuiz(e.target.value)} required />
            <label style={styles.label}>Seuil de réussite (%)</label>
            <input style={styles.input} type="number" min="0" max="100" value={seuil} onChange={(e) => setSeuil(e.target.value)} />
            <button style={styles.bouton}>Créer le quiz</button>
          </form>
        </div>
      ) : (
        <>
          <div style={styles.carte}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ ...styles.titreCarte, marginBottom: 0 }}>
                {quizEnEdition ? "Modifier le quiz" : `${quiz[0].titre} (seuil ${quiz[0].seuilReussite}%)`}
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                {!quizEnEdition && (
                  <button onClick={commencerEditionQuiz} style={styles.boutonModifier}>✏️ Modifier</button>
                )}
                <button onClick={supprimerQuiz} style={styles.boutonSupprimerQuiz}>🗑 Supprimer le quiz</button>
              </div>
            </div>
            {quizEnEdition && (
              <form onSubmit={soumettreQuiz}>
                <label style={styles.label}>Titre du quiz</label>
                <input style={styles.input} value={titreQuiz} onChange={(e) => setTitreQuiz(e.target.value)} required />
                <label style={styles.label}>Seuil de réussite (%)</label>
                <input style={styles.input} type="number" min="0" max="100" value={seuil} onChange={(e) => setSeuil(e.target.value)} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={styles.bouton}>Enregistrer</button>
                  <button type="button" onClick={() => setQuizEnEdition(false)} style={styles.boutonSecondaire}>Annuler</button>
                </div>
              </form>
            )}
          </div>

          <div style={styles.grille}>
            <div style={styles.carte}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 style={{ ...styles.titreCarte, marginBottom: 0 }}>
                  {questionEnEdition ? "Modifier la question" : "Nouvelle question"}
                </h2>
                {questionEnEdition && (
                  <button onClick={reinitialiserFormQuestion} style={styles.lienAnnuler}>Annuler</button>
                )}
              </div>
              <form onSubmit={soumettreQuestion}>
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
                    {choix.length > 2 && (
                      <button type="button" onClick={() => supprimerChoix(i)} style={styles.boutonRetirerChoix}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={ajouterChoix} style={styles.boutonSecondaire}>
                  + Ajouter un choix
                </button>

                <button style={{ ...styles.bouton, marginTop: "12px" }}>
                  {questionEnEdition ? "Enregistrer les modifications" : "Ajouter la question"}
                </button>
              </form>
            </div>

            <div style={styles.carte}>
              <h2 style={styles.titreCarte}>{questions.length} question(s)</h2>
              <div style={styles.zoneDefilementQuestions}>
              {questions.length === 0 ? (
                <p style={{ color: "#6b7280" }}>Aucune question pour le moment.</p>
              ) : (
                questions.map((q, i) => (
                  <div key={q._id} style={styles.blocQuestion}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                      <strong>{i + 1}. {q.texte}</strong>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => commencerEditionQuestion(q)} style={styles.boutonModifier}>✏️</button>
                        <button onClick={() => supprimerQuestion(q._id)} style={styles.boutonSupprimer}>🗑</button>
                      </div>
                    </div>
                    <ul style={styles.listeChoix}>
                      {q.choix.map((c) => (
                        <li key={c._id} style={c.estCorrect ? styles.choixCorrect : undefined}>
                          {c.texte} {c.estCorrect && "✓"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )) )}
              </div>
            </div>
          </div>
        </>
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
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color:"white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonSecondaire: { width: "100%", padding: "8px", backgroundColor: "transparent", color: "#1F3864", border: "1px dashed #1F3864", borderRadius: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "8px" },
  boutonSupprimerQuiz: { padding: "6px 12px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  boutonModifier: { padding: "4px 10px", backgroundColor: "#fef9c3", color: "#854d0e", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  boutonRetirerChoix: { padding: "4px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  lienAnnuler: { background: "none", border: "none", color: "#6b7280", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },
  ligneChoix: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" },
  inputChoix: { flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" },
  blocQuestion: { padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", marginBottom: "12px" },
  listeChoix: { marginTop: "8px", marginBottom: 0, fontSize: "13px", color: "#4b5563" },
  choixCorrect: { color: "#15803d", fontWeight: 600 },
  zoneDefilementQuestions: { maxHeight: "520px", overflowY: "auto", paddingRight: "6px" },
};

