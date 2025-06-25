import React, { useEffect, useState } from 'react';
import fetchWithAuth from '../utils/fetch';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchWithAuth('http://localhost:8000/place/order/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error('Failed to fetch orders:', err));
  }, []);

  return (
    <div className="container">
      <h2>Your Orders</h2>
      {orders.length > 0 ? (
        <div className="product-grid">
          {orders.map((item, index) => (
            <div key={index} className="product-card">
              <img src={`http://localhost:8000${item.photo}`} alt={item.product_name} />
              <div className="product-title">{item.product_name}</div>
              <div><strong>Quantity:</strong> {item.quantity}</div>
              <div className="product-price">₹{item.price_at_purchase}</div>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default MyOrders;
