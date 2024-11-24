import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import '../assets/Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const { addToWishlist } = useWishlist();
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [customerDetails, setCustomerDetails] = useState({
        fullName: '',
        primaryPhone: '',
        secondaryPhone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        landmark: '',
        preferredDate: '',
        timeSlot: '',
        instructions: '',
        paymentMethod: 'COD',
        billingAddress: '',
        notificationMethod: 'email',
    });

    const handleCouponApply = () => {
        if (couponCode === 'SAVE10') {
            setCouponDiscount(10);
        } else {
            setCouponDiscount(0);
        }
    };

    const handleAddToWishlist = (item) => {
        addToWishlist(item);
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const calculateDiscount = () => {
        return (calculateSubtotal() * couponDiscount) / 100;
    };

    const calculateVAT = () => {
        return calculateSubtotal() * 0.15;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = calculateDiscount();
        const vat = calculateVAT();
        const deliveryCharge = 5;
        return subtotal - discount + vat + deliveryCharge;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prevDetails => ({ ...prevDetails, [name]: value }));
    };

    const handleOrderConfirmation = () => {
        alert('Order confirmed!');
    };

    return (
        <div className="cart">
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cart-content">
                    {/* Left side: Cart items, summary, and delivery preferences */}
                    <div className="cart-items-summary">
                        <div className="cart-items">
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <img src={item.image} alt={item.name} className="cart-item-image" />
                                    <div className="cart-item-details">
                                        <h4>{item.name}</h4>
                                        <p>${item.price} x {item.quantity}</p>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            className="quantity-input"
                                        />
                                        <button onClick={() => removeFromCart(item.id)}>Remove</button>
                                        <button onClick={() => handleAddToWishlist(item)} className="wishlist-button">Add to Wishlist</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="price-details">
                            <div className="price-item"><span>Subtotal</span><span>${calculateSubtotal().toFixed(2)}</span></div>
                            <div className="price-item"><span>Discount</span><span>-${calculateDiscount().toFixed(2)}</span></div>
                            <div className="price-item"><span>VAT (15%)</span><span>${calculateVAT().toFixed(2)}</span></div>
                            <div className="price-item"><span>Delivery Charge</span><span>$5.00</span></div>
                            <div className="price-item"><span>Total</span><span>${calculateTotal().toFixed(2)}</span></div>
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
                    </div>

                    {/* Right side: Customer details, delivery address, and payment */}
                    <div className="customer-details">
                        <h3>Customer Details</h3>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={customerDetails.fullName}
                            onChange={handleInputChange}
                        />
                        <input
                            type="tel"
                            name="primaryPhone"
                            placeholder="Primary Phone"
                            value={customerDetails.primaryPhone}
                            onChange={handleInputChange}
                        />
                        <input
                            type="tel"
                            name="secondaryPhone"
                            placeholder="Secondary Phone"
                            value={customerDetails.secondaryPhone}
                            onChange={handleInputChange}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={customerDetails.email}
                            onChange={handleInputChange}
                        />

                        <h3>Delivery Address</h3>
                        <input type="text" name="street" placeholder="Street Address" value={customerDetails.street} onChange={handleInputChange} />
                        <input type="text" name="city" placeholder="City" value={customerDetails.city} onChange={handleInputChange} />
                        <input type="text" name="state" placeholder="State/Province" value={customerDetails.state} onChange={handleInputChange} />
                        <input type="text" name="zip" placeholder="ZIP/Postal Code" value={customerDetails.zip} onChange={handleInputChange} />
                        <input type="text" name="country" placeholder="Country" value={customerDetails.country} onChange={handleInputChange} />
                        <input type="text" name="landmark" placeholder="Landmark (optional)" value={customerDetails.landmark} onChange={handleInputChange} />

                        <h3>Delivery Preferences</h3>
                        <input type="date" name="preferredDate" value={customerDetails.preferredDate} onChange={handleInputChange} />
                        <input type="text" name="timeSlot" placeholder="Preferred Time Slot" value={customerDetails.timeSlot} onChange={handleInputChange} />
                        <textarea name="instructions" placeholder="Delivery Instructions" value={customerDetails.instructions} onChange={handleInputChange} />

                        <h3>Payment Information</h3>
                        <select name="paymentMethod" value={customerDetails.paymentMethod} onChange={handleInputChange}>
                            <option value="COD">Cash on Delivery</option>
                            <option value="CreditCard">Credit Card</option>
                            <option value="PayPal">PayPal</option>
                        </select>
                        <input type="text" name="billingAddress" placeholder="Billing Address (if different)" value={customerDetails.billingAddress} onChange={handleInputChange} />
                        <button className="checkout" onClick={handleOrderConfirmation}>Confirm Order</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
