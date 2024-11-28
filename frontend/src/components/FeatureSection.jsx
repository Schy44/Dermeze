import React from 'react';
import '../assets/home.css' // Importing the CSS file for styling

const FeatureSection = () => {
  return (
    <section className="section feature" aria-label="feature" data-section>
      <div className="container">
        <h2 className="h2-large section-title">Why Shop with Dermeze?</h2>

        <ul className="flex-list">
          <li className="flex-item">
            <div className="feature-card">
              <img
                src="/images/feature-1.jpg"
                width="204"
                height="236"
                loading="lazy"
                alt="Guaranteed PURE"
                className="card-icon"
              />
              <h3 className="h3 feature-card-title">Guaranteed PURE</h3>
              <p className="feature-card-text">
                All Grace formulations adhere to strict purity standards and will never contain harsh or toxic ingredients.
              </p>
            </div>
          </li>

          <li className="flex-item">
            <div className="feature-card">
              <img
                src="/images/feature-2.jpg"
                width="204"
                height="236"
                loading="lazy"
                alt="Completely Cruelty-Free"
                className="card-icon"
              />
              <h3 className="h3 feature-card-title">Completely Cruelty-Free</h3>
              <p className="feature-card-text">
                All Grace formulations adhere to strict purity standards and will never contain harsh or toxic ingredients.
              </p>
            </div>
          </li>

          <li className="flex-item">
            <div className="feature-card">
              <img
                src="/images/feature-3.jpg"
                width="204"
                height="236"
                loading="lazy"
                alt="Ingredient Sourcing"
                className="card-icon"
              />
              <h3 className="h3 feature-card-title">Ingredient Sourcing</h3>
              <p className="feature-card-text">
                All Grace formulations adhere to strict purity standards and will never contain harsh or toxic ingredients.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default FeatureSection;
