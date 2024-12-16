import React, { useState, useEffect } from "react";
import axios from "axios";
import "../assets/RoutineMaker.css";

const RoutineMaker = () => {
    const [steps, setSteps] = useState([
        { name: "Ready", categories: ["cleansers"], min: 1, max: 3 },
        { name: "Target", categories: ["masks", "anti-aging-products", "serums", "toners"], min: 1, max: 3 },
        { name: "Protect", categories: ["sunscreens"], min: 1, max: 3 },
        { name: "Moisturize", categories: ["moisturizers"], min: 1, max: 3 },
        { name: "Enhance", categories: [], min: 0, max: 2 },
    ]);
    const [currentStep, setCurrentStep] = useState(0);
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cart, setCart] = useState([]);  // Cart state to hold selected products
    const [showRoutine, setShowRoutine] = useState(false);

    // Simulated logged-in state (replace with actual auth logic)
    const [isLoggedIn, setIsLoggedIn] = useState(false); // This should come from your app's state or context

    useEffect(() => {
        fetchProductsForCurrentStep();
    }, [currentStep]);

    const fetchProductsForCurrentStep = async () => {
        setLoading(true);
        setError("");
        const step = steps[currentStep];

        try {
            const promises = step.categories.map((categorySlug) =>
                axios.get(`https://dermeze.onrender.com/api/categories/${categorySlug}/`)
            );
            const responses = await Promise.all(promises);
            const allProducts = responses.flatMap((res) => res.data.products || []);
            setProducts(allProducts);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProduct = (product) => {
        const stepId = steps[currentStep].name;
        const selected = selectedProducts[stepId] || [];

        if (selected.length < steps[currentStep].max) {
            setSelectedProducts((prev) => ({
                ...prev,
                [stepId]: [...selected, product],
            }));
        }
    };

    const handleRemoveProduct = (productId) => {
        const stepId = steps[currentStep].name;
        setSelectedProducts((prev) => ({
            ...prev,
            [stepId]: prev[stepId]?.filter((p) => p.id !== productId) || [],
        }));
    };

    const isStepComplete = () => {
        const stepId = steps[currentStep].name;
        const selected = selectedProducts[stepId] || [];
        return selected.length >= steps[currentStep].min;
    };

    const handleStepChange = (newStep) => {
        if (newStep !== currentStep && newStep >= 0 && newStep < steps.length) {
            setCurrentStep(newStep);
        }
    };

    const handleQuantityChange = (productId, change) => {
        const stepId = steps[currentStep].name;
        setSelectedProducts((prev) => ({
            ...prev,
            [stepId]: prev[stepId].map((product) =>
                product.id === productId
                    ? { ...product, quantity: Math.max((product.quantity || 1) + change, 1) }
                    : product
            ),
        }));
    };

    // Group selected products by ID
    const groupedProducts = Object.values(selectedProducts).flat().reduce((acc, product) => {
        if (acc[product.id]) {
            acc[product.id].quantity += 1;
        } else {
            acc[product.id] = { ...product, quantity: 1 };
        }
        return acc;
    }, {});

    // Function to add selected products to the cart
    const handleAddToCart = () => {
        if (!isLoggedIn) {
            // If not logged in, show login prompt
            alert("Please log in to add products to your cart.");
            return;
        }

        const allSelectedProducts = Object.values(groupedProducts);

        // Add the selected products to the cart
        setCart((prevCart) => [...prevCart, ...allSelectedProducts]);

        // Optionally, show a message
        alert('Products added to cart!');
    };

    return (
        <div className="routine-maker">
            <h1>Make it your own R.T.P Routine, Save 30%</h1>
            <p>Easy as 1-2-3! Pick a cleanser, serum, sunscreen & moisturizer to customize your routine!</p>

            {/* Steps */}
            <div className="steps">
                {steps.map((step, index) => (
                    <div
                        key={step.name}
                        className={`step ${index === currentStep ? "active" : ""}`}
                        onClick={() => handleStepChange(index)}
                    >
                        <span>{step.name}</span>
                        <span>
                            ({(selectedProducts[step.name] || []).length}/{step.max})
                        </span>
                    </div>
                ))}
            </div>

            {/* Product List */}
            <div className="products">
                {loading ? (
                    <p className="loading">Loading products...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img
                                src={`http://127.0.0.1:8000${product.image}`}
                                alt={product.name}
                            />
                            <h3>{product.name}</h3>
                            <p>${product.price}</p>
                            <button onClick={() => handleSelectProduct(product)}>Add</button>
                        </div>
                    ))
                ) : (
                    <p>No products available for this step.</p>
                )}
            </div>

            {/* Selected Products List */}
            <div className="selected-products">
                <h2>Your Own R.T.P Routine</h2>
                {Object.values(groupedProducts).map((product) => (
                    <div key={product.id} className="selected-product">
                        <img src={`http://127.0.0.1:8000${product.image}`} alt={product.name} />
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p>${product.price} x {product.quantity}</p>
                        </div>
                        <button
                            className="remove-btn"
                            onClick={() => handleRemoveProduct(product.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                {/* Add to Cart Button */}
                <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    Add to Cart
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation">
                {currentStep > 0 && (
                    <button onClick={() => handleStepChange(currentStep - 1)}>
                        Previous Step
                    </button>
                )}
                <button
                    onClick={() =>
                        currentStep < steps.length - 1
                            ? handleStepChange(currentStep + 1)
                            : alert("Routine complete!")
                    }
                    disabled={!isStepComplete()}
                >
                    {currentStep < steps.length - 1 ? "Next Step" : "Complete Routine"}
                </button>
            </div>
        </div>
    );
};

export default RoutineMaker;
