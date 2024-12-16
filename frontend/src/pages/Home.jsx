import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../assets/Home.css';
import Herosec from '../components/Herosec';
import Collection from '../components/Collection';
import BannerSection from '../components/BannerSection';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';

function HomePage() {
  const { authTokens, logoutUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch public products
    getProducts();

    // Fetch profile only if the user is authenticated
    if (authTokens) {
      getProfile();
    }
  }, [authTokens]);

  const getProfile = async () => {
    try {
      const response = await fetch('https://dermeze.onrender.com/api/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      setError(error.message);
      logoutUser();
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch('https://dermeze.onrender.com/api/products/', {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Error fetching products');
    }
  };

  return (
    <div>
      <Herosec />
      <Collection products={products} />
      <BannerSection />
      <FeatureSection />
      {authTokens && profile && (
        <div>
          <p>Welcome back, {profile.name}!</p>
          <button onClick={logoutUser}>Logout</button>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default HomePage;
