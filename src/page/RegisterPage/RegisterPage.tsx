import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registering:", formData);
    // Add your axios.post('/register', formData) logic here
  };

  return (
    <div className="account-pages my-5 pt-sm-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <Link to="/" className="auth-logo mb-5 d-block">
                 <img src="/assets/images/logo-dark.png" alt="" height="30" className="logo logo-dark" />
                 <img src="/assets/images/logo-light.png" alt="" height="30" className="logo logo-light" />
              </Link>
              <h4>Sign up</h4>
              <p className="text-muted mb-4">Get your Chatvia account now.</p>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <div className="input-group mb-3 bg-light-subtle rounded-3">
                      <span className="input-group-text text-muted"><i className="ri-mail-line"></i></span>
                      <input 
                        type="email" 
                        className="form-control form-control-lg border-light bg-light-subtle" 
                        placeholder="Enter Email"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <div className="input-group mb-3 bg-light-subtle rounded-3">
                      <span className="input-group-text text-muted"><i className="ri-user-2-line"></i></span>
                      <input 
                        type="text" 
                        className="form-control form-control-lg border-light bg-light-subtle" 
                        placeholder="Enter Username"
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <div className="input-group mb-3 bg-light-subtle rounded-3">
                      <span className="input-group-text text-muted"><i className="ri-lock-2-line"></i></span>
                      <input 
                        type="password" 
                        className="form-control form-control-lg border-light bg-light-subtle" 
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="d-grid">
                    <button className="btn btn-primary waves-effect waves-light" type="submit">Sign up</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p>Already have an account? <Link to="/login" className="fw-medium text-primary">Signin</Link></p>
              <p>© {new Date().getFullYear()} Chatvia. Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesbrand</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}