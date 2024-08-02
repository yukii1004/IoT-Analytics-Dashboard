import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { auth } from './firebase.jsx';
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!username || !password) {
        toast.warning("All fields are required.");
        return;
      }
      const email = `${username}@greenpmu.com`;
      await signInWithEmailAndPassword(auth, email, password); 
      toast.success("Login successful.", { position: "top-center" });
      window.location = "/";
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Incorrect username or password.");
      } else {
        toast.error(error.message);
        console.log(error);
      }
    }
  };

  return (
    <div className="container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className='login-input-fields'>
          <input 
            type="text"
            id="username"
            autoComplete="on"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button>Let's Go!</button>
      </form>
    </div>
  );
}

export default Login;
