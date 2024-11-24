import React, { useState } from 'react';
import axios from 'axios';

const CouponValidation = () => {
    const [couponCode, setCouponCode] = useState('');
    const [discountValue, setDiscountValue] = useState(null);
    const [error, setError] = useState(null);

    const handleCouponSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/validate_coupon/', { code: couponCode })
            .then(response => {
                setDiscountValue(response.data.discount_value);
                setError(null);
            })
            .catch(error => {
                setError(error.response?.data?.error || 'An error occurred');
                setDiscountValue(null);
            });
    };

    return (
        <div>
            <h2>Validate Coupon</h2>
            <form onSubmit={handleCouponSubmit}>
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    required
                />
                <button type="submit">Apply</button>
            </form>
            {discountValue && <p>Discount applied: ${discountValue}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default CouponValidation;
