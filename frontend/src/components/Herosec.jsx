import React from "react";
import '../assets/home.css' // Include your CSS file for styling

const Herosec = () => {
  return (
    <section className="hero-section" id="home" aria-label="hero" data-section>
      <div className="container hero-container">
        {/* Left Side: Text Content */}
        <div className="hero-text-content">
          <h1 className="hero-title">Dermeze</h1>
          <p className="hero-description">
            Discover a world of skincare tailored for you. At Dermeze, we
            believe in nourishing your skin with the gentlest, cleanest, and
            most effective ingredients. Embrace the beauty of healthy,
            glowing skin.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Herosec;



