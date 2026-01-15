import React, { useState, useRef } from 'react';
import './meeting.css'; // Importing the separate CSS file
import Controls from '../../Components/Controls/Controls';
import Chat from '../../Components/Chat/Chat';
import Transcription from '../../Components/Transcription/Transcription';
import Tasks from '../../Components/Tasks/Tasks';
import SFUClient from '../../Components/VideoFrame/VideoFrame';

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

          {/* MAIN VIDEO AREA */}
          <div className="video-container" >
            <SFUClient videoRef={videoRef} />

            <Chat toggleSidebar={toggleSidebar} chatSection={chatSection}/>
            <Transcription toggleSidebar={toggleSidebar} transcriptionSection={transcriptionSection}/>
            <Tasks toggleSidebar={toggleSidebar} taskSection={taskSection}/>
          </div>

          <Controls videoRef={videoRef} setChatSection={setChatSection} setTaskSection={setTaskSection} setTranscriptionSection={setTranscriptionSection}/>
        </div>
        
    </div>
  );
};

export default Meeting;