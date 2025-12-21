import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UtensilsCrossed, ShoppingBag, ClipboardList, LogOut, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getCartCount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <UtensilsCrossed size={28} />
        <span>BiteCraft</span>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'CUSTOMER' && (
              <>
                <Link 
                  to="/" 
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  Restaurants
                </Link>
                <Link 
                  to="/orders" 
                  className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
                >
                  <ClipboardList size={18} />
                  My Orders
                </Link>
                <Link 
                  to="/cart" 
                  className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                >
                  <ShoppingBag size={18} />
                  Cart
                  {getCartCount() > 0 && (
                    <span className="badge-count">{getCartCount()}</span>
                  )}
                </Link>
              </>
            )}

            {user.role === 'RESTAURANT_OWNER' && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}

            <div className="user-tag">
              <User size={14} />
              <span>{user.email.split('@')[0]}</span>
              <span className="user-tag-role">({user.role.replace('_', ' ')})</span>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
