import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To get dynamic route params
import axios from 'axios'; // For fetching data from the API
import RatingStars from './RatingStars'; // Assuming you have a rating component
import '../assets/productdetail.css';
import Footer from '../components/Footer'; // Footer still included
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null); // State to store fetched product
  const [quantity, setQuantity] = useState(1); // Quantity state for the product
  const { addToCart } = useCart(); // Cart context for adding to the cart
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist(); // Wishlist context

  // Fetch product data from the API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
        setProduct(response.data); // Set product data
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div>Loading...</div>; // Loading state while fetching data
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

  // Decrement the quantity (down to 1)
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
    <> <div className="product-detail-container">
      <div className="product-detail">
        {/* Use the fixed image URL */}
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
