import React from 'react';
import { RootState, AppDispatch } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOffMic, turnOnMic } from '../../redux/states/media-controls/mediaControlSlice';
import { CiMicrophoneOff, CiMicrophoneOn } from 'react-icons/ci';

const Mic = ({videoRef}: {videoRef: React.RefObject<null>}) => {
    
    const dispatch = useDispatch<AppDispatch>()
    const mediaControl: mediaState = useSelector((state: RootState)=> state.media);

    const toggleMic = async () => {
        if (mediaControl.mic) {
            // 1. TURNING OFF: Stop audio track (Releases microphone)
            const tracks = videoRef.current.getAudioTracks();
            tracks.forEach(track => {
                track.stop(); 
                videoRef.current.removeTrack(track);
            });
            dispatch(turnOffMic());
        } else {
            // 2. TURNING ON: Request audio access again
            try {
            const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const newAudioTrack = newStream.getAudioTracks()[0];

            if (videoRef.current){
                videoRef.current.addTrack(newAudioTrack);
            } else{
                videoRef.current = newStream;
            }

            dispatch(turnOnMic());
            } catch (err) {
                console.error("Error restarting audio:", err);
            }
        }
    };


    return (
        <div  className="control-btn"  onClick={toggleMic}>
            {mediaControl.mic ? <CiMicrophoneOn size={24}/> : <CiMicrophoneOff size={24}/>}
        </div>
    );
}

export default Mic;
