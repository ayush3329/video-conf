import React from 'react';

export default function ChatPage() {
  return (
    <div className="layout-wrapper d-lg-flex">
        {/* Left Sidebar (Navigation) */}
        <div className="side-menu flex-lg-column me-lg-1">
            <div className="navbar-brand-box">
                <a href="/" className="logo logo-dark">
                    <span className="logo-sm">
                        <img src="/assets/images/logo.svg" alt="" height="30" />
                    </span>
                </a>
            </div>
            {/* ... Add your sidebar icons here (Profile, Chat, Groups, Contacts, Settings) ... */}
        </div>

        {/* Chat Left Sidebar (User List) */}
        <div className="chat-leftsidebar me-lg-1">
            <div className="tab-content">
                <div className="tab-pane fade show active" id="pills-chat" role="tabpanel">
                    <div className="px-4 pt-4">
                        <h4 className="mb-4">Chats</h4>
                        <div className="search-box chat-search-box">
                            <div className="input-group mb-3 rounded-3">
                                <span className="input-group-text text-muted bg-light pe-1 ps-3" id="basic-addon1">
                                    <i className="ri-search-line search-icon font-size-18"></i>
                                </span>
                                <input type="text" className="form-control bg-light" placeholder="Search messages or users" />
                            </div>
                        </div>
                    </div>
                    {/* User List would go here */}
                    <div className="px-2">
                       <h5 className="mb-3 px-3 font-size-16">Recent</h5>
                       <ul className="list-unstyled chat-list chat-user-list">
                          <li>
                              <a href="#">
                                  <div className="d-flex">
                                      <div className="chat-user-img align-self-center me-3 ms-0">
                                          <div className="avatar-xs"><span className="avatar-title rounded-circle bg-primary-subtle text-primary">P</span></div>
                                      </div>
                                      <div className="flex-grow-1 overflow-hidden">
                                          <h5 className="text-truncate font-size-15 mb-1">Patrick Hendricks</h5>
                                          <p className="chat-user-message text-truncate mb-0">Hey! there I'm available</p>
                                      </div>
                                  </div>
                              </a>
                          </li>
                       </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* User Chat (Right Side) */}
        <div className="user-chat w-100 overflow-hidden">
            <div className="d-lg-flex">
                <div className="w-100 overflow-hidden position-relative">
                    <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
                        <div className="row align-items-center">
                            <div className="col-sm-4 col-8">
                                <h5 className="font-size-16 mb-0 text-truncate">Patrick Hendricks</h5>
                            </div>
                        </div>
                    </div>

                    {/* Chat Conversation Area */}
                    <div className="chat-conversation p-3 p-lg-4" id="chat-conversation" data-simplebar>
                        <ul className="list-unstyled mb-0">
                            <li className="right">
                                <div className="conversation-list">
                                    <div className="chat-avatar">
                                        <img src="/assets/images/users/avatar-1.jpg" alt="" />
                                    </div>
                                    <div className="user-chat-content">
                                        <div className="ctext-wrap">
                                            <div className="ctext-wrap-content">
                                                <p className="mb-0">Good morning, How are you?</p>
                                                <p className="chat-time mb-0"><i className="ri-time-line align-middle"></i> 10:00</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-3 p-lg-4 border-top mb-0">
                       <div className="row g-0">
                          <div className="col">
                              <input type="text" className="form-control form-control-lg bg-light border-light" placeholder="Enter Message..." />
                          </div>
                          <div className="col-auto">
                              <button type="submit" className="btn btn-primary chat-send waves-effect waves-light">
                                  <i className="ri-send-plane-2-fill align-bottom"></i>
                              </button>
                          </div>
                       </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}