import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import RatingStars from './RatingStars';
import '../assets/Productdetail.css';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  // Fetch product data from the API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(` https://dermeze.onrender.com/api/products/${id}/`);
        setProduct(response.data); // Set product data
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity); // Add the product with the selected quantity to the cart
  };

  const handleWishlistToggle = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id); // Remove from wishlist if already added
    } else {
      addToWishlist(product); // Add to wishlist if not already added
    }
  };

  // Increment the quantity (up to stock limit)
  const increment = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };


  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Construct image URL if needed
  let imageUrl = product.image_url;
  if (imageUrl && !imageUrl.startsWith('http://127.0.0.1:8000')) {
    imageUrl = `http://127.0.0.1:8000${imageUrl}`;
  }

  return (
    <>
      <div className="product-detail-container">
        <div className="product-detail">

          <img src={product.image || '/media/default-placeholder.jpg'} alt={product.name} />
          <div className="product-info">
            <h1>{product.name}</h1>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Price:</strong> ${product.discount_price || product.price}</p>
            {product.rating && <div className="rating"><RatingStars rating={product.rating} /></div>}

            <p><strong>Skin Type:</strong> {product.skin_type}</p>
            <p><strong>Ingredients:</strong> {product.ingredients}</p>
            <p><strong>Usage Instructions:</strong> {product.usage_instructions}</p>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Stock Available:</strong> {product.stock} units</p>

            {/* Quantity Section */}
            <div className="quantity-container">
              <button onClick={decrement} className="quantity-btn">-</button>
              <span className="quantity">{quantity}</span>
              <button onClick={increment} className="quantity-btn">+</button>
            </div>

            {/* Wishlist Button */}
            <button className="wishlist-button" onClick={handleWishlistToggle}>
              {isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            </button>

            {/* Add to Cart Button */}
            <button className="addto-cart" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
