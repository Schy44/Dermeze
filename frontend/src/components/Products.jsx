import React, { useEffect, useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/ProductList.css';
import Footer from './Footer';
import { debounce } from 'lodash'; // For debouncing the search input

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

  const { addToCart } = useCart(); // Add to cart functionality from context

  const placeholderImage = "https://via.placeholder.com/150"; // Placeholder for missing images

  // Function to fetch products from the API
  const fetchProducts = async (categoryIds = []) => {
    setLoadingProducts(true);
    setError(null);
    try {
      const url = categoryIds.length
        ? ` https://dermeze.onrender.com/api/products/?categories=${categoryIds.join(',')}&search=${searchTerm}&skin_type=${skinFilter}&brand=${brandFilter}`
        : ` https://dermeze.onrender.com/api/products/?search=${searchTerm}&skin_type=${skinFilter}&brand=${brandFilter}`;
      const response = await fetch(url);
      const data = await response.json();

      // Update image URLs for relative paths
      const updatedProducts = data.map((product) => ({
        ...product,
        image_url: product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`,
      }));

      setProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('Error fetching products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Function to fetch categories for filters
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const response = await fetch('https://dermeze.onrender.com/api/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError('Error fetching categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Debounced function to fetch products
  const debouncedFetchProducts = debounce(fetchProducts, 500);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Update products whenever filters change
  useEffect(() => {
    if (selectedCategories.length) {
      debouncedFetchProducts(selectedCategories);
    } else {
      fetchProducts();
    }
  }, [selectedCategories, searchTerm, priceSort, skinFilter, brandFilter]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prevState) =>
      prevState.includes(categoryId)
        ? prevState.filter((id) => id !== categoryId)
        : [...prevState, categoryId]
    );
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePriceSort = (event) => {
    setPriceSort(event.target.value);
  };

  const handleSkinFilter = (value) => {
    setSkinFilter(value);
  };

  const handleBrandFilter = (event) => {
    setBrandFilter(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceSort('lowToHigh');
    setSkinFilter('');
    setBrandFilter('');
    setSelectedCategories([]);
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
          <button onClick={() => handleSkinFilter('oily')}>Oily</button>
          <button onClick={() => handleSkinFilter('sensitive')}>Sensitive</button>
          <button onClick={() => handleSkinFilter('combination')}>Combination</button>

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
                  <img src={product.image_url || placeholderImage} alt={product.name} />
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
