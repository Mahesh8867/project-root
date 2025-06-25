import React, { useEffect, useState } from 'react';
import fetchWithAuth from '../utils/fetch';
import { Link } from 'react-router-dom';

const BASE_URL = "http://localhost:8000";

const CartPage = () => {
  const [products, setProducts] = useState([]);

  const fetchCart = () => {
    fetchWithAuth(`${BASE_URL}/products/cart/`)
      .then(res => res.json())
      .then(data => setProducts(data || []))
      .catch(err => console.error('Cart fetch error:', err));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleDelete = (productId) => {
    fetchWithAuth(`${BASE_URL}/products/cart/${productId}/`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.status === 204) {
          setProducts(prev => prev.filter(p => p.product_id !== productId));
        } else {
          console.error('Failed to delete item');
        }
      })
      .catch(err => console.error('Delete error:', err));
  };

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Your Cart</h2>

      {products.length > 0 ? (
        <div className="cart-grid">
          {products.map(product => (
            <div key={product.id} className="cart-item">
              <img
                src={`${BASE_URL}${product.photo}`}
                alt={product.product_name}
                className="cart-image"
              />
              <div className="cart-details">
                <h3 className="cart-name">{product.product_name}</h3>
                <p className="cart-description">
                  {product.product_description || 'No description available'}
                </p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p className="cart-price">₹{product.product_price}</p>

                <div className="cart-actions">
                  <button
                    onClick={() => handleDelete(product.product_id)}
                    className="delete-button"
                  >
                    ❌ Remove
                  </button>

            <Link to="/place-order" className="cart-btn">
              ✅ Place Order
            </Link>

                </div>
              </div>
            </div>
          ))}
          
        </div>
      ) : (
        <p className="cart-empty">🛍️ Your cart is empty.</p>
      )}
    </div>
  );
};

export default CartPage;
