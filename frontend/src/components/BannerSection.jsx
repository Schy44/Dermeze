import React from "react";
import '../assets/home.css';

const BannerSection = () => {
  return (
    <div className="banner">


    <div className="banner-cards">
    <div className="banner-cards-content">
                <h2 className="banner-cards-subtitle">New Collection</h2>
                <h2 className="h2 banner-cards-title">Discover Our Winter Skincare</h2>
                <a href="#" className="btn btn-secondary">
                  Explore More
                </a>
      </div>
        
    </div>



    <div className="banner-cards">
    <div className="banner-cards-content">
                <h2 className="banner-cards-subtitle">25% off Everything</h2>
                <h2 className="h2 banner-cards-title"> Makeup with extended range in colors for every human.</h2>
                <a href="#" className="btn btn-secondary">
                  Explore More
                </a>
      </div>
        
    </div>


    </div>
  );
};

export default BannerSection;
