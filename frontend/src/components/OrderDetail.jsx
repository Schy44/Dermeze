import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(` https://dermeze.onrender.com/api/orders/${id}/`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                setOrder(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching order details:', error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {order && (
                <>
                    <h2>Order {order.id}</h2>
                    <p>Status: {order.status}</p>
                    <p>Customer: {order.customer_full_name}</p>
                    <p>Order Date: {new Date(order.order_date).toLocaleString()}</p>
                    <h3>Order Items</h3>
                    <ul>
                        {order.order_items.map(item => (
                            <li key={item.id}>
                                {item.product_name} x {item.quantity} - ${item.unit_price}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default OrderDetail;
