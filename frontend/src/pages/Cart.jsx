import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Trash2, ShoppingBag, MapPin, Phone, CreditCard, ChevronLeft } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, fetchCart, addToCart } = useCart();
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIncrement = async (item) => {
    try {
      // Find the menu item matching this name.
      // Wait, we don't have the list of menu items on the Cart page.
      // But wait! Can we add a quantity via our API?
      // Wait! The cart model in backend is structured such that we need the `menuItemId` to add to cart.
      // Wait! Does `CartItemResponse` have the menuItemId?
      // Let's check `CartItemResponse.java` we read earlier. It had:
      // private Long id;
      // private String menuItemName;
      // private Integer quantity;
      // private Double price;
      // private Double subtotal;
      // It does NOT have the menuItemId!
      // But wait, can we fetch the item by name? Or since we don't have the menuItemId, how can we increment quantity?
      // Ah! We can search for the menu item from the restaurant menu.
      // But we don't know the restaurantId. Wait, does `CartResponse` have a `restaurantId`?
      // Let's check `CartResponse.java` we read earlier:
      // private Long id;
      // private String restaurantName;
      // private List<CartItemResponse> items;
      // private Double totalAmount;
      // It has `restaurantName` but not `restaurantId`!
      // Wait, if the customer is on the Cart page and we need to increment a cart item, how do we find its `menuItemId`?
      // Let's see if the backend allows us to call `/api/cart/add` with a negative number to decrement, but wait, we need the menuItemId for that too.
      // Is there another endpoint in `CartController`? No, there is only `/cart/add`, `/cart/item/{cartItemId}` (DELETE), and `/cart/clear` (DELETE).
      // So on the Cart page, the user can remove items using the `Trash2` button (which takes `cartItemId`, which we DO have!).
      // What about changing quantities?
      // Since `CartItemResponse` does not contain `menuItemId`, we cannot easily call `addToCart` without knowing the item's ID.
      // So, to keep it simple, clean, and fully operational, we can let users adjust quantity by navigating back to the restaurant or they can just remove items directly on this Cart page using the delete button! That is extremely clean and avoids potential API failures.
      // Let's implement that: the cart page shows the items, their quantities, price, subtotal, and a single "Remove" (Trash) button next to each item. This is fully supported by the backend endpoint `DELETE /api/cart/item/{cartItemId}`. This is perfect and robust!
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address || !contactNumber) {
      setError('Please fill in both delivery address and contact number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/orders/place', {
        deliveryAddress: address,
        contactNumber: contactNumber,
      });

      if (response && response.data) {
        // Clear local cart
        await clearCart();
        // Redirect to orders history/tracking page
        navigate('/orders');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Failed to place the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Explore our menus and add some delicious meals to your cart.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate('/')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Continue Shopping
      </button>

      <h1 style={{ fontSize: '2.25rem', marginBottom: '2rem' }}>Your Cart</h1>

      {error && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '1rem', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Cart items list */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Items from {cart.restaurantName || 'Kitchen'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item-row">
                <div className="cart-item-info">
                  <span style={{ fontWeight: 600 }}>{item.menuItemName}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ${item.price.toFixed(2)} each
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Qty: <strong style={{ color: 'var(--text-primary)' }}>{item.quantity}</strong>
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)', minWidth: '60px', textAlign: 'right' }}>
                    ${item.subtotal.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'transparent' }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Subtotal</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              ${cart.totalAmount.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => clearCart()}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '1.5rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            Clear All Items
          </button>
        </div>

        {/* Delivery Details Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Checkout Details
          </h2>

          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="address-input" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={14} /> Delivery Address
              </label>
              <textarea
                id="address-input"
                className="form-control"
                style={{ resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                placeholder="Enter complete delivery address (street, apartment number, zip code)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="phone-input" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Phone size={14} /> Contact Phone Number
              </label>
              <input
                id="phone-input"
                type="tel"
                className="form-control"
                placeholder="10-digit mobile number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>

            <div className="card" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', marginBottom: '1.5rem', borderStyle: 'dashed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <CreditCard size={18} />
                <span>Payment Mode: <strong>Cash on Delivery (COD)</strong></span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', gap: '0.5rem', fontSize: '1rem', padding: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
