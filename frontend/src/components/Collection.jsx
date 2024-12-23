import React, { useState } from "react";
import "../assets/Home.css";

const collections = [
  {
    id: 4, // Serum
    title: "Serum Collection",
    text: "Starting at $17.99",
    buttonText: "Shop Now",
    image: "/images/collection-1.jpg",
  },
  {
    id: 5, // Moisturisers
    title: "Need Moisturisers?",
    text: "Get the glow",
    buttonText: "Discover Now",
    image: "/images/collection-2.jpg",
  },
  {
    id: null, // Other category (e.g., Buy 1 Get 1)
    title: "Buy 1 Get 1",
    text: "Starting at $7.99",
    buttonText: "Discover Now",
    image: "/images/collection-3.jpg",
  },
];

const Collection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (categoryId) => {
    if (!categoryId) return; // Skip fetching for categories without an ID

    setLoading(true);
    try {
      const response = await fetch(`https://dermeze.onrender.com/api/categories/${categoryId}`);
      const data = await response.json();
      setProducts(data.products || []); // Assuming the response includes a `products` array
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section collection" id="collection" aria-label="collection" data-section>
      <div className="collection-container">
        <ul className="collection-list">
          {collections.map((collection, index) => (
            <li key={index}>
              <div className="collection-card">
                <div className="card-image">
                  <img src={collection.image} alt={collection.title} />
                </div>
                <div className="card-content">
                  <h2 className="card-title">{collection.title}</h2>
                  <p className="card-text">{collection.text}</p>
                  <button
                    className="btn-link"
                    onClick={() => fetchProducts(collection.id)}
                  >
                    <span>{collection.buttonText}</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="product-list">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length > 0 ? (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p>${product.price}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No products available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Collection;
