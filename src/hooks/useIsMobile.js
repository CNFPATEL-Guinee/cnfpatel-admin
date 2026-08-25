import { useState, useEffect } from "react";

// Détecte si l écran est de taille mobile (moins de 768px de large),
// et se met à jour automatiquement si la fenêtre change de taille.
export function useIsMobile() {
  const [estMobile, setEstMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    function verifier() {
      setEstMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", verifier);
    return () => window.removeEventListener("resize", verifier);
  }, []);

  return estMobile;
}
