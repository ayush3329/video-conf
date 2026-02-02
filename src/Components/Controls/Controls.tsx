import React from 'react';
import Camera from '../Camera/Camera';
import Mic from '../Mic/Mic';
import { MdOutlineLaptop } from 'react-icons/md';
import { BsFillTelephoneXFill } from 'react-icons/bs';
import { CiChat1 } from 'react-icons/ci';
import { CgCaptions } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';


interface ControlsProps {
  videoRef: React.RefObject<HTMLVideoElement|null>,
  socketRef: any,
  roomId: string,
  streamRef: React.RefObject<MediaStream>
}

const Controls = ({roomId, videoRef, streamRef, socketRef}: ControlsProps) => {
    const nav = useNavigate();

    return (

      <div className='footer'>
        <div className='controls-left'><span>{roomId}</span></div>
        <div className='controls-center'>

          <Mic videoRef={videoRef} streamRef={streamRef}/> {/* Mic */}
          <Camera videoRef={videoRef} streamRef={streamRef}/> {/* Camera */}
          
          <div  className="control-btn"  onClick={()=> console.log("Share screen")}>
            <MdOutlineLaptop size={24} />
          </div> 

          <div  className="control-btn" style={{backgroundColor: "#ef476f"}}  onClick={() => {
              socketRef.current?.disconnect();
              nav("/room")
          }}>
              <BsFillTelephoneXFill  size={20} color="white"/>
          </div> {/* Disconnect */}

          <div  className="control-btn"  onClick={() => setChatSection((prev=> !prev))}>
            <CiChat1 size={20}/>
          </div> {/* Chat */}

          <div  className="control-btn"  onClick={() => setTranscriptionSection((prev=> !prev))}>
            <CgCaptions size={20}/>
          </div> {/* Transcription */}
  


        </div>
        <div className='controls-right'><span>💬</span><span>🔒</span></div>
      </div>
    );
}

export default Controls;


/*


<div id="meetingView" className="w-100 h-100 position-relative">
  <div className="video-container" >
  <Transcription toggleSidebar={toggleSidebar} transcriptionSection={transcriptionSection}/>
    <SFUClient videoRef={videoRef} roomId={roomId} username={username} socketRef={socketRef}/>
    <Chat toggleSidebar={toggleSidebar} chatSection={chatSection}/>
    <Tasks toggleSidebar={toggleSidebar} taskSection={taskSection}/>
  </div>
  <Controls socketRef={socketRef} videoRef={videoRef} setChatSection={setChatSection} setTaskSection={setTaskSection} setTranscriptionSection={setTranscriptionSection}/>
</div> 

*/
