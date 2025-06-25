import React, { useEffect, useState } from 'react';
import ProductForm from './ProductForm';
import fetchWithAuth from '../utils/fetch';
import { jwtDecode } from 'jwt-decode';
import '../static/ProductList.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
const BASE_URL = "http://localhost:8000"
const ProductList = ({ showOnlyMine = false }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasOwnProducts, setHasOwnProducts] = useState(false);
  const [quantities, setQuantities] = useState({}); 
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.user_id || decoded.id || decoded.email);
      } catch (err) {
        console.error('Token decode error:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allRes = await fetchWithAuth('http://localhost:8000/products/');
        const allData = await allRes.json();

        setAllProducts(allData);

        const token = localStorage.getItem('access_token');
        if (token) {
          const decoded = jwtDecode(token);
          const userId = decoded.user_id || decoded.id || decoded.email;
          const ownsProducts = allData.some(p => p.creator_id === userId);
          setHasOwnProducts(ownsProducts);
        }

        const dataToSet = showOnlyMine
          ? await (await fetchWithAuth('http://localhost:8000/my_products/')).json()
          : allData;

        setProducts(dataToSet);

        // Initialize quantity for each product
        const initialQuantities = {};
        dataToSet.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, [showOnlyMine]);

  const handleDelete = (id) => {
    fetchWithAuth(`http://localhost:8000/products/${id}/`, {
      method: 'DELETE',
    })
      .then(() => {
        setProducts(prev => prev.filter(product => product.id !== id));
        setAllProducts(prev => prev.filter(product => product.id !== id));
      })
      .catch(error => console.error('Error deleting product:', error));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleFormSuccess = () => {
    setEditingProduct(null);
    fetchWithAuth('http://localhost:8000/products/')
      .then(res => res?.json())
      .then(data => {
        if (data) {
          setProducts(showOnlyMine ? data.filter(p => p.creator_id === currentUser) : data);
          setAllProducts(data);
        }
      });
  };

  const incrementQty = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: prev[productId] + 1,
    }));
  };

  const decrementQty = (productId) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, prev[productId] - 1),
    }));
  };

  const addToCart = (productId) => {
    const quantity = quantities[productId] || 1;

    fetchWithAuth('http://localhost:8000/cart/add/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: productId, quantity }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Cart updated:', data);
        alert('Item added to cart!');
        setQuantities(prev => ({ ...prev, [productId]: 1 })); // Reset to 1
      })
      .catch(error => console.error('Error:', error));
  };
  useEffect(() => {
  if (searchTerm.trim() === "") {
    setProducts(allProducts);
    return;
  }

  fetchWithAuth(`http://localhost:8000/products/?search=${searchTerm}`)
    .then(res => res.json())
    .then(data => {
      const results = Array.isArray(data) ? data : data.results || [];
      setProducts(results);
    })
    .catch(err => console.error(err));
}, [searchTerm]);
  return (
    <div className="product-list-container">
      <div className="product-header">
        <h1>Product List</h1>
      </div>
      <div>
  <input
    type="text"
    placeholder="Search products..."
    onChange={(e) => setSearchTerm(e.target.value)}
    value={searchTerm}
  />
  {searchTerm && (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  )}
</div>

      {editingProduct && (
        <div className="edit-form">
          <h2>Edit Product</h2>
          <ProductForm productToEdit={editingProduct} onSuccess={handleFormSuccess} />
          <button className="cancel-edit-btn" onClick={() => setEditingProduct(null)}>
            Cancel
          </button>
        </div>
      )}

      <div className="product-grid">
        {products.length > 0 ? (
          products.map(product => (
            <div className="product-card" key={product.id}>
              <img src={product.photo} alt={product.name} />
              <div className="product-title">{product.name}</div>
              <div className="product-price">₹{product.price}</div>

              <Link to={`/product/${product.id}`}>
                <button className="info-btn">Info</button>
              </Link>

              <div className="quantity-controls">
                <button className="qty-btn" onClick={() => decrementQty(product.id)}>-</button>
                <span className="qty-display">{quantities[product.id]}</span>
                <button className="qty-btn" onClick={() => incrementQty(product.id)}>+</button>
              </div>

              <div className="product-actions">
                {showOnlyMine && (
                  <>
                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product.id)}>Delete</button>
                  </>
                )}
                <button className="cart-btn" onClick={() => addToCart(product.id)}>Add to Cart</button>
              </div>
              
            </div>
          ))
        ) : (
          <div className="no-products-msg">No products found.
          <p>Create Your Product</p>
          <ProductForm productToEdit={editingProduct} onSuccess={handleFormSuccess} />          
          </div>
        )}
       

      </div>
    </div>
  );
};

export default ProductList;
