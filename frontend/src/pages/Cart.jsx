import React, { useState, useContext, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Import AuthContext for the token
import axios from 'axios'; // Use axios for API requests
import '../assets/Cart.css';

const Cart = () => {
    const { authTokens } = useContext(AuthContext); // Access authTokens
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getTotal, addItemToCart } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

    // On Component Mount: Load cart data
    useEffect(() => {
        if (authTokens) {
            // If the user is logged in, load the cart from the backend
            axios.get('/api/cart/') // Fetch cart from backend
                .then(response => {
                    const cartData = response.data;
                    for (let item in cartData) {
                        addItemToCart({ id: item, ...cartData[item] });
                    }
                })
                .catch(error => console.error("Error fetching cart:", error));
        } else {
            // For guest users, load cart from localStorage
            const savedCart = JSON.parse(localStorage.getItem('cart'));
            if (savedCart) {
                for (let item of savedCart) {
                    addItemToCart(item);
                }
            }
        }
    }, [authTokens]);

    // Save cart to localStorage on every change if the user is not logged in
    useEffect(() => {
        if (!authTokens) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems, authTokens]);

    const handleCouponSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/coupon/', { coupon_code: couponCode }) // Send coupon code to backend for validation
            .then(response => {
                setDiscount(response.data.discount);
                setCouponError('');
            })
            .catch(error => {
                setDiscount(0);
                setCouponError('Invalid coupon code');
            });
    };

    const totalPrice = getTotal();
    const finalPrice = totalPrice - (totalPrice * (discount / 100));

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        // Ensure the user is logged in
        if (!authTokens) {
            alert('You are not logged in.');
            navigate('/login'); // Redirect to login if no token
            return;
        }

        // Map cart items to the required format for the backend
        const orderItems = cartItems.map((item) => ({
            product_id: item.id, // Ensure this field matches what your backend expects
            quantity: item.quantity,
        }));

        navigate('/checkoutpage', { state: { cart_items: orderItems } });
    };

    return (
        <div className="cart-container">
            {/* Discount Code Banner */}
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
