import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatRef = useRef(null);

    const userId = localStorage.getItem("userId") || Math.random().toString(36).substr(2, 9); // Unique user ID (if not present in localStorage)
    localStorage.setItem("userId", userId); // Save to localStorage for session persistence

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://dermeze.onrender.com";
    const MAX_MESSAGE_LENGTH = 500;

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // Load chat history from localStorage on mount based on userId
    useEffect(() => {
        const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [userId]);

    // Save chat history to localStorage on message update
    useEffect(() => {
        localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(messages));
    }, [messages, userId]);

    const handleSendMessage = async () => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) return;

        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            setError(`Message is too long. Please limit to ${MAX_MESSAGE_LENGTH} characters.`);
            return;
        }

        const newMessages = [...messages];
        newMessages.push({ role: "user", text: trimmedMessage });

        setMessages(newMessages);
        setUserMessage("");
        setLoading(true);
        setError(null);

        try {
            // Prepare the payload as JSON
            const payload = {
                text: trimmedMessage, // Send text as part of the JSON payload
            };

            // Send request to backend with JSON payload
            const response = await axios.post(`${API_BASE_URL}/api/chat/`, payload, {
                headers: { "Content-Type": "application/json" },
            });

            const { type, products, data } = response.data; // Updated to include products
            let botResponse;
            if (type === "chat_response") {
                botResponse = data;
            } else if (type === "skincare_recommendations") {
                botResponse = data.map((product, index) => (
                    <div key={index}>
                        <p><strong>Name:</strong> {product.name}</p>
                        <p><strong>Description:</strong> {product.description}</p>
                        <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
                        {product.ingredients && (
                            <ul>
                                {product.ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                ))}
                            </ul>
                        )}
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                style={{ maxWidth: "100px", borderRadius: "4px" }}
                            />
                        )}
                    </div>
                ));
            } else if (type === "product_recommendations") {
                botResponse = products.map((product, index) => (
                    <div key={index}>
                        <p><strong>Name:</strong> {product.name}</p>
                        {product.image_url && (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                style={{ maxWidth: "100px", borderRadius: "4px" }}
                            />
                        )}
                    </div>
                ));
            } else {
                botResponse = "I'm sorry, I didn't understand that.";
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "bot", text: botResponse },
            ]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };


    const renderMessage = (msg, index) => (
        <div
            key={index}
            style={{
                marginBottom: "10px",
                textAlign: msg.role === "user" ? "right" : "left",
            }}
        >
            <strong style={{ display: "block", marginBottom: "5px" }}>
                {msg.role === "user" ? "You" : "Bot"}:
            </strong>
            <div
                style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    backgroundColor: msg.role === "user" ? "#d1e7ff" : "#e8f5e9",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                }}
            >
                {Array.isArray(msg.text) ? msg.text : <p>{msg.text}</p>}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto", fontFamily: "Arial, sans-serif", display: "flex", flexDirection: "row" }}>
            {/* Notes Section */}
            <div style={{ flex: 1, padding: "20px", fontSize: "14px", color: "#555" }}>
                <h4>How to Get the Best Response:</h4>
                <ul>
                    <li><strong>For Product Recommendations:</strong> Use a prompt like: "I have oily skin and acne. Recommend a product."</li>
                    <li><strong>For General Conversation:</strong> You can type anything else for a more general response.</li>
                </ul>
            </div>

            <div style={{ flex: 2 }}>
                {/* Chat Window */}
                <div
                    ref={chatRef}
                    style={{
                        height: "600px",
                        overflowY: "auto",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "10px",
                        backgroundColor: "#f9f9f9",
                    }}
                >
                    {messages.map(renderMessage)}
                    {loading && <p style={{ textAlign: "center", fontStyle: "italic" }}>Bot is typing...</p>}
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
                        {error}
                        <button
                            style={{
                                marginLeft: "10px",
                                backgroundColor: "#ff5e57",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "5px 10px",
                            }}
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Input Section */}
                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => {
                            setUserMessage(e.target.value);
                            setError(null); // Clear error when typing
                        }}
                        placeholder="Describe your skin type, concerns, and what kind of product you need."
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        style={{
                            flexGrow: 1,
                            padding: "10px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                            fontSize: "14px",
                        }}
                        disabled={loading}
                        aria-label="Chat input"
                    />
                    <button
                        onClick={handleSendMessage}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: loading ? "#aaa" : "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontSize: "14px",
                        }}
                        disabled={loading}
                        aria-label="Send message"
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
