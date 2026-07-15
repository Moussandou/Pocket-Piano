import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Studio } from './pages/Studio';
import { ProtectedRoute } from './components/ProtectedRoute';

const Auth = React.lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Legal = React.lazy(() => import('./pages/Legal').then(m => ({ default: m.Legal })));
const Credits = React.lazy(() => import('./pages/Credits').then(m => ({ default: m.Credits })));
const Library = React.lazy(() => import('./pages/Library').then(m => ({ default: m.Library })));
const Account = React.lazy(() => import('./pages/Account').then(m => ({ default: m.Account })));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const PageLoader = () => (
  <div className="loader-overlay" style={{ position: 'relative', flex: 1, minHeight: '40vh' }}>
    <div className="spinner"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="app" element={<Navigate to="/" replace />} />
          <Route element={<Layout />}>
            <Route path="auth" element={<Auth />} />
            <Route path="legal" element={<Legal />} />
            <Route path="credits" element={<Credits />} />
            <Route path="profile" element={<Navigate to="/account" replace />} />
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <Account />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
