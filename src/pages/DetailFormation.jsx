import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MiseEnPage from "../components/MiseEnPage";
import LecteurVideoModal from "../components/LecteurVideoModal";
import api from "../api/client";

export default function DetailFormation() {
  const { id } = useParams();
  const [modules, setModules] = useState([]);
  const [coursParModule, setCoursParModule] = useState({});
  const [classes, setClasses] = useState([]);
  const [enregistrements, setEnregistrements] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [videoEnPreview, setVideoEnPreview] = useState(null);

  const [titreModule, setTitreModule] = useState("");
  const [ordreModule, setOrdreModule] = useState(1);

  const [titreClasse, setTitreClasse] = useState("");
  const [dateHeure, setDateHeure] = useState("");
  const [lienDirect, setLienDirect] = useState("");
  const [formateurChoisi, setFormateurChoisi] = useState("");

  // Édition d une classe virtuelle existante.
  const [classeEnEdition, setClasseEnEdition] = useState(null);

  const [titreEnreg, setTitreEnreg] = useState("");
  const [fichierEnreg, setFichierEnreg] = useState(null);
  const [classeChoisie, setClasseChoisie] = useState("");
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [progressionUpload, setProgressionUpload] = useState(0);

  async function chargerTout() {
    setChargement(true);
    try {
      const [repModules, repClasses, repEnreg, repUtilisateurs] = await Promise.all([
        api.get(`/formations/${id}/modules`),
        api.get(`/formations/${id}/classes`),
        api.get(`/formations/${id}/enregistrements`),
        api.get("/admin/utilisateurs"),
      ]);
      setModules(repModules.data);
      setClasses(repClasses.data);
      setEnregistrements(repEnreg.data);
      setFormateurs(repUtilisateurs.data.filter((u) => u.role === "formateur"));

      const coursMap = {};
      for (const m of repModules.data) {
        const rep = await api.get(`/modules/${m._id}/cours`);
        coursMap[m._id] = rep.data;
      }
      setCoursParModule(coursMap);
      setErreur(null);
    } catch (e) {
      setErreur("Impossible de charger les données de la formation.");
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerTout();
  }, [id]);

  async function creerModule(e) {
    e.preventDefault();
    try {
      await api.post(`/formations/${id}/modules`, { titre: titreModule, ordre: Number(ordreModule) });
      setTitreModule("");
      setOrdreModule(1);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la création du module.");
    }
  }

  async function supprimerModule(moduleId) {
    if (!window.confirm("Supprimer ce module et tout son contenu (cours, quiz) ?")) return;
    try {
      await api.delete(`/formations/${id}/modules/${moduleId}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression du module.");
    }
  }

  function reinitialiserFormClasse() {
    setTitreClasse("");
    setDateHeure("");
    setLienDirect("");
    setFormateurChoisi("");
    setClasseEnEdition(null);
  }

  function commencerEdition(classe) {
    setClasseEnEdition(classe._id);
    setTitreClasse(classe.titre);
    // Convertit la date ISO en format attendu par l input datetime-local.
    setDateHeure(new Date(classe.dateHeure).toISOString().slice(0, 16));
    setLienDirect(classe.lienDirect);
    setFormateurChoisi(classe.formateurId || "");
    window.scrollTo({ top: document.getElementById("form-classe")?.offsetTop - 20, behavior: "smooth" });
  }

  async function soumettreClasse(e) {
    e.preventDefault();
    try {
      const donnees = {
        titre: titreClasse,
        dateHeure: new Date(dateHeure).toISOString(),
        lienDirect,
        formateurId: formateurChoisi || undefined,
      };
      if (classeEnEdition) {
        await api.patch(`/formations/${id}/classes/${classeEnEdition}`, donnees);
      } else {
        await api.post(`/formations/${id}/classes`, donnees);
      }
      reinitialiserFormClasse();
      await chargerTout();
    } catch (e) {
      setErreur(classeEnEdition ? "Erreur lors de la modification de la classe." : "Erreur lors de la création de la classe virtuelle.");
    }
  }

  async function supprimerClasse(classeId) {
    if (!window.confirm("Supprimer cette classe virtuelle ?")) return;
    try {
      await api.delete(`/formations/${id}/classes/${classeId}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression de la classe virtuelle.");
    }
  }

  async function creerEnregistrement(e) {
    e.preventDefault();
    setEnregistrementEnCours(true);
    setProgressionUpload(0);
    try {
      if (!fichierEnreg) {
        setErreur("Choisissez le fichier vidéo de l'enregistrement.");
        setEnregistrementEnCours(false);
        return;
      }
      const formData = new FormData();
      formData.append("fichier", fichierEnreg);
      const reponseUpload = await api.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          setProgressionUpload(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      await api.post(`/formations/${id}/enregistrements`, {
        titre: titreEnreg,
        urlVideo: reponseUpload.data.url,
        classeVirtuelleId: classeChoisie || undefined,
      });
      setTitreEnreg("");
      setFichierEnreg(null);
      setClasseChoisie("");
      setProgressionUpload(0);
      await chargerTout();
    } catch (e) {
      setErreur(
        e.response?.status === 413
          ? "Le fichier est trop volumineux."
          : "Erreur lors de l'ajout de l'enregistrement."
      );
    } finally {
      setEnregistrementEnCours(false);
    }
  }

  async function supprimerCours(moduleId, coursId) {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await api.delete(`/modules/${moduleId}/cours/${coursId}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression du cours.");
    }
  }

  async function supprimerEnregistrement(enregId) {
    if (!window.confirm("Supprimer cet enregistrement ?")) return;
    try {
      await api.delete(`/formations/${id}/enregistrements/${enregId}`);
      await chargerTout();
    } catch (e) {
      setErreur("Erreur lors de la suppression de l'enregistrement.");
    }
  }

  const nomFormateur = (fId) => {
    const f = formateurs.find((x) => x._id === fId);
    return f ? `${f.prenom} ${f.nom}` : "— Non assigné —";
  };

  return (
    <MiseEnPage>
      <Link to="/formations" style={styles.retour}>← Retour aux formations</Link>
      <h1 style={{ marginTop: "12px" }}>Gestion de la formation</h1>
      {erreur && <p style={{ color: "#b91c1c" }}>{erreur}</p>}

      <section style={styles.section}>
        <h2 style={styles.titreSection}>Modules</h2>
        <div style={styles.grille}>
          <div style={styles.carte}>
            <form onSubmit={creerModule}>
              <label style={styles.label}>Titre du module</label>
              <input style={styles.input} value={titreModule} onChange={(e) => setTitreModule(e.target.value)} required />
              <label style={styles.label}>Ordre</label>
              <input style={styles.input} type="number" min="1" value={ordreModule} onChange={(e) => setOrdreModule(e.target.value)} />
              <button style={styles.bouton}>Ajouter le module</button>
            </form>
          </div>
          <div style={styles.carte}>
            {chargement ? <p style={styles.gris}>Chargement...</p> : modules.length === 0 ? (
              <p style={styles.gris}>Aucun module pour le moment.</p>
            ) : (
              modules.sort((a, b) => a.ordre - b.ordre).map((m) => (
                <div key={m._id} style={styles.blocModule}>
                  <div style={styles.enTeteModule}>
                    <strong>{m.ordre}. {m.titre}</strong>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Link to={`/modules/${m._id}`} style={styles.lienGerer}>Gérer les cours →</Link>
                      <button onClick={() => supprimerModule(m._id)} style={styles.boutonSupprimer}>🗑</button>
                    </div>
                  </div>
                  {coursParModule[m._id]?.length > 0 ? (
                    <ul style={styles.listeCours}>
                      {coursParModule[m._id].map((c) => (
                        <li key={c._id} style={styles.ligneCours}>
                          <span>{c.type === "video" ? "🎬" : "📄"} {c.titre}</span>
                          <button onClick={() => supprimerCours(m._id, c._id)} style={styles.boutonSupprimer}>🗑</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p style={styles.pasDeCours}>Aucun cours dans ce module.</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section style={styles.section} id="form-classe">
        <h2 style={styles.titreSection}>Classes virtuelles</h2>
        <div style={styles.grille}>
          <div style={styles.carte}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "14px" }}>
                {classeEnEdition ? "Modifier la session" : "Nouvelle session"}
              </h3>
              {classeEnEdition && (
                <button onClick={reinitialiserFormClasse} style={styles.lienAnnuler}>Annuler</button>
              )}
            </div>
            <form onSubmit={soumettreClasse}>
              <label style={styles.label}>Titre de la session</label>
              <input style={styles.input} value={titreClasse} onChange={(e) => setTitreClasse(e.target.value)} required />
              <label style={styles.label}>Date et heure</label>
              <input style={styles.input} type="datetime-local" value={dateHeure} onChange={(e) => setDateHeure(e.target.value)} required />
              <label style={styles.label}>Lien de la réunion (Jitsi...)</label>
              <input style={styles.input} value={lienDirect} onChange={(e) => setLienDirect(e.target.value)} placeholder="https://meet.jit.si/..." required />
              <label style={styles.label}>Formateur assigné</label>
              <select style={styles.input} value={formateurChoisi} onChange={(e) => setFormateurChoisi(e.target.value)}>
                <option value="">— Non assigné —</option>
                {formateurs.map((f) => (
                  <option key={f._id} value={f._id}>{f.prenom} {f.nom}</option>
                ))}
              </select>
              <button style={styles.bouton}>
                {classeEnEdition ? "Enregistrer les modifications" : "Programmer la session"}
              </button>
            </form>
          </div>
          <div style={styles.carte}>
            {classes.length === 0 ? <p style={styles.gris}>Aucune classe programmée.</p> : (
              <table style={styles.tableau}>
                <thead><tr><th style={styles.th}>Titre</th><th style={styles.th}>Date</th><th style={styles.th}>Formateur</th><th style={styles.th}></th><th style={styles.th}></th><th style={styles.th}></th><th style={styles.th}></th></tr></thead>
                <tbody>
                  {classes.map((c) => (
                    <tr key={c._id}>
                      <td style={styles.td}>{c.titre}</td>
                      <td style={styles.td}>{new Date(c.dateHeure).toLocaleString("fr-FR")}</td>
                      <td style={styles.td}>{nomFormateur(c.formateurId)}</td>
                      <td style={styles.td}>
                        <a href={c.lienDirect} target="_blank" rel="noreferrer" style={styles.lienGerer}>🔗 Ouvrir</a>
                      </td>
                      <td style={styles.td}>
                        <Link to={`/presences/${c._id}`} style={styles.lienGerer}>Présences →</Link>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => commencerEdition(c)} style={styles.boutonModifier}>✏️</button>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => supprimerClasse(c._id)} style={styles.boutonSupprimer}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.titreSection}>Bibliothèque des sessions enregistrées</h2>
        <div style={styles.grille}>
          <div style={styles.carte}>
            <form onSubmit={creerEnregistrement}>
              <label style={styles.label}>Titre</label>
              <input style={styles.input} value={titreEnreg} onChange={(e) => setTitreEnreg(e.target.value)} required />

              <label style={styles.label}>Fichier vidéo de l'enregistrement</label>
              <input
                style={styles.input}
                type="file"
                accept="video/*"
                onChange={(e) => setFichierEnreg(e.target.files[0])}
                required
              />
              <p style={styles.astuce}>Taille maximale : 300 Mo.</p>
              {enregistrementEnCours && progressionUpload > 0 && (
                <p style={styles.astuceEnvoi}>Envoi en cours... {progressionUpload}%</p>
              )}

              <label style={styles.label}>Session d'origine (optionnel)</label>
              <select style={styles.input} value={classeChoisie} onChange={(e) => setClasseChoisie(e.target.value)}>
                <option value="">— Aucune —</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>{c.titre}</option>
                ))}
              </select>
              <button style={styles.bouton} disabled={enregistrementEnCours}>
                {enregistrementEnCours ? "Envoi..." : "Publier l'enregistrement"}
              </button>
            </form>
          </div>
          <div style={styles.carte}>
            {enregistrements.length === 0 ? <p style={styles.gris}>Aucun enregistrement publié.</p> : (
              <table style={styles.tableau}>
                <thead><tr><th style={styles.th}>Titre</th><th style={styles.th}></th><th style={styles.th}></th></tr></thead>
                <tbody>
                  {enregistrements.map((e) => (
                    <tr key={e._id}>
                      <td style={styles.td}>🎬 {e.titre}</td>
                      <td style={styles.td}>
                        <button onClick={() => setVideoEnPreview(e.urlVideo)} style={styles.boutonVoir}>▶ Voir</button>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => supprimerEnregistrement(e._id)} style={styles.boutonSupprimer}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <LecteurVideoModal url={videoEnPreview} onFermer={() => setVideoEnPreview(null)} />
    </MiseEnPage>
  );
}

const styles = {
  retour: { color: "#6b7280", textDecoration: "none", fontSize: "13px" },
  section: { marginTop: "28px" },
  titreSection: { fontSize: "18px", marginBottom: "12px", color: "#1F3864" },
  grille: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" },
  carte: { backgroundColor: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", boxSizing: "border-box" },
  astuce: { fontSize: "11px", color: "#9ca3af", marginTop: "-10px", marginBottom: "16px" },
  astuceEnvoi: { fontSize: "12px", color: "#1F3864", fontWeight: 600, marginBottom: "12px" },
  bouton: { width: "100%", padding: "10px", backgroundColor: "#1F3864", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  boutonVoir: { padding: "4px 10px", backgroundColor: "#DCE6F1", color: "#1F3864", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  boutonModifier: { padding: "4px 10px", backgroundColor: "#fef9c3", color: "#854d0e", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  boutonSupprimer: { padding: "4px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" },
  lienAnnuler: { background: "none", border: "none", color: "#6b7280", fontSize: "12px", cursor: "pointer", textDecoration: "underline" },
  gris: { color: "#6b7280" },
  blocModule: { padding: "14px", border: "1px solid #e5e7eb", borderRadius: "10px", marginBottom: "12px" },
  enTeteModule: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  lienGerer: { fontSize: "13px", color: "#1F3864", textDecoration: "none", fontWeight: 600 },
  listeCours: { marginTop: "10px", marginBottom: 0, paddingLeft: "0", listStyle: "none", fontSize: "13px", color: "#4b5563" },
  ligneCours: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" },
  pasDeCours: { marginTop: "8px", marginBottom: 0, fontSize: "13px", color: "#9ca3af" },
  tableau: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px", borderBottom: "2px solid #e5e7eb", fontSize: "13px", color: "#6b7280" },
  td: { padding: "10px", borderBottom: "1px solid #f3f4f6", fontSize: "14px" },
};
