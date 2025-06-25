import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ✅ Needed for redirection

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status === 201) {
          // ✅ Success → navigate to login
          alert('Registration successful. Please login.');
          navigate('/login');
        } else {
          setError(body.error || 'Registration failed.');
        }
      })
      .catch(err => {
        console.error('Registration error:', err);
        setError('Registration failed. Please try again.');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} value={formData.name} required />
      <input name="email" placeholder="Email" onChange={handleChange} value={formData.email} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} value={formData.password} required />
      <button type="submit">Register</button>
      <button className='back-to-login' type="button" onClick={() => navigate('/login')}>
  Back to Login
</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default RegisterForm;
