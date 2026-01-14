import React, { useState } from 'react';


type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

const Chat = ({toggleSidebar, width}: {toggleSidebar: (type: SidebarType) => void, width: string}) => {
    
    const [inputMessage, setInputMessage] = useState("");


    return (
        <div className="sidebar-panel" style={{width: width, opacity: 1, border: width === "0px" ? "" : "1px solid #e0e0e0"}}>
              
            <div className="sidebar-header">
            <h5>In-call messages</h5>
            <button className="btn btn-light px-1 py-0" onClick={() => toggleSidebar('chat')}>
                <i className="bi bi-x-lg"></i>
            </button>
            </div>

            <div className="sidebar-content" id="chat_list">
                {/* Chat messages map here */}
            </div>

            <div className="input_section border rounded-5 input-group gap-2">
            <input 
                value={inputMessage}
                onChange={(e)=> setInputMessage(e.target.value)}
                type="text" 
                className="form-control py-1 rounded-5" 
                id="chat_input"
                placeholder="Type a message..." 
            />
            <button className="btn btn-light rounded-5" type="button">
                <i className="bi bi-send"></i>
            </button>
            </div>
        </div>
    );
}

export default Chat;
