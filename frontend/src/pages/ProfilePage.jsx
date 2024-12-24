import React, { useState, useEffect } from "react";
import "../assets/ProfilePage.css";

const ProfilePage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get token or user ID from local storage
    const token = localStorage.getItem("auth_token");

    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(" https://dermeze.onrender.com/api/orders/", {
                headers: {
                    Authorization: `Bearer ${token}`,  // Include the token in the header
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders.");
            }

            const data = await response.json();
            setOrders(data.orders || []);  // Assuming the response contains an `orders` array
        } catch (err) {
            console.error(err);
            setError(err.message);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="profile-page-container">
            <h2>Your Orders</h2>
            {loading && <p>Loading orders...</p>}
            {error && <p className="error-message">{error}</p>}
            {!loading && !error && (
                <>
                    {orders.length > 0 ? (
                        <div className="orders-container">
                            {orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <h3>Order #{order.id}</h3>
                                    <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> {order.status}</p>
                                    <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                                    <h4>Items:</h4>
                                    <ul>
                                        {order.items.map((item) => (
                                            <li key={item.id}>
                                                {item.name} - ${item.price.toFixed(2)} (Qty: {item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No orders found.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePage;
