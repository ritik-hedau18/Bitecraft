import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ClipboardList, Clock, Compass, CheckCircle2, ChevronRight, XCircle, AlertCircle } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my');
      if (response && response.data) {
        // Sort orders to show newest first
        const sorted = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sorted);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch your order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      // Update order locally to CANCELLED
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
      );
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.message || 'Could not cancel this order.');
    } finally {
      setCancellingId(null);
    }
  };

  // Helper to map order status to step number
  const getStatusStep = (status) => {
    const steps = {
      PENDING: 1,
      CONFIRMED: 2,
      PREPARING: 3,
      OUT_FOR_DELIVERY: 4,
      DELIVERED: 5,
    };
    return steps[status] || 0;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      case 'PENDING':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
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
      <h1 style={{ fontSize: '2.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ClipboardList size={32} style={{ color: 'var(--primary)' }} />
        My Orders
      </h1>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ClipboardList size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Your completed and active orders will be displayed here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => {
            const currentStep = getStatusStep(order.status);
            const isCancelled = order.status === 'CANCELLED';

            return (
              <div key={order.id} className="card" style={{ padding: '2rem' }}>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      From <strong>{order.restaurantName}</strong> • {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ padding: '0.5rem 1rem' }}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-2" style={{ alignItems: 'start', gap: '2.5rem' }}>
                  {/* Items List */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                      Order Summary
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                          <span>
                            <strong style={{ color: 'var(--primary)' }}>{item.quantity}x</strong> {item.menuItemName}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
                      <strong style={{ fontSize: '1.1rem' }}>Total Amount Paid</strong>
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.01)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                      Delivery Tracker
                    </h4>

                    {isCancelled ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        <XCircle size={32} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <div>
                          <h5 style={{ color: 'var(--danger)', fontSize: '0.95rem' }}>Order Cancelled</h5>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            This order was cancelled and will not be processed.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="timeline">
                        <div className={`timeline-step ${currentStep >= 1 ? 'completed' : ''} ${currentStep === 1 ? 'active' : ''}`}>
                          <div className="timeline-node">
                            <Clock size={14} />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-title">Placed</span>
                            <span className="timeline-desc">Waiting for restaurant confirmation</span>
                          </div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
                          <div className="timeline-node">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-title">Confirmed</span>
                            <span className="timeline-desc">Accepted by the restaurant</span>
                          </div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
                          <div className="timeline-node">
                            <Clock size={14} />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-title">Preparing</span>
                            <span className="timeline-desc">Chef is preparing your fresh meal</span>
                          </div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}`}>
                          <div className="timeline-node">
                            <Compass size={14} />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-title">Out for Delivery</span>
                            <span className="timeline-desc">Delivery agent is on the way</span>
                          </div>
                        </div>

                        <div className={`timeline-step ${currentStep >= 5 ? 'completed' : ''} ${currentStep === 5 ? 'active' : ''}`}>
                          <div className="timeline-node">
                            <CheckCircle2 size={14} />
                          </div>
                          <div className="timeline-content">
                            <span className="timeline-title">Delivered</span>
                            <span className="timeline-desc">Enjoy your delicious food!</span>
                          </div>
                        </div>
                      </div>
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

export default Orders;
