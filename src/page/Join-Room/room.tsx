import { useState, useRef, useEffect } from 'react';
import './room.css'; 
import datopicLogo from "../../assets/images/datopiclogo.png"; 
import { CiMicrophoneOff, CiMicrophoneOn, CiVideoOff, CiVideoOn } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOnCameraAndMic, turnOnCamera, turnOnMic, turnOffCamera, turnOffMic } from "../../redux/states/media-controls/mediaControlSlice"

const Room = ({videoRef}: {videoRef: React.RefObject<null>}) => {
  
  const nav = useNavigate();

  // --- STATE ---
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  
  // Icon State
  const dispatch = useDispatch<AppDispatch>()
  const mediaControl: mediaState = useSelector((state: RootState)=> state.media)

  // Video data
  const streamRef = useRef(null);
  const [error, setError] = useState<string|null>(null);


  const toggleCamera = async () => {
    if (mediaControl.camera) {
      // 1. TURNING OFF: Find video track and stop it (Releases hardware light)
      const tracks = streamRef.current.getVideoTracks();
      tracks.forEach(track => {
        track.stop(); // Stops the hardware
        streamRef.current.removeTrack(track); // Removes from stream object
      });
      dispatch(turnOffCamera())
    } else {
      // 2. TURNING ON: We must request access again
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];

        // Add the new video track to our existing stream (so audio keeps working if it's on)
        if (streamRef.current) {
          streamRef.current.addTrack(newVideoTrack);
        } else {
          // If stream was completely dead, re-initialize it
          streamRef.current = newStream; 
        }

        dispatch(turnOnCamera());
      } catch (err) {
        console.error("Error restarting video:", err);
        setError("Could not restart camera.");
      }
    }
  };

  const toggleMic = async () => {
    if (mediaControl.mic) {
      // 1. TURNING OFF: Stop audio track (Releases microphone)
      const tracks = streamRef.current.getAudioTracks();
      tracks.forEach(track => {
        track.stop(); 
        streamRef.current.removeTrack(track);
      });
      dispatch(turnOffMic());
    } else {
      // 2. TURNING ON: Request audio access again
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newAudioTrack = newStream.getAudioTracks()[0];

        if (streamRef.current) {
          streamRef.current.addTrack(newAudioTrack);
        } else {
          streamRef.current = newStream;
        }

        dispatch(turnOnMic());
      } catch (err) {
        console.error("Error restarting audio:", err);
      }
    }
  };

  const handleJoin = () => {
    if (!username || !roomName) {
      alert("Please enter both Name and Room Name.");
      return;
    } else{
      nav(`/meeting?roomid=${roomName}&username=${username}`)
    }
  };

  
  useEffect(() => {
    const setupStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
          
        streamRef.current = stream;  
        dispatch(turnOnCameraAndMic())
        
      } catch (err) {
        console.error("Error accessing camera and mic:", err);
        setError("Camera access denied.");
      }
    };
    setupStream();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  
  useEffect(() => {
    if (mediaControl.camera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [mediaControl.camera]);



  return (
    <div className="meet-page-container">
      <div className="prejoin-container">

        <div className="d-flex flex-column justify-content-center flex-grow-1 px-4 py-5">
          <div>
            <img src={datopicLogo} alt="Datopic Logo" style={{ width: '200px' }} />
          </div>
          <div className="container mt-4">
            <h1 className="display-4 fw-bold mb-2 prejoin-head-gradient">Join a Meeting</h1>
            <p className="text-white-50 lead">
              Please allow camera and microphone access to preview the video and join the meeting.
            </p>
          </div>
        </div>

        <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 p-3">
          <div className="card shadow-sm w-100 prejoin-card-animate" style={{ maxWidth: '500px', borderRadius: '18px', border: 'none' }}>
            
            <div className="prejoin-card-body">
              
              <div className="video-preview-frame">
                {mediaControl.camera ? (
                  <video ref={videoRef} autoPlay playsInline muted />
                ) : (
                  <div className="camera-off-placeholder">
                      <span>Camera is off</span>
                  </div>
                )}

                <div className="overlay-controls">
                  <div  className="control-btn"  onClick={toggleCamera}>
                      {mediaControl.camera ? <CiVideoOn size={24}/> : <CiVideoOff size={24}/>}
                  </div>
                  
                  <div  className="control-btn"  onClick={toggleMic}>
                      {mediaControl.mic ? <CiMicrophoneOn size={24}/> : <CiMicrophoneOff size={24}/>}
                  </div>
                </div>
              </div>

              <div className="prejoin-inputs-container">

                <input 
                  type="text" 
                  className="form-control mb-3" 
                  placeholder="Your Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input 
                  type="text" 
                  className="form-control mb-3" 
                  placeholder="Room name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />

                <button 
                  className="btn btn-primary w-100 py-2 fw-bold" 
                  onClick={handleJoin}
                  disabled={!username || !roomName}
                  style={{ borderRadius: '8px' }}
                >
                  Join
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Room;