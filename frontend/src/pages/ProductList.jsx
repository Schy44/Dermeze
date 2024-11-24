import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AuthContext, { fetchWithAuth } from '../context/AuthContext';
import '../assets/ProductList.css';
import { debounce } from 'lodash';  // Use lodash for debouncing

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { authTokens, updateToken } = useContext(AuthContext);
    const { addToCart } = useCart();

    const fetchProducts = async (categoryIds = []) => {
        setLoadingProducts(true);
        setError(null);
        try {
            const url = categoryIds.length
                ? `http://127.0.0.1:8000/api/products/?categories=${categoryIds.join(',')}`
                : 'http://127.0.0.1:8000/api/products/';
            const data = await fetchWithAuth(url, {}, authTokens);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError('Error fetching products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        setLoadingCategories(true);
        setError(null);
        try {
            const data = await fetchWithAuth('http://127.0.0.1:8000/api/categories/', {}, authTokens);
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError('Error fetching categories');
            if (error.message === 'Token has expired') {
                await updateToken();
                fetchCategories();
            }
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories(prevState => {
            if (prevState.includes(categoryId)) {
                return prevState.filter(id => id !== categoryId);
            } else {
                return [...prevState, categoryId];
            }
        });
    };

    const debouncedFetchProducts = debounce(fetchProducts, 500);

    useEffect(() => {
        if (authTokens) {
            fetchCategories();
            fetchProducts();
        }
    }, [authTokens]);

    useEffect(() => {
        if (selectedCategories.length) {
            debouncedFetchProducts(selectedCategories);
        } else {
            fetchProducts();
        }
    }, [selectedCategories]);

    if (loadingProducts || loadingCategories) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="product-list-page">
            <aside className="sidebar">
                <h3>Filter</h3>
                <div className="filter-section">
                    <h4>Category</h4>
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.id} className="filter-option">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category.id)}
                                        onChange={() => handleCategoryToggle(category.id)}
                                    />
                                    {category.name}
                                </label>
                            </div>
                        ))
                    ) : (
                        <p>No categories available</p>
                    )}
                </div>
            </aside>
            <div className="product-list">
                <h2>Our Products</h2>
                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="product-card">
                                <Link to={`/product/${product.id}`}>
                                    <img
                                        src={product.image_url || "https://via.placeholder.com/150"}
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
                                    {product.rating && <p className="rating">{product.rating} stars</p>}
                                    <button onClick={() => addToCart(product)}>Add to Cart</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No products found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductList;
