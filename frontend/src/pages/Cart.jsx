import React, { useState, useContext, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Import AuthContext for the token
import '../assets/Cart.css';

const Cart = () => {
    const { authTokens } = useContext(AuthContext); // Access authTokens
    const navigate = useNavigate();
    const { cartItems, setCartItems, removeFromCart, updateQuantity, getTotal } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    // Fetch user-specific cart on component mount
    useEffect(() => {
        if (authTokens) {
            fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${authTokens}`,
                },
            })
                .then((response) => response.json())
                .then((data) => setCartItems(data.cartItems))
                .catch((error) => console.error('Error fetching cart:', error));
        }
    }, [authTokens, setCartItems]);

    const handleCouponSubmit = (e) => {
        e.preventDefault();
        if (couponCode === 'DISCOUNT10') {
            setDiscount(10);
            setCouponError('');
        } else {
            setDiscount(0);
            setCouponError('Invalid coupon code');
        }
    };

    const totalPrice = getTotal();
    const finalPrice = totalPrice - (totalPrice * (discount / 100));

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        if (!authTokens) {
            alert('You are not logged in.');
            navigate('/login');
            return;
        }

        const orderItems = cartItems.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
        }));

        fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authTokens}`,
            },
            body: JSON.stringify({ orderItems }),
        })
            .then((response) => {
                if (response.ok) {
                    navigate('/checkoutpage');
                } else {
                    console.error('Error during checkout:', response.statusText);
                }
            })
            .catch((error) => console.error('Error during checkout:', error));
    };

    return (
        <div className="cart-container">
            <div className="discount-banner">
                Use code <strong>DISCOUNT10</strong> for 10% off your total!
            </div>
            <h2>Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul className="cart-list">
                        {cartItems.map((item) => (
                            <li key={item.id} className="cart-item">
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="item-info">
                                    <h4>{item.name}</h4>
                                </div>
                                <div className="item-quantity">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity === 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                        Remove
                                    </button>
                                </div>
                                <div className="item-price">
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleCouponSubmit} className="coupon-form">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Discount Code"
                        />
                        <button type="submit" className="apply-btn">Apply</button>
                    </form>
                    {couponError && <p className="error-message">{couponError}</p>}

                    <div className="cart-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping & taxes calculated at checkout</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>${finalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    <button onClick={handleCheckout} className="btn-primary checkout-btn">
                        <span className="lock-icon">🔒</span> Checkout
                    </button>
                </>
            )}
        </div>
    );
};

export default Cart;
