import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Connexion from "./pages/Connexion";
import TableauDeBord from "./pages/TableauDeBord";
import Formations from "./pages/Formations";
import DetailFormation from "./pages/DetailFormation";
import DetailModule from "./pages/DetailModule";
import DetailQuiz from "./pages/DetailQuiz";
import Utilisateurs from "./pages/Utilisateurs";
import Formateurs from "./pages/Formateurs";
import Certificats from "./pages/Certificats";
import Presences from "./pages/Presences";
import Notifications from "./pages/Notifications";
import EspaceFormateur from "./pages/EspaceFormateur";
import FormationsFormateur from "./pages/FormationsFormateur";
import DetailFormationFormateur from "./pages/DetailFormationFormateur";

// Redirige vers l espace adapté selon le rôle de la personne connectée.
function RouteProtegee({ children, rolesAutorises }) {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/connexion" replace />;
  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to={utilisateur.role === "formateur" ? "/formateur" : "/"} replace />;
  }
  return children;
}

const rolesAdmin = ["admin_national", "admin_regional"];
const rolesFormateur = ["formateur"];

function AppRoutes() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      {/* Portail admin */}
      <Route path="/" element={<RouteProtegee rolesAutorises={rolesAdmin}><TableauDeBord /></RouteProtegee>} />
      <Route path="/formations" element={<RouteProtegee rolesAutorises={rolesAdmin}><Formations /></RouteProtegee>} />
      <Route path="/formations/:id" element={<RouteProtegee rolesAutorises={rolesAdmin}><DetailFormation /></RouteProtegee>} />
      <Route path="/modules/:id" element={<RouteProtegee rolesAutorises={rolesAdmin}><DetailModule /></RouteProtegee>} />
      <Route path="/modules/:id/quiz" element={<RouteProtegee rolesAutorises={rolesAdmin}><DetailQuiz /></RouteProtegee>} />
      <Route path="/utilisateurs" element={<RouteProtegee rolesAutorises={rolesAdmin}><Utilisateurs /></RouteProtegee>} />
      <Route path="/formateurs" element={<RouteProtegee rolesAutorises={rolesAdmin}><Formateurs /></RouteProtegee>} />
      <Route path="/certificats" element={<RouteProtegee rolesAutorises={rolesAdmin}><Certificats /></RouteProtegee>} />
      <Route path="/presences/:classeId" element={<RouteProtegee rolesAutorises={rolesAdmin}><Presences /></RouteProtegee>} />
      <Route path="/notifications" element={<RouteProtegee rolesAutorises={rolesAdmin}><Notifications /></RouteProtegee>} />

      {/* Espace formateur */}
      <Route path="/formateur" element={<RouteProtegee rolesAutorises={rolesFormateur}><EspaceFormateur /></RouteProtegee>} />
      <Route path="/formateur/formations" element={<RouteProtegee rolesAutorises={rolesFormateur}><FormationsFormateur /></RouteProtegee>} />
      <Route path="/formateur/formations/:id" element={<RouteProtegee rolesAutorises={rolesFormateur}><DetailFormationFormateur /></RouteProtegee>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
