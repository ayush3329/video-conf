import React from 'react'


type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

export default function Transcription({toggleSidebar,  transcriptionSection}: {toggleSidebar: (type: SidebarType) => void, transcriptionSection: boolean}) {
  return (
     <div className="sidebar-panel" style={{width: transcriptionSection ? "350px" : "0px", opacity: 1, border: transcriptionSection ? "1px solid #e0e0e0" : ""}}>
        
        {transcriptionSection &&<> 
            <div className="sidebar-header">
                <h5>Transcription</h5>
                <button className="btn btn-light px-1 py-0" onClick={() => toggleSidebar('transcription')}>
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            <div className="split-container">
                <div className="split-top">
                    <div className="panel_heading">Live Transcription</div>
                    <div className="scrollable-list" id="transcription_list"></div>
                </div>
                <div className="split-bottom">
                    <div className="panel_heading">Suggested Questions</div>
                    <div className="scrollable-list" id="suggested_questions_list"></div>
                </div>
            </div>
        </>}
    </div>
    
    

  )
}
