import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Features from './pages/Features';
import SchoolRegistration from './pages/SchoolRegistration';
import GuestPickup from './pages/public/GuestPickup';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Documentation pages
import ApiDocs from './pages/docs/ApiDocs';
import ImplementationDocs from './pages/docs/ImplementationDocs';
import SchoolSetup from './pages/docs/implementation/SchoolSetup';
import Security from './pages/docs/implementation/Security';
import RouteImplementation from './pages/docs/implementation/Routes';
import Users from './pages/docs/implementation/Users';
import Safety from './pages/docs/implementation/Safety';
import ImplementationFAQ from './pages/docs/implementation/FAQ';

// Solution pages
import Schools from './pages/solutions/Schools';
import Parents from './pages/solutions/Parents';
import BusDrivers from './pages/solutions/BusDrivers';

// Help Center pages
import HelpCenter from './pages/HelpCenter';
import GettingStarted from './pages/help/GettingStarted';
import ParentGuide from './pages/help/ParentGuide';
import SchoolGuide from './pages/help/SchoolGuide';
import DriverGuide from './pages/help/DriverGuide';
import RouteManagement from './pages/help/RouteManagement';
import SafetyFeatures from './pages/help/SafetyFeatures';
import MobileApp from './pages/help/MobileApp';
import Troubleshooting from './pages/help/Troubleshooting';
import WorkingDocs from './pages/help/WorkingDocs';
import Communication from './pages/help/Communication';
import FAQ from './pages/help/FAQ';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import Unauthorized from './pages/auth/Unauthorized';

// Dashboard pages
import SchoolAdminDashboard from './pages/SchoolAdmin/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import BusDriverDashboard from './pages/BusDriver/Dashboard';
import ParentDashboard from './pages/Parent/Dashboard';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';

// SchoolAdmin pages
import SchoolAdminUsers from './pages/SchoolAdmin/Users';
import SchoolAdminTransport from './pages/SchoolAdmin/Transport';
import SchoolAdminAnalytics from './pages/SchoolAdmin/Analytics';
import SchoolAdminMessages from './pages/SchoolAdmin/Messages';
import SchoolAdminLiveTracking from './pages/SchoolAdmin/LiveTracking';
import SchoolAdminBusManagement from './pages/SchoolAdmin/BusManagement';

// BusDriver pages
import BusDriverRoute from './pages/BusDriver/Route';
import BusDriverCheckIn from './pages/BusDriver/CheckIn';
import BusDriverIncidents from './pages/BusDriver/Incidents';
import BusDriverMessages from './pages/BusDriver/Messages';

// Parent pages
import ParentBusTracking from './pages/Parent/BusTracking';
import ParentEmergencyContacts from './pages/Parent/EmergencyContacts';
import ParentMessages from './pages/Parent/Messages';

// SuperAdmin pages
import SuperAdminSchools from './pages/SuperAdmin/Schools';
import SuperAdminUsers from './pages/SuperAdmin/Users';
import SuperAdminSettings from './pages/SuperAdmin/Settings';
import SuperAdminRegistrationQueue from './pages/SuperAdmin/RegistrationQueue';
import SchoolCreation from './pages/SuperAdmin/SchoolCreation';
import UserEdit from './pages/SuperAdmin/UserEdit';
import UserCreation from './pages/SuperAdmin/UserCreation';
import Migrations from './pages/SuperAdmin/Migrations';

// Student pages
import StudentDashboard from './pages/Student/Dashboard';

const DashboardRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return <Navigate to="/login" />;

  switch (currentUser.role) {
    case 'SUPERADMIN':
      return <Navigate to="/superadmin/dashboard" />;
    case 'SCHOOLADMIN':
      return <Navigate to="/schooladmin/dashboard" />;
    case 'TEACHER':
      return <Navigate to="/teacher/dashboard" />;
    case 'BUSDRIVER':
      return <Navigate to="/busdriver/dashboard" />;
    case 'PARENT':
      return <Navigate to="/parent/dashboard" />;
    default:
      return <Navigate to="/unauthorized" />;
  }
};

