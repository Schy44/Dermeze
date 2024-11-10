import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useWishlist } from '../contexts/WishlistContext';

const WishlistButton = ({ item }) => {
    const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
    const wishlisted = isWishlisted(item.id);

    const toggleWishlist = () => {
        if (wishlisted) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item);
        }
    };

    return (
        <button className={`wishlist-btn ${wishlisted ? 'wishlisted' : ''}`} onClick={toggleWishlist}>
            {wishlisted ? <FaHeart /> : <FaRegHeart />}
            <span>{wishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
        </button>
    );
};

export default WishlistButton;
