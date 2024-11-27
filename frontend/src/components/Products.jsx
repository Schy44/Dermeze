import React, { useEffect, useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/ProductList.css';
import Footer from './Footer';
import { debounce } from 'lodash'; // Use lodash for debouncing

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceSort, setPriceSort] = useState('lowToHigh');
  const [skinFilter, setSkinFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');

  const { authTokens } = useContext(AuthContext);  // Still using AuthContext to get tokens if needed
  const { addToCart } = useCart();

  // Function to fetch products based on selected categories and filters
  const fetchProducts = async (categoryIds = []) => {
    setLoadingProducts(true);
    setError(null);
    try {
      const url = categoryIds.length
        ? `http://127.0.0.1:8000/api/products/?categories=${categoryIds.join(',')}&search=${searchTerm}&skin_type=${skinFilter}&brand=${brandFilter}`
        : `http://127.0.0.1:8000/api/products/?search=${searchTerm}&skin_type=${skinFilter}&brand=${brandFilter}`;
      // Replace fetchWithAuth with simple fetch for products (no auth required)
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('Error fetching products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to fetch categories for the filters
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError('Error fetching categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Debounced fetch function for products
  const debouncedFetchProducts = debounce(fetchProducts, 500);

  useEffect(() => {
    fetchCategories();
    fetchProducts(); // Initial call to fetch products
  }, []);

  useEffect(() => {
    if (selectedCategories.length) {
      debouncedFetchProducts(selectedCategories);
    } else {
      fetchProducts();
    }
  }, [selectedCategories, searchTerm, priceSort, skinFilter, brandFilter]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prevState => {
      if (prevState.includes(categoryId)) {
        return prevState.filter(id => id !== categoryId);
      } else {
        return [...prevState, categoryId];
      }
    });
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePriceSort = (event) => {
    setPriceSort(event.target.value);
  };

  const handleSkinFilter = (event) => {
    setSkinFilter(event.target.value);
  };

  const handleBrandFilter = (event) => {
    setBrandFilter(event.target.value);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setPriceSort('lowToHigh');
    setSkinFilter('');
    setBrandFilter('');
  };

  if (loadingProducts || loadingCategories) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Sort products based on price
  const sortedProducts = products.sort((a, b) => {
    if (priceSort === 'lowToHigh') {
      return parseFloat(a.price) - parseFloat(b.price);
    } else if (priceSort === 'highToLow') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return 0;
  });

  return (
    <>
      <div className="product-list-container">
        <div className="filters">
          {/* Search by name */}
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
          />

          {/* Sort by price */}
          <select value={priceSort} onChange={handlePriceSort}>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>

          {/* Filter by skin type */}
          <button onClick={() => setSkinFilter('oily')}>Oily</button>
          <button onClick={() => setSkinFilter('sensitive')}>Sensitive</button>
          <button onClick={() => setSkinFilter('combination')}>Combination</button>

          {/* Filter by brand */}
          <select value={brandFilter} onChange={handleBrandFilter}>
            <option value="">Select Brand</option>
            <option value="Cosrx">Cosrx</option>
            {/* Add more brands as options */}
          </select>

          {/* Clear All Filters */}
          <button onClick={clearFilters} className="clear-filters-button">
            Clear All Filters
          </button>
        </div>

        <div className="product-list">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <div key={product.id} className="product-item">
                <NavLink to={`/product/${product.id}`}>
                  <img src={product.image_url || "https://via.placeholder.com/150"} alt={product.name} />
                  <h2>{product.name}</h2>
                  <p>Price: ${product.discount_price ?? product.price}</p>
                </NavLink>
                <button onClick={() => addToCart(product)}>Add to Cart</button>
              </div>
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Products;
