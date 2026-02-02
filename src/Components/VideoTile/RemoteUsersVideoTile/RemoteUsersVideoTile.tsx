import { useEffect, useRef } from "react";
import { RemotePeer } from "../../../types/MeetingPannelType";

interface RemoteUsersVideoTileProps {
  stream: MediaStream | null,
  audioStream: MediaStream | null, // Added this
  username: string,
  height: number,
  width: number,
  avatarColor: string, 
  videoPaused: boolean,
  user: RemotePeer
}

const RemoteUsersVideoTile = ({user, videoPaused, avatarColor, stream, audioStream, username, height, width }: RemoteUsersVideoTileProps) => {
    console.log("video consumer ", user.videoConsumer)
    console.log("video videoStream", user.videoStream)
    console.log("video videoPaused", user.videoPaused)
    console.log("------------------------------------")
    console.log("audio consumer ", user.audioConsumer)
    console.log("audio audioStream ", user.audioStream)
    console.log("audio audioPaused ", user.audioPaused)
    console.log("\n\n\n")
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(()=>{
        if(videoPaused || !stream || !videoRef.current) return;
        
        videoRef.current.srcObject = stream;

        const playVideo = async ()=>{
            if(!videoRef.current) return;
            try {
                await videoRef.current.play();
                console.log("Stream playback resumed for:", username);
            } catch(e){
                console.warn("Playback failed or interrupted:", e);
            }
        }

        playVideo();
        
    }, [videoPaused, stream])



    // Handle Audio Stream Internally
    useEffect(() => {
        if (audioRef.current && audioStream) {
            audioRef.current.srcObject = audioStream;
        }
    }, [audioStream]);
    
    return (
        <div className='tile' style={{ width: `${width}px`, height: `${height}px`}}>
        
            {/* Video Feed */}
            
            <video ref={videoRef} muted={true} autoPlay playsInline className="video-feed" 
                style={{display: `${videoPaused ? "none" : "block"}`}}/>
            {
                videoPaused &&
                <div className="no-video-placeholder" 
                    style={{width: '100%', height: '100%', 
                            display:'flex', alignItems:'center', 
                            justifyContent:'center', color: 'white', 
                            backgroundColor: "#3c4043"}}>
                    <div className="avatar" style={{fontSize: '2rem', background: avatarColor}}>{username.charAt(0).toUpperCase()}</div>
                </div>
            }



            {/* {stream && !videoPaused ? (
                <video ref={videoRef} muted={true} autoPlay playsInline className="video-feed" />
            ) : (
                <div className="no-video-placeholder" style={{width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center', color: 'white', backgroundColor: tileColor}}>
                    <div className="avatar" style={{fontSize: '2rem', backgroundColor: avatarColor}}>{username.charAt(0).toUpperCase()}</div>
                </div>
            )} */}

            {/* Audio Element (Hidden) */}
            <audio ref={audioRef} autoPlay />

            {/* Overlay */}
            <div className='tile-overlay'>
                <span className='user-name'>{username}</span>
                <span className='mic-icon'>🎙️</span>
            </div>

            {/* Hover Layer */}
            <div className='tile-hover-layer'>
                <button className='hover-btn' title="Pin to screen">📌</button>
                <button className='hover-btn' title="More options">⋮</button>
            </div>
        </div>
    );
};

export default RemoteUsersVideoTile;