import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import DiscoveryPage from './pages/DiscoveryPage';
import WerkstattDetailPage from './pages/WerkstattDetailPage';
import BookingPage from './pages/BookingPage';
import ManagePage from './pages/ManagePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import WerkstattRegisterPage from './pages/WerkstattRegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { useAuth } from './context/AuthContext';
import './assets/global.css';

// ---------- Route Guards ----------

/** /admin — sadece tam onaylı + onboardingsi tamamlanmış werkstatt */
function ProtectedAdminRoute({ children }) {
  const { werkstatt, loading } = useAuth();
  if (loading) return null;
  if (!werkstatt) return <Navigate to="/admin/login" replace />;
  if (!werkstatt.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  if (!werkstatt.isApproved) return <Navigate to="/pending" replace />;
  return children;
}

/** /onboarding — sadece onboardingsi tamamlanmamış werkstatt */
function RequireOnboarding({ children }) {
  const { werkstatt, loading } = useAuth();
  if (loading) return null;
  if (!werkstatt) return <Navigate to="/admin/login" replace />;
  if (werkstatt.onboardingCompleted) {
    return <Navigate to={werkstatt.isApproved ? '/admin' : '/pending'} replace />;
  }
  return children;
}

/** /pending — onboarding tamam ama onaysız */
function RequirePending({ children }) {
  const { werkstatt, loading } = useAuth();
  if (loading) return null;
  if (!werkstatt) return <Navigate to="/admin/login" replace />;
  if (!werkstatt.onboardingCompleted) return <Navigate to="/onboarding" replace />;
  if (werkstatt.isApproved) return <Navigate to="/admin" replace />;
  return children;
}

/** /superadmin — sadece super-admin */
function RequireSuperAdmin({ children }) {
  const { superadmin, loading } = useAuth();
  if (loading) return null;
  if (!superadmin) return <Navigate to="/superadmin/login" replace />;
  return children;
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">AutoTermin</div>
          <div>Werkstatt-Termine online buchen</div>
        </div>
        <div className="footer-links">
          <span>© 2026 AutoTermin</span>
        </div>
      </div>
    </footer>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <div id="app-main">
      <Header />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<DiscoveryPage />} />
          <Route path="/werkstatt/register" element={<WerkstattRegisterPage />} />
          <Route path="/werkstatt/:werkstattId" element={<WerkstattDetailPage />} />
          <Route path="/werkstatt/:werkstattId/book" element={<BookingPage />} />
          <Route path="/manage" element={<ManagePage />} />

          {/* Werkstatt akışı */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/onboarding"
            element={<RequireOnboarding><OnboardingPage /></RequireOnboarding>}
          />
          <Route
            path="/pending"
            element={<RequirePending><PendingApprovalPage /></RequirePending>}
          />
          <Route
            path="/admin"
            element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>}
          />

          {/* SuperAdmin */}
          <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
          <Route
            path="/superadmin"
            element={<RequireSuperAdmin><SuperAdminDashboard /></RequireSuperAdmin>}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}