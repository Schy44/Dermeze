import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import the Cart context
import '../assets/ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart(); // Use addToCart function from Cart context

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/products/');
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchProducts();
        fetchCategories();
    }, []);

    if (loading) {
        return <p>Loading products...</p>;
    }

    const handleAddToCart = (product) => {
        addToCart(product); // Add the product to the cart
    };

    return (
        <div className="product-list-page">
            <aside className="sidebar">
                <h3>Filter</h3>

                <div className="filter-section">
                    <h4>Category</h4>
                    {categories.map((category) => (
                        <div key={category.id} className="filter-option">
                            <label>
                                <input type="checkbox" />
                                {category.name}
                            </label>
                        </div>
                    ))}
                </div>
            </aside>

            <div className="product-list">
                <h2>Our Products</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <Link to={`/product/${product.id}`}>
                                <img
                                    src={product.image_url || "placeholder_image_url"}
                                    alt={product.name || "Product Image"}
                                    className="product-image"
                                />
                                {product.isNew && <div className="product-badge">New</div>}
                            </Link>
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="price">
                                    ${product.discount_price ?? product.price}
                                    {product.discount_price && <span className="old-price">${product.price}</span>}
                                </p>
                                {product.rating ? <p className="rating">Rating: {product.rating} / 5</p> : <p>No rating available</p>}
                                <button className="add-to-cart-button" onClick={() => handleAddToCart(product)}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="newsletter">
                <h2>Subscribe to our newsletter</h2>
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
            </div>
        </div>
    );
};

export default ProductList;
