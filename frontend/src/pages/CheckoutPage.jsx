import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../assets/checkoutpage.css';
import { fetchWithAuth } from '../context/AuthContext';  // Import it directly from the context if it's exported

const CheckoutPage = () => {
    const { authTokens } = useContext(AuthContext);  // Ensure authTokens are available
    const { cartItems } = useCart();
    const [address, setAddress] = useState({
        address: '',
        city: '',
        postal_code: '',
        phone_number: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();  // To get the passed state

    const orderItems = location.state?.orderItems || [];  // Get the orderItems from Cart

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
            const data = await fetchWithAuth('http://127.0.0.1:8000/api/orders/checkout/', {
                method: 'POST',
                body: JSON.stringify(orderData),
            }, authTokens); // Pass authTokens here

            if (data?.message === 'Order confirmed') {
                navigate('/order-confirmation', { state: { orderId: data.order.id } });
            } else {
                setError(data?.message || 'Could not confirm the order. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            setError('An error occurred while submitting your order.');
        } finally {
            setLoading(false);
        }

        if (!authTokens) {
            console.error('Auth token is not available');
            return;
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

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPage;
