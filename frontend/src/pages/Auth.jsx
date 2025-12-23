import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Store, ShieldAlert, Lock, Mail, Phone, Edit2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // Default CUSTOMER
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(email, password);
        if (data.role === 'CUSTOMER') {
          navigate('/');
        } else if (data.role === 'RESTAURANT_OWNER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        if (!name || !email || !password || !role) {
          throw new Error('All fields marked as required must be filled.');
        }
        const data = await register(name, email, password, phone, role);
        if (data.role === 'CUSTOMER') {
          navigate('/');
        } else if (data.role === 'RESTAURANT_OWNER') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <div className="auth-tabs">
          <div 
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </div>
          <div 
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </div>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
            <ShieldAlert size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name-input">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="name-input"
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email-input">Email Address</label>
            <input 
              id="email-input"
              type="email" 
              className="form-control" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-input">Password</label>
            <input 
              id="password-input"
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="phone-input">Phone Number</label>
                <input 
                  id="phone-input"
                  type="tel" 
                  className="form-control" 
                  placeholder="+1 (555) 000-0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Select User Role</label>
                <div className="role-cards">
                  <div 
                    className={`role-card ${role === 'CUSTOMER' ? 'active' : ''}`}
                    onClick={() => setRole('CUSTOMER')}
                  >
                    <User size={24} />
                    <span className="role-card-title">Customer</span>
                  </div>
                  <div 
                    className={`role-card ${role === 'RESTAURANT_OWNER' ? 'active' : ''}`}
                    onClick={() => setRole('RESTAURANT_OWNER')}
                  >
                    <Store size={24} />
                    <span className="role-card-title">Owner</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
