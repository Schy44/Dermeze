import React, { useState, useContext } from 'react'; // Added useContext here
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Import AuthContext for the token
import '../assets/cart.css';

const Cart = () => {
    const { authTokens } = useContext(AuthContext); // Access authTokens
    const navigate = useNavigate();
    const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');

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
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <>
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id}>
                                {item.name} x {item.quantity} - ${item.price * item.quantity}
                                <button onClick={() => removeFromCart(item.id)}>Remove</button>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                            </li>
                        ))}
                    </ul>

                    <div className="cart-summary">
                        <h3>Subtotal: ${totalPrice.toFixed(2)}</h3>
                        <h3>Discount: {discount}%</h3>
                        <h3>Final Price: ${finalPrice.toFixed(2)}</h3>
                    </div>

                    <form onSubmit={handleCouponSubmit}>
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                        />
                        <button type="submit">Apply Coupon</button>
                    </form>
                    {couponError && <p className="error-message">{couponError}</p>}

                    <button onClick={handleCheckout} className="btn-primary">
                        Proceed to Checkout
                    </button>
                </>
            )}
        </div>
    );
};

export default Cart;
