import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext'; // Import useWishlist
import '../assets/Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
    const { addToWishlist } = useWishlist(); // Get the addToWishlist function
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);

    const handleCouponApply = () => {
        // Simple coupon logic, modify it based on actual logic
        if (couponCode === 'SAVE10') {
            setCouponDiscount(10); // 10% discount for the coupon code
        } else {
            setCouponDiscount(0);
        }
    };

    const handleAddToWishlist = (item) => {
        addToWishlist(item); // Add the item to the wishlist
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const calculateDiscount = () => {
        return (calculateSubtotal() * couponDiscount) / 100;
    };

    const calculateVAT = () => {
        return calculateSubtotal() * 0.15; // Assuming 15% VAT
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const vat = calculateVAT();
        return subtotal - discount + vat;
    };

    return (
        <div className="cart">
            <h2>Your Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <img src={item.image} alt={item.name} className="cart-item-image" />
                                <div>
                                    <h4>{item.name}</h4>
                                    <p>${item.price} x {item.quantity}</p>
                                </div>
                                <div>
                                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                    />
                                    <button
                                        onClick={() => handleAddToWishlist(item)}
                                        className="wishlist-button">Add to Wishlist</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-container">
                        <div className="price-details">
                            <div className="price-item">
                                <span>Total Items</span>
                                <span>{cartItems.length}</span>
                            </div>
                            <div className="price-item">
                                <span>Subtotal</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="price-item">
                                <span>Discount</span>
                                <span>-${calculateDiscount().toFixed(2)}</span>
                            </div>
                            <div className="price-item">
                                <span>VAT (15%)</span>
                                <span>${calculateVAT().toFixed(2)}</span>
                            </div>
                            <div className="price-item">
                                <span>Total</span>
                                <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="coupon-container">
                            <input
                                type="text"
                                placeholder="Enter Coupon Code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                            />
                            <button onClick={handleCouponApply}>Apply</button>
                        </div>
                        <button className="checkout">Proceed to Checkout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
