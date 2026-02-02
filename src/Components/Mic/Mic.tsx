import React, { useEffect } from 'react';
import { RootState, AppDispatch } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOffMic, turnOnMic } from '../../redux/states/media-controls/mediaControlSlice';
import { CiMicrophoneOff, CiMicrophoneOn } from 'react-icons/ci';

const Mic = ({videoRef, streamRef}: {videoRef: React.RefObject<HTMLVideoElement | null>, streamRef: React.RefObject<MediaStream>}) => {
    
    const dispatch = useDispatch<AppDispatch>()
    const mediaControl: mediaState = useSelector((state: RootState)=> state.media);

    const ensureStreamLinked = ()=>{
        if(videoRef.current && videoRef.current.srcObject !== streamRef.current){
            videoRef.current.srcObject = streamRef.current;
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
                dispatch(turnOnMic());

            } catch(err){
                console.error("Mic access denied", err);
            }
        }    
    }

    useEffect(()=>{
        if(mediaControl.mic) ensureStreamLinked();
    }, [mediaControl.mic])


    return (
        <div  className="control-btn"  onClick={toggleMic}>
            {mediaControl.mic ? <CiMicrophoneOn size={24}/> : <CiMicrophoneOff size={24}/>}
        </div>
    );
}

export default Mic;
