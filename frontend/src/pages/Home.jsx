import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Phone, Star, Utensils } from 'lucide-react';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');
        if (response && response.data) {
          setRestaurants(response.data);
        }
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to fetch restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate a premium gradient based on restaurant ID to look spectacular
  const getGradient = (id) => {
    const gradients = [
      'linear-gradient(135deg, #ff5e3a 0%, #ffb830 100%)',
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    ];
    return gradients[id % gradients.length];
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Premium Hero Banner */}
      <div className="hero">
        <div className="hero-glow"></div>
        <h1>Craving something delicious?</h1>
        <p>Order from the best local restaurants and get your food delivered hot and fresh in minutes.</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search restaurants, cuisines (e.g. Italian, Fast Food)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" aria-label="Search button">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Popular Restaurants</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {filteredRestaurants.length} active kitchens open now
          </p>
        </div>
        {user?.role === 'RESTAURANT_OWNER' && (
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Manage My Restaurants
          </button>
        )}
      </div>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {filteredRestaurants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Utensils size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No open restaurants found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            We couldn't find any restaurants matching your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            >
              {/* Premium image placeholder using dynamic gradients */}
              <div
                style={{
                  height: '160px',
                  background: getGradient(restaurant.id),
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                }}
              >
                <Utensils size={48} style={{ opacity: 0.8 }} />
                <span
                  className="badge badge-success"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(16, 185, 129, 0.95)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  Open
                </span>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{restaurant.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <Star size={16} fill="currentColor" />
                      <span>4.5</span>
                    </div>
                  </div>

                  <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
                    {restaurant.cuisineType}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} style={{ flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{restaurant.address}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <Phone size={14} />
                  <span>{restaurant.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
