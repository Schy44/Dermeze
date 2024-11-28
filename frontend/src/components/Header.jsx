import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/Header.css';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { cartItems } = useCart();
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">Dermeze</Link>
                </div>
                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/productList">Products</Link>
                    <Link to="/cart">
                        Cart <span className="cart-count">({itemCount})</span>
                    </Link>
                    {/* Add Wishlist link */}
                    <Link to="/wishlist">Wishlist</Link>
                    {user ? (
                        <span onClick={logoutUser} className="auth-link">Logout</span>
                    ) : (
                        <Link to="/login" className="auth-link">Login</Link>
                    )}
                    {user && <p className="welcome-message">Hello, {user.username}!</p>}
                </nav>
            </div>
        </header>
    );
};

export default Header;