import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import '../assets/Product.css';

const Product = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const { addToCart } = useCart();
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
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

    // Construct image URL
    let imageUrl = product.image_url;
    if (imageUrl && !imageUrl.startsWith('http://127.0.0.1:8000')) {
        imageUrl = `http://127.0.0.1:8000${imageUrl}`;
    }

    const handleAddToCart = () => {
        addToCart(product);
    };

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
                    src={imageUrl || '/media/default-placeholder.jpg'}
                    alt={product.name || "Product Image"}
                    className="product-detail-image"
                />
                <div className="product-info">
                    <h2>{product.name}</h2>
                    <p>Price: ${product.discount_price || product.price}</p>
                    {product.rating && <p>Rating: {product.rating} / 5</p>}
                    <p>Category: {product.category ? product.category.name : 'N/A'}</p>
                    <p>Skin Type: {product.skin_type}</p>
                    {product.skin_concerns?.length > 0 && (
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
