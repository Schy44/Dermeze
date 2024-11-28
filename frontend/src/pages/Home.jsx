import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authTokens) {
      navigate('/login');
      return;
    }
    getProfile();
    getProducts();
  }, [authTokens, navigate]);

  const getProfile = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
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
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authTokens?.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError('Error fetching products');
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>

      <Herosec />
      <Collection />
      <BannerSection />
      <FeatureSection />
      <Footer />
    </div>
  );
}

export default HomePage;
