import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stocke = localStorage.getItem("utilisateur");
    return stocke ? JSON.parse(stocke) : null;
  });
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  async function connecter(telephone, motDePasse) {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.post("/auth/connexion", { telephone, motDePasse });
      const { token, utilisateur: utilisateurConnecte } = reponse.data;

      // Accès réservé aux admins et aux formateurs — pas aux apprenants.
      const rolesAutorises = ["admin_national", "admin_regional", "formateur"];
      if (!rolesAutorises.includes(utilisateurConnecte.role)) {
        setErreur("Accès réservé aux administrateurs et formateurs.");
        setChargement(false);
        return false;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("utilisateur", JSON.stringify(utilisateurConnecte));
      setUtilisateur(utilisateurConnecte);
      setChargement(false);
      return true;
    } catch (e) {
      setErreur(
        e.response?.status === 401
          ? "Numéro ou mot de passe incorrect."
          : "Connexion impossible. Vérifiez le réseau."
      );
      setChargement(false);
      return false;
    }
  }

  function deconnecter() {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, connecter, deconnecter, erreur, chargement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
