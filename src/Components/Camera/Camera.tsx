import { CiVideoOff, CiVideoOn } from 'react-icons/ci';
import { RootState, AppDispatch } from '../../redux/states/store';
import { mediaState } from '../../types/redux-state-types';
import { useDispatch, useSelector } from 'react-redux';
import { turnOffCamera, turnOnCamera } from '../../redux/states/media-controls/mediaControlSlice';

const Camera = ({videoRef}: {videoRef: React.RefObject<null>}) => {
    const dispatch = useDispatch<AppDispatch>()
    const mediaControl: mediaState = useSelector((state: RootState)=> state.media);
    
    const toggleCamera = async () => {
    if (mediaControl.camera) {
        // 1. TURNING OFF: Find video track and stop it (Releases hardware light)
        const tracks = videoRef.current.getVideoTracks();
        tracks.forEach(track => {
        track.stop(); // Stops the hardware
        videoRef.current.removeTrack(track); // Removes from stream object
        });
        dispatch(turnOffCamera())
    } else {
        // 2. TURNING ON: We must request access again
        try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true }); //asked browser for only camera access
        const newVideoTrack = newStream.getVideoTracks()[0]; //extracted the video Track, to append it into exisiting stream, which may contain audio track already

        // Add the new video track to our existing stream (so audio keeps working if it's on)
        
        const currentStream = videoRef.current.srcObject;

        if (currentStream) {
            currentStream.addTrack(newVideoTrack);
        } else {
            // If stream was completely dead, re-initialize it
            videoRef.current.srcObject = newStream; 
        }

        dispatch(turnOnCamera());
        } catch (err) {
        console.error("Error restarting video:", err);
        }
    }
    };
    
    return (
        <div  className="control-btn"  onClick={toggleCamera}>
            {mediaControl.camera ? <CiVideoOn size={24} /> : <CiVideoOff size={24} />}
        </div>
    );
}

export default Camera;
