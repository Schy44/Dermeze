import React, { createContext, useContext, useState } from 'react';

// Create WishlistContext
const WishlistContext = createContext();

// Custom hook to use the WishlistContext
export const useWishlist = () => {
    return useContext(WishlistContext);
};

// Wishlist provider component
export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    // Add item to wishlist
    const addToWishlist = (item) => {
        // Check if item already exists in wishlist
        if (!wishlist.some(existingItem => existingItem.id === item.id)) {
            setWishlist([...wishlist, item]);
        } else {
            alert("This item is already in your wishlist!"); // Or you can display a custom popup
        }
    };

    // Remove item from wishlist
    const removeFromWishlist = (id) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