export default function Routes() {
  return (
    <RouterRoutes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Documentation Routes */}
      <Route path="/docs/api" element={<ApiDocs />} />
      <Route path="/docs/implementation" element={<ImplementationDocs />} />
      <Route path="/help/docs/implementation/school-setup" element={<SchoolSetup />} />
      <Route path="/help/docs/implementation/security" element={<Security />} />
      <Route path="/help/docs/implementation/routes" element={<RouteImplementation />} />
      <Route path="/help/docs/implementation/users" element={<Users />} />
      <Route path="/help/docs/implementation/safety" element={<Safety />} />
      <Route path="/help/docs/implementation/faq" element={<ImplementationFAQ />} />

      {/* Solutions Routes */}
      <Route path="/solutions/schools" element={<Schools />} />
      <Route path="/solutions/parents" element={<Parents />} />
      <Route path="/solutions/bus-drivers" element={<BusDrivers />} />

      {/* Help Center Routes */}
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/help/getting-started" element={<GettingStarted />} />
      <Route path="/help/parent-guide" element={<ParentGuide />} />
      <Route path="/help/school-guide" element={<SchoolGuide />} />
      <Route path="/help/driver-guide" element={<DriverGuide />} />
      <Route path="/help/route-management" element={<RouteManagement />} />
      <Route path="/help/safety-features" element={<SafetyFeatures />} />
      <Route path="/help/mobile-app" element={<MobileApp />} />
      <Route path="/help/troubleshooting" element={<Troubleshooting />} />
      <Route path="/help/working-docs" element={<WorkingDocs />} />
      <Route path="/help/communication" element={<Communication />} />
      <Route path="/help/faq" element={<FAQ />} />
      <Route path="/help/docs/api" element={<ApiDocs />} />
      <Route path="/help/docs/implementation" element={<ImplementationDocs />} />
      <Route path="/help/docs/api/auth" element={<ApiDocs />} />
      <Route path="/help/docs/api/endpoints" element={<ApiDocs />} />
      <Route path="/help/docs/api/examples/tracking" element={<ApiDocs />} />
      <Route path="/help/docs/api/examples/students" element={<ApiDocs />} />
      <Route path="/help/docs/api/examples/alerts" element={<ApiDocs />} />

      {/* Registration and Guest Routes */}
      <Route path="/register-school" element={<SchoolRegistration />} />
      <Route path="/guest-pickup/:delegateId" element={<GuestPickup />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<DashboardRedirect />} />
      
      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin/*"
        element={
          <PrivateRoute requiredRole="SUPERADMIN">
            <RouterRoutes>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="schools" element={<SuperAdminSchools />} />
              <Route path="schools/add" element={<SchoolCreation />} />
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="users/add" element={<UserCreation />} />
              <Route path="users/edit/:id" element={<UserEdit />} />
              <Route path="settings" element={<SuperAdminSettings />} />
              <Route path="registration-queue" element={<SuperAdminRegistrationQueue />} />
              <Route path="migrations" element={<Migrations />} />
            </RouterRoutes>
          </PrivateRoute>
        }
      />

      {/* SchoolAdmin Routes */}
      <Route
        path="/schooladmin/*"
        element={
          <PrivateRoute requiredRole="SCHOOLADMIN">
            <RouterRoutes>
              <Route path="dashboard" element={<SchoolAdminDashboard />} />
              <Route path="users" element={<SchoolAdminUsers />} />
              <Route path="transport" element={<SchoolAdminTransport />} />
              <Route path="buses" element={<SchoolAdminBusManagement />} />
              <Route path="analytics" element={<SchoolAdminAnalytics />} />
              <Route path="messages" element={<SchoolAdminMessages />} />
              <Route path="live-tracking" element={<SchoolAdminLiveTracking />} />
            </RouterRoutes>
          </PrivateRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/dashboard"
        element={
          <PrivateRoute requiredRole="TEACHER">
            <TeacherDashboard />
          </PrivateRoute>
        }
      />

      {/* BusDriver Routes */}
      <Route
        path="/busdriver/*"
        element={
          <PrivateRoute requiredRole="BUSDRIVER">
            <RouterRoutes>
              <Route path="dashboard" element={<BusDriverDashboard />} />
              <Route path="route" element={<BusDriverRoute />} />
              <Route path="checkin" element={<BusDriverCheckIn />} />
              <Route path="incidents" element={<BusDriverIncidents />} />
              <Route path="messages" element={<BusDriverMessages />} />
            </RouterRoutes>
          </PrivateRoute>
        }
      />

      {/* Parent Routes */}
      <Route
        path="/parent/*"
        element={
          <PrivateRoute requiredRole="PARENT">
            <RouterRoutes>
              <Route path="dashboard" element={<ParentDashboard />} />
              <Route path="bus-tracking" element={<ParentBusTracking />} />
              <Route path="emergency-contacts" element={<ParentEmergencyContacts />} />
              <Route path="messages" element={<ParentMessages />} />
            </RouterRoutes>
          </PrivateRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <PrivateRoute requiredRole="STUDENT">
            <RouterRoutes>
              <Route path="dashboard" element={<StudentDashboard />} />
            </RouterRoutes>
          </PrivateRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </RouterRoutes>
  );
} 