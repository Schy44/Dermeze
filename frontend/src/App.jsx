import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import PrivateRoute from './utils/PrivateRoute';
import ProductList from './pages/ProductList';
import Product from './pages/Product';
import Cart from './pages/Cart';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import WishlistPage from './pages/WishlistPage';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe('pk_test_51QP3LDAGfFENmCUes7k1b8WYOeKpDSndEtX8ATF31K1lPBhww4M9LqwEbitz8dfZlL5pC124nFsxpWB1jbMDspHE00kNz7nOux');

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/productList" element={<PrivateRoute><ProductList /></PrivateRoute>} />
                <Route path="/product/:id" element={<PrivateRoute><Product /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route
                  path="/checkoutPage"
                  element={
                    <PrivateRoute>
                      <Elements stripe={stripePromise}>
                        <CheckoutPage />
                      </Elements>
                    </PrivateRoute>
                  }
                />
                <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
