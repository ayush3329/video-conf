import React, { useState } from 'react';
import  wemeetlogo  from "../../assets/images/wemeetlogo.png"
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/states/store';
import { userState } from '../../types/redux-state-types';
import { saveUserDetail } from '../../redux/states/user/userSlice';
import { useSignInMutation } from '../../redux/apis/auth';

export default function MeetLoginPage() {

  const dispatch = useDispatch<AppDispatch>();
  const userData: userState = useSelector((state:RootState)=> state.user)

  // apis
  const [signIn, {data, isLoading, isError, error}] = useSignInMutation();

  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if(username && password) {
        console.log("Login Attempt:", { username, password });
        signIn({username, password})
        // dispatch(saveUserDetail({isSignedIn: true, name: username}))
    } else {
        alert("Please fill in all fields");
    }
  };

  return (
    <div className="meet-login-wrapper">
      <div className="login-container">
        <img className="logo" src={wemeetlogo} alt="WeMeet Logo" />
        
        <h2 className="text-center">Login</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              placeholder="Enter username" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              placeholder="Enter password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Login</button>

        </form>
      </div>
    </div>
  );
}