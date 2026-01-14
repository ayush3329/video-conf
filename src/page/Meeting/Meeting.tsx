import React, { useState, useRef } from 'react';
import './meeting.css'; // Importing the separate CSS file
import Controls from '../../Components/Controls/Controls';
import Chat from '../../Components/Chat/Chat';

// Types for Sidebar State
type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

const Meeting = ({videoRef}: {videoRef: React.RefObject<null>}) => {
  // State Management
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>('none');

  const [chatSection, setChatSection] = useState(false);
  const [transcriptionSection, setTranscriptionSection] = useState(false);
  const [taskSection, setTaskSection] = useState(false);
  

  
  // Refs for Video Elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const pinnedVideoRef = useRef<HTMLVideoElement>(null);
  
  // Refs for Chat
  const chatInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const toggleSidebar = (type: SidebarType) => {
    setActiveSidebar(prev => (prev === type ? 'none' : type));
  };

  // Helper to calculate Sidebar Width dynamically based on state
  const getSidebarStyle = (type: SidebarType) => {
    const isActive = activeSidebar === type;
    return {
      width: isActive ? '350px' : '0px',
      padding: isActive ? undefined : '0px',
      opacity: isActive ? 1 : 0,
      border: isActive ? '1px solid #e0e0e0' : 'none'
    };
  };

  return (
    <div className="meeting-wrapper">
      
        <div id="meetingView" className="w-100 h-100 position-relative">
          
          {/* Pinned Video Overlay (Hidden by default, logic needed to toggle) */}
          {/* <div id="pinnedOverlay" className="d-none">
            <video ref={pinnedVideoRef} autoPlay playsInline className="pinned-video" muted></video>
            <button className="btn btn-sm btn-light" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
              <i className="bi bi-pin-angle"></i>
            </button>
          </div> */}

          {/* TASKS SIDEBAR */}
          <div className="sidebar-panel" style={getSidebarStyle('tasks')}>
            <div className="sidebar-header">
              <h5>Assigned Tasks</h5>
              <button className="btn btn-light px-1 py-0" onClick={() => toggleSidebar('tasks')}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="split-container">
              <div id="tasks_list" className="scrollable-list">
                {/* Task items map here */}
                <div className="text-muted small text-center mt-4">No tasks yet</div>
              </div>
            </div>
          </div>

          {/* MAIN VIDEO AREA */}
          <div className="video-container">
            {/* <div className="video-grid cols-2" id="videoGrid">
              <div className="participant-box">
                <div className="avatar_placeholder">
                   <span className="initials-circle">{username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="name-tag position-absolute" style={{bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>
                  {username} (You)
                </div>
              </div>
            </div> */}

            <Chat toggleSidebar={toggleSidebar} width={chatSection ? "350px": "0px"}/>



            {/* TRANSCRIPTION SIDEBAR (Inside Flex Container) */}
            <div className="sidebar-panel" style={getSidebarStyle('transcription')}>
              <div className="sidebar-header">
                <h5>Transcription</h5>
                <button className="btn btn-light px-1 py-0" onClick={() => toggleSidebar('transcription')}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="split-container">
                <div className="split-top">
                  <div className="panel_heading">Live Transcription</div>
                  <div className="scrollable-list" id="transcription_list"></div>
                </div>
                <div className="split-bottom">
                  <div className="panel_heading">Suggested Questions</div>
                  <div className="scrollable-list" id="suggested_questions_list"></div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM CONTROLS */}

        </div>
        
        <Controls videoRef={videoRef} setChatSection={setChatSection} setTaskSection={setTaskSection} setTranscriptionSection={setTranscriptionSection}/>
    </div>
  );
};

export default Meeting;