import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const ProductForm = ({ productToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    photo: null,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        price: productToEdit.price || '',
        description: productToEdit.description || '',
        category: productToEdit.category || '',
        photo: null,
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const url = productToEdit
      ? `http://localhost:8000/products/${productToEdit.id}/`
      : `http://localhost:8000/products/`;
  
    const method = productToEdit ? 'PUT' : 'POST';
  
    const token = localStorage.getItem('access_token');
    let userId = null;
  
    try {
      if (token) {
        const decoded = jwtDecode(token);
        userId = decoded.user_id || decoded.id || decoded.sub;
      }
    } catch (err) {
      console.error('Token decode error:', err);
    }
  
    // Show token and data being sent
    // console.log('Token being sent:', token);
    // console.log('User ID from token:', userId);
  
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (formData.photo) data.append('photo', formData.photo);
  
    // Log form data
    // for (let [key, value] of data.entries()) {
    //   // console.log(`${key}:`, value);
    // }
  
    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: data,
    })
      .then((response) => {
        console.log('Response status:', response.status);
        if (!response.ok) throw new Error('Failed to submit');
        return response.json();
      })
      .then(() => {
        onSuccess();
        setFormData({
          name: '',
          price: '',
          description: '',
          category: '',
          photo: null,
        });
      })
      .catch((error) => console.error('Form submit error:', error));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name:</label><br />
      <input type="text" name="name" value={formData.name} onChange={handleChange} required /><br />

      <label>Price:</label><br />
      <input type="number" name="price" value={formData.price} onChange={handleChange} required /><br />

      <label>Description:</label><br />
      <textarea name="description" value={formData.description} onChange={handleChange} required /><br />

      <label>Category:</label><br />
      <select name="category" value={formData.category} onChange={handleChange} required>
        <option value="">Select a category</option>
        <option value="shoes">Shoes</option>
        <option value="Clothing">Clothing</option>
        <option value="Electronics">Electronics</option>
        <option value="Others">Others</option>
      </select><br />

      <label>Photo:</label><br />
      <input type="file" name="photo" accept="image/*" onChange={handleChange} /><br /><br />

      <button type="submit">{productToEdit ? 'Update' : 'Create'} Product</button>
    </form>
  );
};

export default ProductForm;
