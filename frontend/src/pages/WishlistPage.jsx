import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import '../assets/WishlistPage.css'; // Assuming you've created the Wishlist.css

const Wishlist = () => {
    const { wishlist, removeFromWishlist, addToWishlist } = useWishlist();
    const { addToCart } = useCart(); // Use addToCart from CartContext

    const handleAddToWishlist = (item) => {
        // Check if item is already in the wishlist
        if (wishlist.some(existingItem => existingItem.id === item.id)) {
            alert("This item is already in your wishlist!"); // Simple alert (you can replace this with a modal or custom popup)
        } else {
            addToWishlist(item); // Add item to wishlist if not already added
        }
    };

    const handleAddToCart = (item) => {
        addToCart(item); // Add item to cart
    };

    return (
        <div className="wishlist-page">
            <h2>Your Wishlist</h2>
            {wishlist.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map(item => (
                        <div key={item.id} className="wishlist-card">
                            <img src={item.image} alt={item.name} className="wishlist-image" />
                            <div className="wishlist-info">
                                <h4>{item.name}</h4>
                                <p className="price">${item.price}</p>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="add-to-cart-button"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    className="remove-from-wishlist-button"
                                >
                                    Remove from Wishlist
                                </button>
                                <button
                                    onClick={() => handleAddToWishlist(item)}
                                    className="add-to-wishlist-button"
                                >
                                    {wishlist.some(existingItem => existingItem.id === item.id) ? "Already in Wishlist" : "Add to Wishlist"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
