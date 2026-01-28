import React from 'react';
import Camera from '../Camera/Camera';
import Mic from '../Mic/Mic';
import { MdOutlineLaptop } from 'react-icons/md';
import { BsFillTelephoneXFill } from 'react-icons/bs';
import { CiChat1 } from 'react-icons/ci';
import { CgCaptions } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';


interface ControlsProps {
  setChatSection: React.Dispatch<React.SetStateAction<boolean>>,
  setTranscriptionSection: React.Dispatch<React.SetStateAction<boolean>>,
  setTaskSection: React.Dispatch<React.SetStateAction<boolean>>
  videoRef: React.RefObject<HTMLVideoElement>,
  socketRef: any
}

const Controls = ({videoRef, setChatSection, setTaskSection, setTranscriptionSection, socketRef}: ControlsProps) => {
    const nav = useNavigate();

    return (
        <div className="meeting-controls">

            <div  className="control-btn" style={{width: "80px"}}
              onClick={() => setTaskSection((prev=> !prev))}
            >
              Tasks
            </div> {/* Task */}

            <Camera videoRef={videoRef}/> {/* Camera */}

            <Mic videoRef={videoRef} /> {/* Mic */}

            <div  className="control-btn"  onClick={()=> console.log("Share screen")}>
                <MdOutlineLaptop size={24} />
            </div> {/* Screen Share */}

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
    );
}

export default Controls;
