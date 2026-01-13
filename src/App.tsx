import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"

import LoginPage from './page/login/login';
import ForgotPasswordPage from './page/forgotPassword/forgotPassword';
import ResetPasswordPage from './page/forgotPassword/forgotPassword';
import Room from './page/Join-Room/room'; // This is meet.ejs
import NotFoundPage from './page/notFound/NotFound'; // This is 404.ejs
import Meeting from './page/Meeting/Meeting';
import { useRef } from 'react';

function App() {
  const videoRef = useRef(null);  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={ <LoginPage /> } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* App Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/room" element={<Room videoRef={videoRef}/>} />
      <Route path="/meeting" element={<Meeting videoRef={videoRef}/>} />

      {/* 404 Handling */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;