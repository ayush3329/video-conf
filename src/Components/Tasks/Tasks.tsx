
type SidebarType = 'none' | 'chat' | 'tasks' | 'transcription';

export default function Tasks({toggleSidebar,  taskSection}: {toggleSidebar: (type: SidebarType) => void, taskSection: boolean}) {
  return (
    <div className="sidebar-panel" style={{width: taskSection ? "350px" : "0px", opacity: 1, border: taskSection ? "1px solid #e0e0e0" : ""}}>
        {taskSection && <>
            <div className="sidebar-header">
                <h5>Assigned Tasks</h5>
                <button className="btn btn-light px-1 py-0" onClick={() => toggleSidebar('tasks')}>
                <i className="bi bi-x-lg"></i>
                </button>
            </div>
            <div className="split-container">
                <div id="tasks_list" className="scrollable-list">
                {/* Task items map here */}
                <div className="text-muted small text-center mt-4">No tasks yet</div>
                </div>
            </div>
        </>}
    </div>
  )
}
