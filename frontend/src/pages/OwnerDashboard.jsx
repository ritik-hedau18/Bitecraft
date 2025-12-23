import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Store, Plus, PlusCircle, CheckCircle, Clock, AlertTriangle, Layers, Edit, ListOrdered, ShoppingBag, X } from 'lucide-react';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants', 'menu', 'orders'
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modals
  const [showRestModal, setShowRestModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Forms State
  const [newRest, setNewRest] = useState({ name: '', address: '', cuisineType: '', phone: '' });
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', categoryId: '' });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/my');
      if (response && response.data) {
        setRestaurants(response.data);
        if (response.data.length > 0 && !selectedRestId) {
          setSelectedRestId(response.data[0].id.toString());
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchMenuData = async (restId) => {
    if (!restId) return;
    try {
      const catResponse = await api.get(`/menu/category/restaurant/${restId}`);
      setCategories(catResponse || []);

      const menuResponse = await api.get(`/menu/restaurant/${restId}`);
      setMenuItems(menuResponse || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrdersData = async (restId) => {
    if (!restId) return;
    try {
      const ordResponse = await api.get(`/orders/restaurant/${restId}`);
      if (ordResponse && ordResponse.data) {
        // Sort orders so newest are at the top
        const sorted = ordResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedRestId) {
      if (activeTab === 'menu') {
        fetchMenuData(selectedRestId);
      } else if (activeTab === 'orders') {
        fetchOrdersData(selectedRestId);
      }
    }
  }, [selectedRestId, activeTab]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/restaurants', {
        name: newRest.name,
        address: newRest.address,
        cuisineType: newRest.cuisineType,
        contactNumber: newRest.phone, // mapping to backend expectations
      });
      if (response && response.data) {
        setNewRest({ name: '', address: '', cuisineType: '', phone: '' });
        setShowRestModal(false);
        await fetchRestaurants();
      }
    } catch (err) {
      alert(err.message || 'Error creating restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRestStatus = async (id) => {
    try {
      const response = await api.put(`/restaurants/${id}/toggle`);
      setRestaurants((prev) =>
        prev.map((r) => (r.id === id ? { ...r, open: response.data.open } : r))
      );
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/menu/category', {
        name: newCategory.name,
        description: newCategory.description,
        restaurantId: parseInt(selectedRestId),
      });
      setNewCategory({ name: '', description: '' });
      setShowCategoryModal(false);
      await fetchMenuData(selectedRestId);
    } catch (err) {
      alert(err.message || 'Error adding category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.categoryId) {
      alert('Please select a category first.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/menu/item', {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        categoryId: parseInt(newItem.categoryId),
        restaurantId: parseInt(selectedRestId),
        isAvailable: true,
      });
      setNewItem({ name: '', description: '', price: '', categoryId: '' });
      setShowItemModal(false);
      await fetchMenuData(selectedRestId);
    } catch (err) {
      alert(err.message || 'Error adding menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleItemStatus = async (itemId) => {
    try {
      const response = await api.put(`/menu/item/${itemId}/toggle`);
      setMenuItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, available: response.available } : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Endpoint requires status in Query Param
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert(err.message || 'Error updating order status');
    }
  };

  const getOrderStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      case 'PENDING': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getNextStatuses = (currentStatus) => {
    const flows = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING'],
      PREPARING: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };
    return flows[currentStatus] || [];
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem' }}>Owner Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your restaurant profiles, catalog items, and view incoming client orders.</p>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar tabs */}
        <div className="sidebar-menu card" style={{ height: 'fit-content' }}>
          <div 
            className={`sidebar-item ${activeTab === 'restaurants' ? 'active' : ''}`}
            onClick={() => setActiveTab('restaurants')}
          >
            <Store size={18} />
            My Kitchens
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'menu' ? 'active' : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            <Layers size={18} />
            Menu Catalogs
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ListOrdered size={18} />
            Orders Panel
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="dashboard-content">
          {activeTab === 'restaurants' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>My Restaurants</h2>
                <button onClick={() => setShowRestModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add Restaurant
                </button>
              </div>

              {restaurants.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Store size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>You don't have any restaurants added yet.</p>
                </div>
              ) : (
                <div className="grid grid-2">
                  {restaurants.map((r) => (
                    <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1.25rem' }}>{r.name}</h3>
                          <span className={`badge ${r.open ? 'badge-success' : 'badge-danger'}`}>
                            {r.open ? 'Open' : 'Closed'}
                          </span>
                        </div>
                        <span className="badge badge-info" style={{ marginBottom: '1rem' }}>
                          {r.cuisineType}
                        </span>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          {r.address}
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Phone: {r.phone}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <button 
                          onClick={() => handleToggleRestStatus(r.id)} 
                          className={`btn ${r.open ? 'btn-secondary' : 'btn-primary'} btn-sm`} 
                          style={{ flex: 1 }}
                        >
                          {r.open ? 'Close Kitchen' : 'Open Kitchen'}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedRestId(r.id.toString());
                            setActiveTab('menu');
                          }} 
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1 }}
                        >
                          Manage Menu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>Menu Settings</h2>
                  <select 
                    value={selectedRestId} 
                    onChange={(e) => setSelectedRestId(e.target.value)}
                    className="form-control"
                    style={{ padding: '0.5rem 1rem', width: '200px' }}
                  >
                    <option value="" disabled>Select Restaurant</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {selectedRestId && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowCategoryModal(true)} className="btn btn-secondary btn-sm">
                      <PlusCircle size={16} /> Add Category
                    </button>
                    <button onClick={() => setShowItemModal(true)} className="btn btn-primary btn-sm">
                      <Plus size={16} /> Add Menu Item
                    </button>
                  </div>
                )}
              </div>

              {!selectedRestId ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Please create or select a restaurant to manage menu settings.</p>
                </div>
              ) : (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                    Menu Catalog List ({menuItems.length} items)
                  </h3>

                  {menuItems.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No menu items found in this kitchen.</p>
                      <button onClick={() => setShowItemModal(true)} className="btn btn-primary btn-sm">
                        Create First Item
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {menuItems.map((item) => (
                        <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                              <h4 style={{ fontSize: '1.1rem' }}>{item.name}</h4>
                              <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{item.categoryName}</span>
                              {!item.available && <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Sold Out</span>}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.description}</p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <strong style={{ fontSize: '1.15rem', color: 'var(--secondary)' }}>${item.price.toFixed(2)}</strong>
                            <button 
                              onClick={() => handleToggleItemStatus(item.id)} 
                              className={`btn ${item.available ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                            >
                              {item.available ? 'Set Out of Stock' : 'Set In Stock'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Manage Orders</h2>
                <select 
                  value={selectedRestId} 
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="form-control"
                  style={{ padding: '0.5rem 1rem', width: '200px' }}
                >
                  <option value="" disabled>Select Restaurant</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {!selectedRestId ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>Please select a restaurant to view customer orders.</p>
                </div>
              ) : (
                <div>
                  {orders.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                      <p style={{ color: 'var(--text-secondary)' }}>No orders placed at this restaurant yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {orders.map((o) => (
                        <div key={o.id} className="card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                            <div>
                              <h4 style={{ fontSize: '1.1rem' }}>Order #{o.id}</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Placed by {o.customerName} on {new Date(o.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`badge ${getOrderStatusBadgeClass(o.status)}`} style={{ padding: '0.35rem 0.75rem' }}>
                              {o.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Items List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            {o.items.map((item) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                <span>{item.quantity}x {item.menuItemName}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>${item.subtotal.toFixed(2)}</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', fontWeight: 600 }}>
                              <span>Total Amount</span>
                              <span style={{ color: 'var(--secondary)' }}>${o.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            <p><strong>Deliver To:</strong> {o.deliveryAddress}</p>
                          </div>

                          {/* Quick Actions flow */}
                          {getNextStatuses(o.status).length > 0 && (
                            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                              {getNextStatuses(o.status).map((nextStatus) => (
                                <button
                                  key={nextStatus}
                                  onClick={() => handleUpdateOrderStatus(o.id, nextStatus)}
                                  className={`btn ${nextStatus === 'CANCELLED' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                                  style={{ flex: 1 }}
                                >
                                  {nextStatus === 'CONFIRMED' && 'Accept Order'}
                                  {nextStatus === 'PREPARING' && 'Start Cooking'}
                                  {nextStatus === 'OUT_FOR_DELIVERY' && 'Send for Delivery'}
                                  {nextStatus === 'DELIVERED' && 'Mark Delivered'}
                                  {nextStatus === 'CANCELLED' && 'Reject/Cancel'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 1. Add Restaurant Modal */}
      {showRestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowRestModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Restaurant</h3>
            <form onSubmit={handleAddRestaurant}>
              <div className="form-group">
                <label htmlFor="rest-name">Restaurant Name</label>
                <input 
                  id="rest-name"
                  type="text" 
                  className="form-control" 
                  value={newRest.name} 
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })} 
                  placeholder="e.g. Bella Italia"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="rest-cuisine">Cuisine Type</label>
                <input 
                  id="rest-cuisine"
                  type="text" 
                  className="form-control" 
                  value={newRest.cuisineType} 
                  onChange={(e) => setNewRest({ ...newRest, cuisineType: e.target.value })} 
                  placeholder="e.g. Italian, Fast Food, Bakery"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="rest-address">Address Location</label>
                <input 
                  id="rest-address"
                  type="text" 
                  className="form-control" 
                  value={newRest.address} 
                  onChange={(e) => setNewRest({ ...newRest, address: e.target.value })} 
                  placeholder="Street No, Area, Zip"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="rest-phone">Contact Number</label>
                <input 
                  id="rest-phone"
                  type="tel" 
                  className="form-control" 
                  value={newRest.phone} 
                  onChange={(e) => setNewRest({ ...newRest, phone: e.target.value })} 
                  placeholder="Phone number"
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowCategoryModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label htmlFor="cat-name">Category Name</label>
                <input 
                  id="cat-name"
                  type="text" 
                  className="form-control" 
                  value={newCategory.name} 
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                  placeholder="e.g. Starters, Main Course, Desserts"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="cat-desc">Description</label>
                <input 
                  id="cat-desc"
                  type="text" 
                  className="form-control" 
                  value={newCategory.description} 
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
                  placeholder="Short description of items in category"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Menu Item Modal */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setShowItemModal(false)} className="modal-close"><X size={20} /></button>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Create Menu Item</h3>
            <form onSubmit={handleAddMenuItem}>
              <div className="form-group">
                <label htmlFor="item-category">Select Category</label>
                <select 
                  id="item-category"
                  value={newItem.categoryId} 
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="form-control"
                  required
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="item-name">Item Name</label>
                <input 
                  id="item-name"
                  type="text" 
                  className="form-control" 
                  value={newItem.name} 
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                  placeholder="e.g. Margherita Pizza"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-price">Unit Price ($)</label>
                <input 
                  id="item-price"
                  type="number" 
                  step="0.01" 
                  className="form-control" 
                  value={newItem.price} 
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} 
                  placeholder="e.g. 12.99"
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="item-desc">Description</label>
                <textarea 
                  id="item-desc"
                  className="form-control" 
                  value={newItem.description} 
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
                  placeholder="Describe ingredients, allergens..."
                  style={{ minHeight: '60px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
