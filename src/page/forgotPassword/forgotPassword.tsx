import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="account-pages my-5 pt-sm-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <Link to="/" className="auth-logo mb-5 d-block">
                 <img src="/assets/images/logo-dark.png" height="30" className="logo logo-dark" alt="logo" />
              </Link>
              <h4>Reset Password</h4>
              <p className="text-muted mb-4">Reset Password with Chatvia.</p>
            </div>

            <div className="card">
              <div className="card-body p-4">
                <div className="p-3">
                  <div className="alert alert-info text-center mb-4" role="alert">
                    Enter your Email and instructions will be sent to you!
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); console.log('Reset email sent to', email); }}>
                    <div className="mb-4">
                      <label className="form-label">Email</label>
                      <div className="input-group mb-3 bg-light-subtle rounded-3">
                        <span className="input-group-text text-muted"><i className="ri-mail-line"></i></span>
                        <input 
                          type="email" 
                          className="form-control form-control-lg border-light bg-light-subtle" 
                          placeholder="Enter Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="d-grid">
                      <button className="btn btn-primary waves-effect waves-light" type="submit">Reset</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <p>Remember It? <Link to="/login" className="fw-medium text-primary">Signin</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}