import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import FoodHunter from './pages/FoodHunter';
import FoodGatcha from './pages/FoodGatcha';
import Concierge from './pages/Concierge';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/FoodHunter" element={
          <Layout>
            <FoodHunter />
          </Layout>
        } />

        <Route path="/FoodGatcha" element={
          <Layout>
            <FoodGatcha />
          </Layout>
        } />

        <Route path="/Concierge" element={
          <Layout>
            <Concierge />
          </Layout>
        } />

        <Route path="/Profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
