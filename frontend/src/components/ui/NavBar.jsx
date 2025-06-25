import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import fetchWithAuth from '../utils/fetch';
import { GoHome } from "react-icons/go";
const Navbar = ({ onLogout, isLoggedIn, user }) => {
  const navigate = useNavigate();
  const [hasOwnProducts, setHasOwnProducts] = useState(false);

  useEffect(() => {
    const checkOwnProducts = async () => {
      try {
        const res = await fetchWithAuth('http://localhost:8000/my_products/');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHasOwnProducts(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user products:', error);
      }
    };

    if (isLoggedIn) {
      checkOwnProducts();
    }
  }, [isLoggedIn]);
  // Optional: fetch existing orders (not used here but fixed)
  
  return (
    <nav className="navbar">
      <h2 className="head">E-commerce App</h2>
      
      {isLoggedIn && user && (
        <div className="user-actions">
          <span className="welcome">
            Welcome, {user.name || user.email || `User ${user.user_id}`}!
          </span>
          <button className='Home-button' onClick={() => navigate('/')}>
            Home
            <GoHome style={{ height: '16px', marginLeft: '6px' }} />
          </button>
          {hasOwnProducts && (
            <button
              className="my-products-btn"
              onClick={() => navigate('/my-products')}
            >
              My Products
            </button>
          )}
          
          <button onClick={() => navigate('/cart')} className="my-cart">
            <FaShoppingCart style={{ marginRight: '6px' }} />
            My Cart
          </button>
          <button onClick={() => navigate('/my-orders')} className="my-orders">Your orders</button>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
