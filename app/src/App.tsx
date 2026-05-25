import { Routes, Route } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Work from '@/pages/Work';
import Contact from '@/pages/Contact';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPages from '@/pages/admin/AdminPages';
import AdminSections from '@/pages/admin/AdminSections';
import AdminProjects from '@/pages/admin/AdminProjects';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminUploads from '@/pages/admin/AdminUploads';
import AdminClients from '@/pages/admin/AdminClients';
import ClientLayout from '@/components/client/ClientLayout';
import ClientDashboard from '@/pages/client/ClientDashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin routes - protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="sections" element={<AdminSections />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="uploads" element={<AdminUploads />} />
        <Route path="clients" element={<AdminClients />} />
      </Route>

      {/* Client routes - protected */}
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
      </Route>

      {/* Public routes */}
      <Route
        path="*"
        element={
          <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
            <Navigation />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/work" element={<Work />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
