import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ title }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-brand" onClick={() => navigate('/dashboard')}>
          <span className="navbar-icon">{'\uD83C\uDFAD'}</span>
          AI Theater Manager
        </span>
        {title && <span className="navbar-divider">|</span>}
        {title && <span className="navbar-title">{title}</span>}
      </div>
      <div className="navbar-right">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/custom-views')}>
          Theater Views
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
