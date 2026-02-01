import React, { useEffect } from 'react'
import { mediaState } from '../../../types/redux-state-types';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/states/store';


interface HostVideoTileProps {
    videoRef: React.RefObject<HTMLVideoElement | null>,
    height: number,
    width: number,
    username: string,
    remoteUser: number,
    avatarColor: string,
}

export default function HostVideoTile({avatarColor, height, width, videoRef, username, remoteUser}:HostVideoTileProps) {
  const mediaControl: mediaState = useSelector((state: RootState) => state.media);
  return (
     <div className='tile' style={{ width: `${remoteUser == 0 ? "55%" : `${width}px`}`, 
          height: `${remoteUser == 0 ? "90%" : `${height}px`}`}}>
      
      <video ref={videoRef} muted={true} autoPlay playsInline className="video-feed" 
             style={{display: `${mediaControl.camera ? "block" : "none"}`}}/>
      {
        !mediaControl.camera &&
         <div className="no-video-placeholder" 
            style={{width: '100%', height: '100%', 
                    display:'flex', alignItems:'center', 
                    justifyContent:'center', color: 'white', 
                    backgroundColor: "#3c4043"}}>
              <div className="avatar" style={{fontSize: '2rem', background: avatarColor}}>{username.charAt(0).toUpperCase()}</div>
          </div>
      }

      <div className='tile-overlay'>
        <span className='user-name'>{username}</span>
        <span className='mic-icon'>🎙️</span>
      </div>

      <div className='tile-hover-layer'>
        <button className='hover-btn' title="Pin to screen">📌</button>
        <button className='hover-btn' title="More options">⋮</button>
      </div>
    </div>
    

  )
}
