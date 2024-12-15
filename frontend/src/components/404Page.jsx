import React, { useEffect } from "react";
import "../assets/404Page.css";

const NotFoundPage = () => {
    useEffect(() => {
        // Add the class to the body for this page
        document.body.classList.add("error-page");

        // Cleanup: Remove the class when the component unmounts
        return () => {
            document.body.classList.remove("error-page");
        };
    }, []);

    return (
        <div className="error-container">
            <main>
                <h1>Sorry Pookie</h1>
                <p>
                    Either you aren't cool enough to visit this page or
                    <em> Maybe it got lost in the skincare routine!</em>
                </p>
                <button onClick={() => (window.location.href = "/")}>
                    Go - Do Some Shopping
                </button>
            </main>
        </div>
    );
};

export default NotFoundPage;
