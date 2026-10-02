import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Attachments from "./pages/Attachments";
import History from "./pages/History";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Layout>
                  <Projects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProjectDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout>
                  <Tasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/invoices"
            element={
              <ProtectedRoute>
                <Layout>
                  <Invoices />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/payments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attachments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Attachments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/attachments"
            element={
              <ProtectedRoute>
                <Layout>
                  <Attachments />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <History />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
