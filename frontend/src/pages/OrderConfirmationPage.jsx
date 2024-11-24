import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Make sure AuthContext is used for fetching with auth
import '../assets/OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
    const { fetchWithAuth, authTokens } = useContext(AuthContext);  // Use fetchWithAuth and authTokens from AuthContext
    const { state } = useLocation();
    const navigate = useNavigate();
    const orderId = state?.orderId; // Extract orderId from location state
    const [orderDetails, setOrderDetails] = useState(null); // Store fetched order details
    const [error, setError] = useState(null); // Store error messages

    useEffect(() => {
        // Redirect to homepage if no order ID is passed
        if (!orderId) {
            navigate('/');
            return;
        }

        // Function to fetch order details from the API
        const fetchOrderDetails = async () => {
            try {
                if (!authTokens) {
                    console.error('Auth token is missing');
                    navigate('/login');
                    return;
                }

                const data = await fetchWithAuth(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
                    method: 'GET', // Ensure the correct method is used
                }, authTokens);

                if (data) {
                    setOrderDetails(data);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to fetch order details. Please try again later.');
            }
        };

        fetchOrderDetails();
    }, [orderId, authTokens, fetchWithAuth, navigate]);

    // If there is an error, show the error message
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    // If the order details are still loading, show a loading state
    if (!orderDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="order-confirmation-container">
            <h2>Order Confirmation</h2>
            <div className="order-details">
                <h3>Order ID: {orderDetails.id}</h3>
                <p>Thank you for your purchase!</p>
                <p>Your order has been successfully placed and is being processed.</p>

                <h4>Order Details:</h4>
                <ul>
                    {orderDetails.cart_items && orderDetails.cart_items.length > 0 ? (
                        orderDetails.cart_items.map((item) => (
                            <li key={item.id}>
                                {item.product.name} x {item.quantity} - ${item.price * item.quantity}
                            </li>
                        ))
                    ) : (
                        <li>No items in the order.</li>
                    )}
                </ul>

                <h4>Total: ${orderDetails.total}</h4> {/* Correct field for total */}

                <h4>Shipping Information:</h4>
                <p>
                    Shipping to: {orderDetails.address}, {orderDetails.city}, {orderDetails.postal_code}
                </p>
                <p>Phone: {orderDetails.phone_number}</p>

                <button onClick={() => navigate('/')}>Return to Home</button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
