import React from 'react';
import '../assets/Productdetail.css'

// Function to calculate the number of filled stars based on the rating
const RatingStars = ({ rating }) => {
  // Calculate the number of full, half, and empty stars
  const fullStars = Math.floor(rating); // Whole stars
  const halfStars = rating % 1 >= 0.5 ? 1 : 0; // Half star (if the rating has a decimal value of 0.5 or more)
  const emptyStars = 5 - fullStars - halfStars; // Remaining empty stars to complete 5 stars

  // Create an array of stars to display
  const stars = [
    ...Array(fullStars).fill('full'),
    ...Array(halfStars).fill('half'),
    ...Array(emptyStars).fill('empty'),
  ];

  return (
    <div className="rating-stars">
      {stars.map((star, index) => (
        <span key={index} className={`star ${star}`}>
          &#9733;
        </span>
      ))}
      <span className="rating-text">({rating})</span> {/* Show the numerical rating */}
    </div>
  );
};

export default RatingStars;
