import { Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"

import LoginPage from './page/login/login';
import RegisterPage from './page/RegisterPage/RegisterPage';
import ForgotPasswordPage from './page/forgotPassword/forgotPassword';
import ResetPasswordPage from './page/forgotPassword/forgotPassword';
import MeetPage from './page/MeetPage/MeetPage'; // This is meet.ejs
import NotFoundPage from './page/notFound/NotFound'; // This is 404.ejs

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={ <LoginPage /> } />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* App Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/meet" element={<MeetPage />} />

      {/* 404 Handling */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;