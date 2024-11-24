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

    // Function to check if an item is in the wishlist
    const isWishlisted = (id) => {
        return wishlist.some(item => item.id === id);
    };

    // Add item to wishlist
    const addToWishlist = (item) => {
        if (!isWishlisted(item.id)) {
            setWishlist([...wishlist, item]);
        } else {
            alert("This item is already in your wishlist!");
        }
    };

    // Remove item from wishlist
    const removeFromWishlist = (id) => {
        setWishlist(wishlist.filter(item => item.id !== id));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
            {children}
        </WishlistContext.Provider>
    );
};
