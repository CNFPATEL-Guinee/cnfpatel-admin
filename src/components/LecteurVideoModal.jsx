// Petite fenêtre modale affichant un lecteur vidéo natif du navigateur.
export default function LecteurVideoModal({ url, onFermer }) {
  if (!url) return null;
  return (
    <div style={styles.fond} onClick={onFermer}>
      <div style={styles.boite} onClick={(e) => e.stopPropagation()}>
        <button onClick={onFermer} style={styles.fermer}>✕</button>
        <video src={url} controls autoPlay style={styles.video} />
      </div>
    </div>
  );
}

const styles = {
  fond: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  boite: {
    position: "relative",
    backgroundColor: "black",
    borderRadius: "12px",
    overflow: "hidden",
    maxWidth: "90vw",
  },
  video: {
    maxWidth: "80vw",
    maxHeight: "80vh",
    display: "block",
  },
  fermer: {
    position: "absolute",
    top: "8px",
    right: "8px",
    backgroundColor: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "16px",
    zIndex: 1,
  },
};
