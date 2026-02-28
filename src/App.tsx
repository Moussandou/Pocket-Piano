import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Studio } from './pages/Studio';
import { Landing } from './pages/Landing';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="app" element={<Studio />} />
          <Route path="profile" element={<Profile />} />
          <Route path="library" element={<Library />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
