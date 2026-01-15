import { useState } from 'react';
import { IoSend } from 'react-icons/io5';


type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

const Chat = ({toggleSidebar,  chatSection}: {toggleSidebar: (type: SidebarType) => void, chatSection: boolean}) => {
    
    const [inputMessage, setInputMessage] = useState("");

    return (
        <div className="sidebar-panel" style={{width: chatSection ? "350px" : "0px", opacity: 1, border: chatSection ? "1px solid #e0e0e0" : ""}}>
            {chatSection && <>
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
                    <IoSend size={22} />
                </button>
                </div>
            </>}
        </div>
    );
}

export default Chat;
