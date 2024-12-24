import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(' https://dermeze.onrender.com/api/orders/', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Your Orders</h2>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        <Link to={`/orders/${order.id}`}>
                            Order {order.id} - {order.status}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderList;
