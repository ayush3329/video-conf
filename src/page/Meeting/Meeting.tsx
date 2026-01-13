import { useState } from 'react'
import useStream from '../../Hooks/useStream';
import { AppDispatch, RootState } from '../../redux/states/store';
import { useDispatch, useSelector } from 'react-redux';
import { mediaState } from '../../types/redux-state-types';
import { useSearchParams } from "react-router-dom";
import { turnOnCamera, turnOnMic, turnOffCamera, turnOffMic } from "../../redux/states/media-controls/mediaControlSlice"


export default function Meeting({videoRef}: {videoRef: React.RefObject<null>}) {
    const [searchParams] = useSearchParams();
    const username = searchParams.get("username") || "unknown";
    const dispatch = useDispatch<AppDispatch>()
    const mediaControl: mediaState = useSelector((state: RootState)=> state.media)

    // Meeting UI State
    const [activeSidebar, setActiveSidebar] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');

    const {socket, isConnected, emit, on} = useStream("ws://localhost:2000/socket.io")

    const handleSendMessage = () => {
        if (chatInput.trim()) {
            setMessages([...messages, { user: 'Me', text: chatInput }]);
            setChatInput('');
        }
    };

    const toggleSidebar = (viewName) => {
        setActiveSidebar(activeSidebar === viewName ? null : viewName);
    };
    
    return (
        
        <div className="meeting-view">
            <div className="video-container">
                <div className={`video-grid ${activeSidebar ? 'shrink' : ''}`}>
                {/* User Box */}
                <div className="participant-box">
                    {mediaControl.camera ? (
                        <video ref={videoRef} autoPlay playsInline muted style={{width:'100%', height:'100%', objectFit:'cover', transform:'scaleX(-1)'}} />
                    ) : (
                        <div className="text-white h1">{username.charAt(0) || 'U'}</div>
                    )}
                    <div className="name-tag">{username} (You)</div>
                </div>
                {/* Remote User Mock */}
                <div className="participant-box">
                    <div className="text-white h1">R</div>
                    <div className="name-tag">Remote User</div>
                </div>
                </div>

                {/* SIDEBARS */}
                {['tasks', 'chat', 'transcription'].map(view => (
                    <div key={view} className={`sidebar-panel ${activeSidebar === view ? 'active' : ''}`}>
                    <div className="sidebar-header">
                        <h5 className="m-0 text-capitalize">{view}</h5>
                        <button className="btn btn-sm btn-light" onClick={() => setActiveSidebar(null)}><i className="bi bi-x-lg"></i></button>
                    </div>
                    <div className="sidebar-content">
                        {view === 'chat' ? (
                            <>
                            <div className="flex-grow-1 mb-2">
                                {messages.map((msg, idx) => (
                                <div key={idx} className="mb-2">
                                    <strong>{msg.user}: </strong><span className="text-break">{msg.text}</span>
                                </div>
                                ))}
                            </div>
                            <div className="input-group">
                                <input 
                                type="text" 
                                className="form-control rounded-pill" 
                                placeholder="Type message..." 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                            </div>
                            </>
                        ) : <p className="text-muted text-center mt-3">Content for {view}...</p>}
                    </div>
                    </div>
                ))}
            </div>

            {/* BOTTOM CONTROLS */}
            <div className="meeting-controls">
                <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => toggleSidebar('tasks')}>Tasks</button>
                <button className={`btn ${mediaControl.camera ? 'btn-light' : 'btn-danger'}`} 
                    onClick={() => {
                        if(mediaControl.camera) dispatch(turnOffCamera());
                        else dispatch(turnOnCamera())
                    }}
                >
                <i className={`bi bi-camera-video${mediaControl.camera ? '-fill' : '-off-fill'}`}></i>
                </button>
                <button className={`btn ${mediaControl.mic ? 'btn-light' : 'btn-danger'}`} 
                    onClick={() => {
                        if(mediaControl.mic) dispatch(turnOffMic());
                        else dispatch(turnOnMic())
                    }}
                >
                <i className={`bi bi-mic${mediaControl.mic ? '-fill' : '-mute-fill'}`}></i>
                </button>
                <button className="btn btn-light"><i className="bi bi-laptop"></i></button>
                <button className="btn btn-danger" onClick={() => window.location.href = '/'}>
                <i className="bi bi-telephone-x-fill"></i>
                </button>
                <button className="btn btn-light" onClick={() => toggleSidebar('chat')}><i className="bi bi-chat-left"></i></button>
                <button className="btn btn-light" onClick={() => toggleSidebar('transcription')}><i className="bi bi-badge-cc"></i></button>
            </div>
        </div>
        
        
        

    )
}
