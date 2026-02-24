import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';
import '../styles/theme.css';
import '../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    
    try {
      const res = await axios.post(
        "https://live-ai-chat.onrender.com/api/auth/login",
        {
          email: trimmedEmail,
          password: trimmedPassword
        },
        {
          withCredentials: true
        }
      );

      
      // Store login status
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(res.data.user || { email: trimmedEmail }));
      
      navigate("/");
    } catch (err) {
      console.error('Login Error - Full Error:', err);
      console.error('Response Data:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      // Better error messages
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.message || 'Invalid email or password';
      } else if (err.response?.status === 404) {
        errorMsg = 'User not found';
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        errorMsg = 'Cannot connect to server. Make sure backend is running on port 3000';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <p>Sign in to your account to continue</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <Link to="/register">Create one here</Link>
      </p>
    </div>
  );
}
