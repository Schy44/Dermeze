import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatRef = useRef(null);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://dermeze.onrender.com";
    const MAX_MESSAGE_LENGTH = 500;

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

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
            const payload = { text: trimmedMessage };
            const response = await axios.post(`${API_BASE_URL}/api/chat/`, payload, {
                headers: { "Content-Type": "application/json" },
            });

            const { type, message, products, data } = response.data;
            let botResponse;

            if (type === "general_conversation") {
                botResponse = Array.isArray(message) ? message.join("\n") : "No response available.";
            } else if (type === "product_recommendations") {
                botResponse = products.map((product, index) => (
                    <div key={index}>
                        <p><strong>Name:</strong> {product.name}</p>
                        {product.image_url && (
                            <img
                                src={product.image_url.startsWith("http")
                                    ? product.image_url
                                    : `${API_BASE_URL}${product.image_url}`}
                                alt={product.name}
                                style={{ maxWidth: "100px", borderRadius: "4px" }}
                            />
                        )}
                    </div>
                ));
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
                                src={product.image_url.startsWith("http")
                                    ? product.image_url
                                    : `${API_BASE_URL}${product.image_url}`}
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
            <div style={{ flex: 1, padding: "20px", fontSize: "14px", color: "#555" }}>
                <h4>How to Get the Best Response:</h4>
                <ul>
                    <li><strong>For Product Recommendations:</strong> Use a prompt like: "I have oily skin and acne. Recommend a product."</li>
                    <li><strong>For General Conversation:</strong> You can type anything else for a more general response.</li>
                </ul>
            </div>

            <div style={{ flex: 2 }}>
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

                <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => {
                            setUserMessage(e.target.value);
                            setError(null);
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
