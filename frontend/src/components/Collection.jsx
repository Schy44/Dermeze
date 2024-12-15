import React from "react";
import '../assets/Home.css'


const collections = [
  {
    title: "Summer Collection",
    text: "Starting at $17.99",
    buttonText: "Shop Now",
    image: "/images/collection-1.jpg",
  },
  {
    title: "What’s New?",
    text: "Get the glow",
    buttonText: "Discover Now",
    image: "/images/collection-2.jpg",
  },
  {
    title: "Buy 1 Get 1",
    text: "Starting at $7.99",
    buttonText: "Discover Now",
    image: "/images/collection-3.jpg",
  },
];

const Collection = () => {
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
                  <a href="/productlist" className="btn-link">
                    <span>{collection.buttonText}</span>

                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Collection;
