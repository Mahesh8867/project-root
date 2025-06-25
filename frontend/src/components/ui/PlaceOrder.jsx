import React from 'react';
import fetchWithAuth from '../utils/fetch';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with your publishable test key
const stripePromise = loadStripe('pk_test_51Rd8nEHBX1B8Oi2Ip34dhonxzVj5WtEgurYe3mi27fvljnOPmUPRCy60TRCEvmu31q8t0iPHLnQwLaQMKkMWwsmI00YbMg8zj5'); // Replace with your own key

const PlaceOrder = () => {
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    try {
      // First: place the order in your backend
      const orderResponse = await fetchWithAuth('http://localhost:8000/place/order/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!orderResponse.ok) throw new Error('Order placement failed');
      const orderData = await orderResponse.json();

      // Second: create Stripe Checkout session
      const stripeSession = await fetchWithAuth('http://localhost:8000/create-checkout-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderData.id }),
      });

      const sessionData = await stripeSession.json();

      // Third: Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({ sessionId: sessionData.id });

      if (result.error) {
        alert(result.error.message);
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong while placing the order or redirecting to payment.');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Place Your Order</h2>
      <button
        onClick={handlePlaceOrder}
        className="cart-btn"
        style={{ fontSize: '1rem', padding: '10px 20px', borderRadius: '10px' }}
      >
        ✅ Confirm & Pay
      </button>
    </div>
  );
};

export default PlaceOrder;
