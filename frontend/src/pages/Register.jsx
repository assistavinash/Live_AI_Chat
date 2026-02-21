import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';
import '../styles/theme.css';
import '../styles/Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim()
    };

    console.log('Register attempt - Sending data:', {
      ...trimmedData,
      password: trimmedData.password.length + ' characters'
    });
    
    try {
      const res = await axios.post(
        'http://localhost:3000/api/auth/register',
        {
          fullName: {
            firstName: trimmedData.firstName,
            lastName: trimmedData.lastName
          },
          email: trimmedData.email,
          password: trimmedData.password
        },
        {
          withCredentials: true
        }
      );
      
      console.log('Registration Success:', res);
      
      // Store login status
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(res.data.user || { email: trimmedData.email }));
      
      // Redirect to home
      navigate('/');
    } catch (err) {
      console.error('Register Error - Full Error:', err);
      console.error('Response Data:', err.response?.data);
      console.error('Status Code:', err.response?.status);
      
      // Show detailed error message
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Create Account</h1>
      <p>Join us today and get started</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p>
        Already have an account?{' '}
        <Link to="/login">Sign in here</Link>
      </p>
    </div>
  );
}
