import { useEffect, useRef } from "react";

const RemoteVideoTile = ({ stream, username }: { stream: MediaStream | null, username: string }) => {
    console.log(`Receving video stream of ${username}`);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        }
    }, [stream]);
    
    return (
    <div className="video-tile">
      {stream ? (
        <video ref={videoRef} autoPlay playsInline className="video-element" />
      ) : (
        <div className="no-video-placeholder">
            <div className="avatar">{username.charAt(0).toUpperCase()}</div>
        </div>
      )}
      <span className="user-label">{username}</span>
    </div>
    );
};

export default RemoteVideoTile