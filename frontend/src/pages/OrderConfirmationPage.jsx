import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../assets/OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
    const { fetchWithAuth, authTokens } = useContext(AuthContext);
    const { state } = useLocation();
    const navigate = useNavigate();
    const orderId = state?.orderId;
    const [orderDetails, setOrderDetails] = useState(null);
    const [products, setProducts] = useState({});
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            navigate('/');
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                if (!authTokens) {
                    console.error('Auth token is missing');
                    navigate('/login');
                    return;
                }

                // Fetch order details
                const orderData = await fetchWithAuth(
                    `https://dermeze.onrender.com/api/orders/${orderId}/`,
                    { method: 'GET' },
                    authTokens
                );

                if (orderData) {
                    setOrderDetails(orderData);
                    setPaymentStatus(
                        {
                            paid: 'Payment Successful',
                            pending: 'Payment Pending',
                            cancelled: 'Payment Cancelled',
                            shipped: 'Order Shipped',
                            completed: 'Order Completed',
                        }[orderData.status] || 'Payment Status Unknown'
                    );

                    // Fetch product details for each cart item
                    const productPromises = orderData.cart_items.map((item) =>
                        fetchWithAuth(
                            `https://dermeze.onrender.com/api/products/${item.product}/`,
                            { method: 'GET' },
                            authTokens
                        )
                    );
                    const productDetails = await Promise.all(productPromises);

                    const productMap = productDetails.reduce((acc, product) => {
                        acc[product.id] = product;
                        return acc;
                    }, {});
                    setProducts(productMap);
                } else {
                    setError('Order not found');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to fetch order details. Please try again later.');
            }
        };

        const interval = setInterval(fetchOrderDetails, 10000); // Poll every 10 seconds
        fetchOrderDetails(); // Initial fetch

        return () => clearInterval(interval); // Cleanup on unmount
    }, [orderId, authTokens, fetchWithAuth, navigate]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!orderDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="order-confirmation-page">
            <h2 className="thank-you-message">🎉 Order Confirmed! 🎉</h2>
            <div className="order-details">
                <h3>Order ID: {orderDetails.id}</h3>
                <p>Your order has been successfully placed and is being processed.</p>

                <h4>Order Details:</h4>
                <div className="order-items">
                    {orderDetails.cart_items.map((item) => {
                        const product = products[item.product];
                        return product ? (
                            <div key={item.id} className="order-item">
                                <img src={product.image} alt={product.name} className="item-image" />
                                <div className="item-info">
                                    <h5 className="item-name">{product.name}</h5>
                                    <p className="item-quantity">Quantity: {item.quantity}</p>
                                    <p className="item-price">Price: ${item.price}</p>
                                    <p className="item-total">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ) : (
                            <div key={item.id} className="order-item">
                                <p>Loading product details...</p>
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h4>Order Summary:</h4>
                    <p><strong>Subtotal:</strong> ${orderDetails.total}</p>
                    <p><strong>Delivery:</strong> ${orderDetails.delivery_fee || 'Free'}</p>
                    <p><strong>Total:</strong> ${orderDetails.total}</p>
                    <p><strong>Payment Status:</strong> {paymentStatus}</p>
                </div>

                <div className="shipping-info">
                    <h4>Shipping Information:</h4>
                    <p>Shipping to: {orderDetails.address}, {orderDetails.city}, {orderDetails.postal_code}</p>
                    <p>Phone: {orderDetails.phone_number}</p>
                </div>

                <button onClick={() => navigate('/')}>Return to Home</button>
            </div>
            <div className="customer-support">
                <h4>Need help?</h4>
                <p>Contact our support team for any questions or concerns.</p>
                <button onClick={() => navigate('/support')}>Contact Support</button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
