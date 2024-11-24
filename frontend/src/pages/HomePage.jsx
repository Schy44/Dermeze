import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // This should now work since AuthContext is exported as default
import modelImage from "../assets/Images/model.png";
import '../assets/HomePage.css';

const HomePage = () => {
    const { authTokens, logoutUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]); // New state for products
    const navigate = useNavigate();

    useEffect(() => {
        // If no authTokens, redirect to login
        if (!authTokens) {
            navigate('/login'); // Redirect to login page
            return;
        }
        console.log(authTokens?.access);
        // Fetch profile and products if authenticated
        getProfile();
        getProducts();
    }, [authTokens, navigate]);

    // Fetch Profile Data
    const getProfile = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data);  // Here, `data` should contain the profile information along with `user` details

        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.message);
            logoutUser();
        } finally {
            setLoading(false);
        }
    };

    // Fetch Products from the Database
    const getProducts = async () => {
        if (!authTokens) {
            setError('You are not authenticated');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/products/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authTokens?.access}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Error fetching products');
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="homepage">
            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar-logo">Dermeze</div>
                <ul className="navbar-links">
                    <li><a href="#home">Home</a></li>
                    <li><Link to="/productList">Products</Link></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#cart">Cart</a></li>
                    <li><button onClick={logoutUser}>Logout</button></li>
                </ul>
            </nav>

            {/* Profile Section */}
            <div className="profile-section">
                {/* Displaying username if available */}
                <h1>Welcome, {profile?.user?.username || 'User'}!</h1>
                <img src={modelImage} alt="User Model" className="profile-image" />
                <p>Personalized skincare recommendations based on your profile.</p>
            </div>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to Dermeze</h1>
                    <p>Discover personalized skincare products just for you!</p>
                    <a href="#shop" className="shop-now-button">Shop Now</a>
                </div>
            </header>

            {/* Featured Products Section */}
            <section className="featured-products" id="products">
                <h2>Featured Products</h2>
                <div className="products-grid">
                    {/* Dynamic Product Cards */}
                    {products.length > 0 ? (
                        products.map(product => (
                            <div className="product-card" key={product.id}>
                                <img src={product.image} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p>${product.price}</p>
                            </div>
                        ))
                    ) : (
                        <p>No products available</p>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2024 Dermeze. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
