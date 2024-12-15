import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fetchWithAuth } from '../context/AuthContext';
import '../assets/Checkoutpage.css';

// Load your Stripe public key
const stripePromise = loadStripe('pk_test_51QP3LDAGfFENmCUes7k1b8WYOeKpDSndEtX8ATF31K1lPBhww4M9LqwEbitz8dfZlL5pC124nFsxpWB1jbMDspHE00kNz7nOux');

const CheckoutPage = () => {
    const { authTokens } = useContext(AuthContext);
    const { cartItems } = useCart();
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postal_code: '',
        phone_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const location = useLocation();

    const orderItems = location.state?.orderItems || [];

    useEffect(() => {
        if (!authTokens) {
            console.log('Auth token is missing');
            navigate('/login');
        } else {
            console.log('Auth token:', authTokens);
        }
    }, [authTokens, navigate]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value,
        }));
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+\d{10,15}$/;
        return phoneRegex.test(phoneNumber);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!validatePhoneNumber(address.phone_number)) {
            setError('Invalid phone number. Use a format like +1234567890.');
            setLoading(false);
            return;
        }

        if (!stripe || !elements) {
            setError('Stripe.js has not loaded yet.');
            setLoading(false);
            return;
        }

        const orderData = {
            address: address.address,
            city: address.city,
            postal_code: address.postal_code,
            phone_number: address.phone_number,
            cart_items: (orderItems.length > 0 ? orderItems : cartItems).map(item => ({
                product_id: item.id,
                quantity: item.quantity,
            })),
        };

        try {
            // Call the backend to create a payment intent
            const data = await fetchWithAuth('http://127.0.0.1:8000/api/orders/checkout/', {
                method: 'POST',
                body: JSON.stringify(orderData),
            }, authTokens);

            if (data?.message === 'Order confirmed') {
                // Confirm payment using the client secret returned by the backend
                const { clientSecret } = data;

                const paymentIntent = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: elements.getElement(CardElement),
                    },
                });

                if (paymentIntent.error) {
                    setError(paymentIntent.error.message);
                } else {
                    navigate('/order-confirmation', { state: { orderId: data.order.id } });
                }
            } else {
                setError(data?.message || 'Could not confirm the order. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            setError('An error occurred while submitting your order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="checkout-container">
            <h2 className="checkout-heading">Checkout</h2>
            <form onSubmit={handleSubmit} className="checkout-form">
                <h3>Shipping Address</h3>
                <div className="form-group">
                    <label>Street Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={address.address}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>City:</label>
                    <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Postal Code:</label>
                    <input
                        type="text"
                        name="postal_code"
                        value={address.postal_code}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        name="phone_number"
                        value={address.phone_number}
                        onChange={handleAddressChange}
                        required
                    />
                </div>

                <h3>Payment Information</h3>
                <div className="form-group">
                    <label>Card Details:</label>
                    <CardElement />
                </div>

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
            </form>
        </div>
    );
};

export default () => (
    <Elements stripe={stripePromise}>
        <CheckoutPage />
    </Elements>
);