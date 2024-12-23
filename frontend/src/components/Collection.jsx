import React, { useEffect, useState } from "react";
import '../assets/Home.css';

const categoriesApiUrl = 'https://dermeze.onrender.com/api/categories/';

const Collection = () => {
  const [serums, setSerums] = useState([]);
  const [moisturizers, setMoisturizers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all products and filter them by category
    const fetchProducts = async () => {
      try {
        const response = await fetch(categoriesApiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();


        setSerums(data.filter(product => product.category === 'Serum'));
        setMoisturizers(data.filter(product => product.category === 'Moisturizer'));
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <section className="section collection" id="collection" aria-label="collection" data-section>
      <div className="collection-container">
        <ul className="collection-list">
          {/* Serum Collection */}
          <li>
            <div className="collection-card">
              <div className="card-content">
                <h2 className="card-title">Serum Collection</h2>
                <p className="card-text">Starting at $10.99</p>
                <a href="/productlist" className="btn-link">
                  <span>Shop Now</span>
                </a>
              </div>
              <div className="product-list">
                {serums.map((serum, index) => (
                  <div key={index} className="product-card">
                    <img src={serum.image} alt={serum.name} />
                    <p>{serum.name}</p>
                    <p>${serum.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </li>

          {/* Moisturizer Collection */}
          <li>
            <div className="collection-card">
              <div className="card-content">
                <h2 className="card-title">Need Moisture?</h2>
                <p className="card-text">Get the glow</p>
                <a href="/productlist" className="btn-link">
                  <span>Discover Now</span>
                </a>
              </div>
              <div className="product-list">
                {moisturizers.map((moisturizer, index) => (
                  <div key={index} className="product-card">
                    <img src={moisturizer.image} alt={moisturizer.name} />
                    <p>{moisturizer.name}</p>
                    <p>${moisturizer.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </li>

          {/* Other Collection */}
          <li>
            <div className="collection-card">
              <div className="card-content">
                <h2 className="card-title">Buy 1 Get 1</h2>
                <p className="card-text">Starting at $7.99</p>
                <a href="/productlist" className="btn-link">
                  <span>Discover Now</span>
                </a>
              </div>
              {/* Static image as no API integration mentioned */}
              <div className="card-image">
                <img src="/images/collection-3.jpg" alt="Buy 1 Get 1" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Collection;
