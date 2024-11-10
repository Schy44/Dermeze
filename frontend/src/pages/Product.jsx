import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext'; // Importing the useCart hook
import { useWishlist } from '../context/WishlistContext'; // Importing the useWishlist hook
import '../assets/Product.css';

const Product = () => {
    const { id } = useParams(); // Get product ID from the URL
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart(); // Access the addToCart function from CartContext
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist(); // Access wishlist functions

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
                console.log("Product fetched:", response.data);  // Debugging line
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product:", error);
            }
        };
        fetchProduct();
    }, [id]);

    if (!product) {
        return <p>Loading product details...</p>;
    }

    // Fixing image URL construction
    let imageUrl = product.image_url;
    if (imageUrl && !imageUrl.startsWith('http://127.0.0.1:8000')) {
        imageUrl = `http://127.0.0.1:8000${imageUrl}`;
    }

    console.log("Image URL:", imageUrl);  // Debugging line

    // Function to handle the Add to Cart button click
    const handleAddToCart = () => {
        addToCart(product); // Add the product to the cart using the addToCart function
    };

    // Function to toggle wishlist status
    const handleWishlistToggle = () => {
        if (isWishlisted(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div className="product-detail">
            <div className="product-detail-container">
                <img
                    src={imageUrl || '/media/default-placeholder.jpg'} // Fallback image
                    alt={product.name || "Product Image"}
                    className="product-detail-image"
                />
                <div className="product-info">
                    <h2>{product.name}</h2>
                    <p>Price: ${product.discount_price || product.price}</p>
                    {product.rating && <p>Rating: {product.rating} / 5</p>}
                    <p>Category: {product.category ? product.category.name : 'N/A'}</p>
                    <p>Skin Type: {product.skin_type}</p>
                    {product.skin_concerns && product.skin_concerns.length > 0 && (
                        <div>
                            <h4>Skin Concerns:</h4>
                            <ul>
                                {product.skin_concerns.map((concern) => (
                                    <li key={concern.id || concern.name}>{concern.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {product.ingredients && (
                        <div>
                            <h4>Ingredients:</h4>
                            <p>{product.ingredients}</p>
                        </div>
                    )}
                    {product.usage_instructions && (
                        <div>
                            <h4>Usage Instructions:</h4>
                            <p>{product.usage_instructions}</p>
                        </div>
                    )}
                    <p>Brand: {product.brand}</p>
                    <p>Stock: {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>

                    {/* Buttons */}
                    <div className="button-container">
                        <button className="add-to-cart-button" onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                        <button className="wishlist-button" onClick={handleWishlistToggle}>
                            {isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                        </button>
                        <button className="go-back-button" onClick={() => window.history.back()}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
