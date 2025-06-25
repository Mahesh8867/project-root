import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import fetchWithAuth from '../utils/fetch'; // adjust the path

const ProductInfo = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchWithAuth(`http://localhost:8000/products/info/${id}/`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
      })
      .catch(err => {
        console.error("Error fetching product info:", err);
      });
  }, [id]);

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => Math.max(1, prev - 1));

  const addToCart = () => {
    fetchWithAuth('http://localhost:8000/cart/add/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product: product.id, quantity }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Cart updated:', data);
        alert('Item added to cart!');
        setQuantity(1); // Reset after adding
      })
      .catch(error => console.error('Error:', error));
  };

  if (!product) return <p>Loading product info...</p>;

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "600px",
      margin: "auto",
      fontFamily: "sans-serif"
    }}>
      <h2 style={{ marginBottom: "1rem" }}>Product Details</h2>
      <img
        src={product.photo}
        alt={product.name}
        style={{
          width: "100%",
          maxHeight: "300px",
          objectFit: "cover",
          borderRadius: "10px",
          marginBottom: "1rem"
        }}
      />
      <h3 style={{ marginBottom: "0.5rem" }}>{product.name}</h3>
      <p><strong>Price:</strong> ₹{product.price}</p>
      <p><strong>Description:</strong> {product.description}</p>

      <div style={{ margin: "1rem 0", display: "flex", alignItems: "center", gap: "10px" }}>
        <button onClick={decrementQty} style={qtyBtnStyle}>−</button>
        <span style={qtyDisplayStyle}>{quantity}</span>
        <button onClick={incrementQty} style={qtyBtnStyle}>+</button>
      </div>

      <button
        onClick={addToCart}
        className="cart-btn"
        style={{
          padding: "10px 20px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Add to Cart
      </button>
    </div>
  );
};

const qtyBtnStyle = {
  backgroundColor: "#e5e7eb",
  border: "none",
  padding: "8px 16px",
  fontSize: "1.2rem",
  borderRadius: "6px",
  cursor: "pointer"
};

const qtyDisplayStyle = {
  fontSize: "1.1rem",
  fontWeight: "bold",
  minWidth: "30px",
  textAlign: "center"
};

export default ProductInfo;
