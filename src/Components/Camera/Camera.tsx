import { CiVideoOff, CiVideoOn } from 'react-icons/ci';
import { RootState, AppDispatch } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOffCamera, turnOnCamera } from '../../redux/states/media-controls/mediaControlSlice';
import { useEffect } from 'react';

const Camera = ({videoRef, streamRef}: {videoRef: React.RefObject<HTMLVideoElement | null>, streamRef: React.RefObject<MediaStream>}) => {
    const dispatch = useDispatch<AppDispatch>()
    const mediaControl: mediaState = useSelector((state: RootState)=> state.media);
 
    const ensureStreamLinked = ()=>{
        if(videoRef.current && videoRef.current.srcObject !== streamRef.current){
            videoRef.current.srcObject = streamRef.current;
        }
    }
    
    const toggleCamera = async()=>{
      
        if(mediaControl.camera){
            const videoTrack = streamRef.current.getVideoTracks();
            videoTrack.forEach((track)=>{
                track.stop();
                streamRef.current.removeTrack(track);
                
            })
            dispatch(turnOffCamera());
        } else{
            try{
                const newStream = await navigator.mediaDevices.getUserMedia({video: true});
                const newTrack = newStream.getVideoTracks()[0];
                
                streamRef.current.addTrack(newTrack);
                dispatch(turnOnCamera());

            } catch(err){
                console.error("Camera access denied", err);
            }
        }
        
    }

    useEffect(()=>{
        if(mediaControl.camera) ensureStreamLinked();
    }, [mediaControl.camera])


    return (
        <div  className="control-btn"  onClick={toggleCamera}>
            {mediaControl.camera ? <CiVideoOn size={24} /> : <CiVideoOff size={24} />}
        </div>
    );
}

export default Camera;
