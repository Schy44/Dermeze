import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const chatRef = useRef(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    // Load chat history from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, []);

    // Save chat history to localStorage on message update
    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    const handleSendMessage = async () => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage && !selectedImage) return;

        if (trimmedMessage.length > 500) {
            setError("Message is too long. Please limit to 500 characters.");
            return;
        }

        // Prepare new message
        const newMessages = [...messages];
        if (trimmedMessage) {
            newMessages.push({ role: "user", text: trimmedMessage });
        }
        if (selectedImage) {
            newMessages.push({ role: "user", text: "[Image uploaded]", image: selectedImage });
        }

        setMessages(newMessages);
        setUserMessage("");
        setSelectedImage(null);
        setLoading(true);
        setError(null);

        try {
            // Create form data
            const formData = new FormData();
            formData.append("text", trimmedMessage);
            if (selectedImage) {
                formData.append("image", selectedImage);
            }

            // Send message to backend
            const response = await axios.post("https://dermeze.onrender.com/api/chat/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Handle backend response
            const { type, data } = response.data;
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
            } else {
                botResponse = "I'm sorry, I didn't understand that.";
            }

            // Update messages
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: "bot", text: botResponse },
            ]);
        } catch (err) {
            console.error("Error sending message:", err);
            setError(err.response?.data?.error || "Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
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
                {msg.image ? (
                    <img
                        src={URL.createObjectURL(msg.image)}
                        alt="User upload"
                        style={{ maxWidth: "100%", borderRadius: "4px" }}
                    />
                ) : (
                    Array.isArray(msg.text) ? msg.text : <p>{msg.text}</p>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
            {/* Chat Window */}
            <div
                ref={chatRef}
                style={{
                    height: "700px",
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
                    placeholder="Type a message..."
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
                    {loading ? <span className="spinner"></span> : "Send"}
                </button>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                    }}
                >
                    Upload Image
                </label>
            </div>
        </div>
    );
}

export default Chatbot;
