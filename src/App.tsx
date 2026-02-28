import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Studio } from './pages/Studio';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { Legal } from './pages/Legal';
import { Credits } from './pages/Credits';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="app" element={<Studio />} />
          <Route path="legal" element={<Legal />} />
          <Route path="credits" element={<Credits />} />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="library"
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
