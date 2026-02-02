import { Routes, Route} from 'react-router-dom';
import "./App.css"
import LoginPage from './page/login/login';
import Room from './page/Join-Room/room'; // This is meet.ejs
import { useRef } from 'react';
import MeetingPannel from './Components/MeetingPannel/MeetingPannel';

function App() {
  const videoRef = useRef(null);  
  const streamRef = useRef(new MediaStream());
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={ <LoginPage /> } />

      {/* App Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/room" element={<Room streamRef={streamRef} videoRef={videoRef}/>} />
      <Route path="/meeting" element={<MeetingPannel videoRef={videoRef} streamRef={streamRef}/>} />
    </Routes>
  );
}

export default App;