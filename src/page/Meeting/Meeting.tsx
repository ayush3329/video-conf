import React, { useState, useRef, useEffect } from 'react';
import Controls from '../../Components/Controls/Controls';
import Chat from '../../Components/Chat/Chat';
import Transcription from '../../Components/Transcription/Transcription';
import Tasks from '../../Components/Tasks/Tasks';
import SFUClient from '../../Components/SFUClient/SFUClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import MeetingPannel from '../../Components/MeetingPannel/MeetingPannel';

// Types for Sidebar State
type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

const Meeting = ({videoRef, streamRef}: {videoRef: React.RefObject<null>, streamRef: React.RefObject<MediaStream>}) => {

  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomid") || null;
  const username = searchParams.get("username") || null;

  const socketRef = useRef<Socket | null>(null); 

  


  // State Management
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>('none')

  const [chatSection, setChatSection] = useState(false);
  const [transcriptionSection, setTranscriptionSection] = useState(false);
  const [taskSection, setTaskSection] = useState(false);

  const toggleSidebar = (type: SidebarType) => {
    setActiveSidebar(prev => (prev === type ? 'none' : type));
  };

  useEffect(()=>{
    if(!roomId || !username) nav("/room")
  }, [])

  return (
    <div className='main-cont'>
      
      <MeetingPannel 
          videoRef={videoRef} 
          roomId={roomId} 
          username={username} 
          socketRef={socketRef}
          streamRef={streamRef}
      />
      
      <Controls 
          socketRef={socketRef} 
          videoRef={videoRef} 
          setChatSection={setChatSection} 
          setTaskSection={setTaskSection} 
          setTranscriptionSection={setTranscriptionSection}
          roomId={roomId || ""}
          streamRef={streamRef}
      />

        {/* 
        <div id="meetingView" className="w-100 h-100 position-relative">
          <div className="video-container" >
          <Transcription toggleSidebar={toggleSidebar} transcriptionSection={transcriptionSection}/>
            <SFUClient videoRef={videoRef} roomId={roomId} username={username} socketRef={socketRef}/>
            <Chat toggleSidebar={toggleSidebar} chatSection={chatSection}/>
            <Tasks toggleSidebar={toggleSidebar} taskSection={taskSection}/>
          </div>
          <Controls socketRef={socketRef} videoRef={videoRef} setChatSection={setChatSection} setTaskSection={setTaskSection} setTranscriptionSection={setTranscriptionSection}/>
        </div> 
        */}
        
    </div>
  );
};

export default Meeting;