// App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './components/ui/NavBar';
import ProductList from './components/ui/ProductList';
import ProductForm from './components/ui/ProductForm';
import LoginForm from './components/ui/LoginForm';
import RegisterForm from './components/ui/RegisterForm';
import CartPage from './components/ui/cart';
import ProductInfo from './components/ui/ProductInfo';
import PlaceOrder from './components/ui/PlaceOrder';
import MyOrders from './components/ui/myorders';
import PaymentSuccess from './components/ui/PaymentSuccess';

import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ⏳ for initial auth check

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsLoggedIn(true);
      } catch (error) {
        console.warn('Invalid token. Logging out...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUser(null);
      }
    }
    setLoading(false); // Done checking
  }, []);

  const handleLogin = (accessToken) => {
    try {
      const decoded = jwtDecode(accessToken);
      setUser(decoded);
      setIsLoggedIn(true);
      localStorage.setItem('access_token', accessToken);
    } catch (err) {
      console.error('Token decode failed:', err);
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20%' }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? <ProductList user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route
      path="/Register"
      element={
        isLoggedIn ? (
          <Navigate to="/" replace /> // or `/dashboard`
        ) : (
          <RegisterForm />
        )
      }
      />

        <Route
          path="/new-product"
          element={
            isLoggedIn ? <ProductForm user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/my-products" element={<ProductList showOnlyMine={true} />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductInfo />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
