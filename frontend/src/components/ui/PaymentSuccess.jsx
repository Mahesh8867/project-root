import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import fetchWithAuth from '../utils/fetch';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id');

  useEffect(() => {
    // Optionally update order status to 'Paid'
    if (orderId) {
      fetchWithAuth(`http://localhost:8000/mark-order-paid/${orderId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(res => res.json())
        .then(() => {
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/orders'); // redirect to My Orders
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to mark order as paid', err);
          navigate('/orders'); // redirect anyway
        });
    }
  }, [orderId, navigate]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>🎉 Payment Successful!</h2>
      <p>Redirecting you to your orders...</p>
    </div>
  );
};

export default PaymentSuccess;
