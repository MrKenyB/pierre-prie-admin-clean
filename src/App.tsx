import React from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Resultats from "./pages/Resultats";
import Evenements from "./pages/Evenements";
import Formations from "./pages/Formations";
import Temoignages from "./pages/Temoignages";
import NotFound from "./pages/NotFound";
import Validation from "./pages/Validation";
import AuthLayout from "./components/AuthLayout";

const App = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
      <Route path="/" element={<Auth />} />
      <Route path="/validation" element={<Validation />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Route>
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resultats"
        element={
          <ProtectedRoute>
            <Resultats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evenements"
        element={
          <ProtectedRoute>
            <Evenements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/formations"
        element={
          <ProtectedRoute>
            <Formations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/temoignages"
        element={
          <ProtectedRoute>
            <Temoignages />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;