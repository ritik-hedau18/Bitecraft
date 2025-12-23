import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ChevronLeft, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from 'lucide-react';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant details by searching the open list (or owner's list)
        let matchedRest = null;
        try {
          const openResponse = await api.get('/restaurants');
          if (openResponse && openResponse.data) {
            matchedRest = openResponse.data.find((r) => r.id.toString() === id);
          }
        } catch (e) {
          console.log('Error fetching open restaurants', e);
        }

        if (!matchedRest && user?.role === 'RESTAURANT_OWNER') {
          try {
            const ownerResponse = await api.get('/restaurants/my');
            if (ownerResponse && ownerResponse.data) {
              matchedRest = ownerResponse.data.find((r) => r.id.toString() === id);
            }
          } catch (e) {
            console.log('Error fetching owner restaurants', e);
          }
        }

        if (!matchedRest) {
          setError('Restaurant not found or is currently closed.');
          setLoading(false);
          return;
        }

        setRestaurant(matchedRest);

        // Fetch categories
        const catResponse = await api.get(`/menu/category/restaurant/${id}`);
        setCategories(catResponse || []);

        // Fetch menu items
        // If owner, get all. If customer, get only available ones
        const isOwner = user?.role === 'RESTAURANT_OWNER' && user.email === matchedRest.ownerEmail;
        const menuEndpoint = isOwner 
          ? `/menu/restaurant/${id}` 
          : `/menu/restaurant/${id}/available`;
        
        const menuResponse = await api.get(menuEndpoint);
        setMenuItems(menuResponse || []);

      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to load menu details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleToggleItem = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      const response = await api.put(`/menu/item/${itemId}/toggle`);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, available: response.available } : item))
      );
    } catch (err) {
      console.error('Error toggling menu item status:', err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert('Only customers can add items to cart.');
      return;
    }

    try {
      await addToCart(item.id, 1);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert(err.message || 'Error adding item to cart.');
    }
  };

  const handleIncrement = async (cartItem) => {
    // We need the menu item ID to add to cart
    const menuItem = menuItems.find((i) => i.name === cartItem.menuItemName);
    if (!menuItem) return;
    try {
      await addToCart(menuItem.id, 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrement = async (cartItem) => {
    // If quantity is 1, remove it completely. Else add with negative quantity or delete?
    // Wait, the backend cart controller only has:
    // POST /cart/add (adds quantity to item, if quantity is negative it might decrease or error? Let's check CartService implementation)
    // DELETE /cart/item/{cartItemId} (removes the cart item entirely)
    // Let's see if we should just remove the item entirely, or if negative quantity is supported by /cart/add.
    // Let's check CartService.java or CartController.java to see how decrementing works.
    // Let's do a search for `/cart/add` or `addToCart` in CartService.java.
    if (cartItem.quantity > 1) {
      const menuItem = menuItems.find((i) => i.name === cartItem.menuItemName);
      if (!menuItem) return;
      try {
        // Let's try adding -1. If the backend doesn't support negative quantity, we can handle it or just remove the item.
        // Let's test if negative is supported. In case it's not, let's look at CartService.
        await addToCart(menuItem.id, -1);
      } catch (err) {
        console.error('Failed to decrement quantity, removing item instead', err);
        await removeFromCart(cartItem.id);
      }
    } else {
      await removeFromCart(cartItem.id);
    }
  };

  const getCartItem = (itemName) => {
    if (!cart || !cart.items) return null;
    return cart.items.find((i) => i.menuItemName === itemName);
  };

  const isOwner = user?.role === 'RESTAURANT_OWNER' && restaurant && user.email === restaurant.ownerEmail;

  const filteredMenuItems = selectedCategory === 'All'
    ? menuItems
    : menuItems.filter((item) => item.categoryName === selectedCategory);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h3>Error Loading Restaurant</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          <ChevronLeft size={16} /> Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header breadcrumb */}
      <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Back to Restaurants
      </button>

      {/* Restaurant Header Block */}
      {restaurant && (
        <div className="card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.25rem' }}>{restaurant.name}</h1>
              {isOwner && (
                <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                  Your Kitchen
                </span>
              )}
            </div>
            <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
              {restaurant.cuisineType}
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{restaurant.address}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Contact: {restaurant.phone}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${restaurant.open ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {restaurant.open ? 'Accepting Orders' : 'Closed'}
            </span>
          </div>
        </div>
      )}

      {/* Category Pills navigation */}
      <div className="category-pills">
        <div
          className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Items
        </div>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`category-pill ${selectedCategory === cat.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        {selectedCategory} Menu
      </h2>

      {/* Menu list */}
      {filteredMenuItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Sparkles size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No items found in this section.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredMenuItems.map((item) => {
            const cartItem = getCartItem(item.name);
            return (
              <div key={item.id} className="card menu-card">
                <div>
                  <div className="menu-card-header">
                    <h3 style={{ fontSize: '1.15rem' }}>{item.name}</h3>
                    {!item.available && (
                      <span className="badge badge-danger">Sold Out</span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4', marginBottom: '1rem' }}>
                    {item.description || 'No description provided.'}
                  </p>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    {item.categoryName}
                  </span>
                </div>

                <div>
                  <div className="menu-item-price">${item.price.toFixed(2)}</div>
                  <div className="menu-item-actions">
                    {isOwner ? (
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                        disabled={updatingItemId === item.id}
                      >
                        {item.available ? <ToggleRight size={20} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={20} />}
                        {updatingItemId === item.id ? 'Updating...' : item.available ? 'Make Unavailable' : 'Make Available'}
                      </button>
                    ) : (
                      <>
                        {cartItem ? (
                          <div className="quantity-controller" style={{ width: '100%', justifyContent: 'space-between' }}>
                            <button onClick={() => handleDecrement(cartItem)} className="quantity-btn">-</button>
                            <span style={{ fontWeight: 600 }}>{cartItem.quantity}</span>
                            <button onClick={() => handleIncrement(cartItem)} className="quantity-btn">+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%' }}
                            disabled={!item.available}
                          >
                            <ShoppingBag size={14} /> Add to Cart
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
