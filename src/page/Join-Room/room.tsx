import { useState, useRef, useEffect } from 'react';
import './room.css'; 
import datopicLogo from "../../assets/images/datopiclogo.png"; 
import { CiMicrophoneOff, CiMicrophoneOn, CiVideoOff, CiVideoOn } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOnCamera, turnOnMic, turnOffCamera, turnOffMic } from "../../redux/states/media-controls/mediaControlSlice"

const Room = ({videoRef, streamRef}: {videoRef: React.RefObject<HTMLVideoElement | null>, streamRef: React.RefObject<MediaStream>}) => {
  const nav = useNavigate();

  // --- STATE ---
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  
  // Icon State
  const dispatch = useDispatch<AppDispatch>()
  const mediaControl: mediaState = useSelector((state: RootState)=> state.media)

  const ensureStreamLinked = ()=>{
    if(videoRef.current && videoRef.current.srcObject !== streamRef.current){
        videoRef.current.srcObject = streamRef.current;
    }
  }
  
    
  const toggleCamera = async()=>{
    if(mediaControl.camera){
        const videoTrack = streamRef.current.getVideoTracks();
        videoTrack.forEach((track)=>{
            track.stop();
            streamRef.current.removeTrack(track);
        })
        dispatch(turnOffCamera());
    } else{
        try{
            const newStream = await navigator.mediaDevices.getUserMedia({video: true});
            const newTrack = newStream.getVideoTracks()[0];
            
            streamRef.current.addTrack(newTrack);
            ensureStreamLinked();
            dispatch(turnOnCamera());
        } catch(err){
            console.error("Camera access denied", err);
        }
    }
  }
  
  const toggleMic = async()=>{
    
      if(mediaControl.mic){
          const audioTrack = streamRef.current.getAudioTracks();
          audioTrack.forEach((track)=>{
              track.stop();
              streamRef.current.removeTrack(track);
          })
          dispatch(turnOffMic());
      } else{
          try{
              const newStream = await navigator.mediaDevices.getUserMedia({audio: true});
              const newTrack = newStream.getAudioTracks()[0];
              
              streamRef.current.addTrack(newTrack);
              ensureStreamLinked();
              dispatch(turnOnMic());

          } catch(err){
              console.error("Mic access denied", err);
          }
      }
      
  }

  const handleJoin = () => {
    if (!username || !roomName) {
      alert("Please enter both Name and Room Name.");
      return;
    } else{
      nav(`/meeting?roomid=${roomName}&username=${username}`)
    }
  };


  useEffect(()=>{
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
    return()=>{
      videoRef.current = null;
    }
  }, [])





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
                
              <video ref={videoRef} muted={true} autoPlay playsInline className="video-feed" 
                style={{display: `${mediaControl.camera ? "block" : "none"}`}}/>

                {
                  !mediaControl.camera &&
                  <div className="camera-off-placeholder">
                      <span>Camera is off</span>
                  </div>
                }

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