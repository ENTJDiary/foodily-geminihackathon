import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import FoodHunter from './pages/FoodHunter';
import FoodGatcha from './pages/FoodGatcha';
import Concierge from './pages/Concierge';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import InitializingUser from './pages/InitializingUser';
import Onboarding from './pages/Onboarding';
import CleanupProfiles from './pages/CleanupProfiles';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Loading/Initialization Route */}
          <Route path="/initializing" element={
            <ProtectedRoute>
              <InitializingUser />
            </ProtectedRoute>
          } />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          {/* Admin Utility Routes */}
          <Route path="/cleanup-profiles" element={
            <ProtectedRoute>
              <CleanupProfiles />
            </ProtectedRoute>
          } />


          {/* Protected Routes with User ID */}
          <Route path="/FoodHunter/:userid" element={
            <ProtectedRoute>
              <Layout>
                <FoodHunter />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/FoodGatcha/:userid" element={
            <ProtectedRoute>
              <Layout>
                <FoodGatcha />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/Concierge/:userid" element={
            <ProtectedRoute>
              <Layout>
                <Concierge />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/Profile/:userid" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
