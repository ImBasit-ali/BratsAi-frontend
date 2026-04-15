import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ModelPage from './pages/ModelPage';
import DashboardPage from './pages/DashboardPage';
import ResultPage from './pages/ResultPage';

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen font-inter">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/model" element={<ModelPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/results/:id" element={<ResultPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
