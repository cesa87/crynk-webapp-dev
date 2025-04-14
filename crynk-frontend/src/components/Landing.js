// Import React and necessary hooks for routing
import React from "react";
import { useNavigate } from "react-router-dom";

// Import assets (logo video, landing images, and new hex graphics)
import logoVideo from "../assets/crynk-logo-video.mp4";
import landingImage from "../assets/landing.png";
import page3 from "../assets/page3.png";
import page4 from "../assets/page4.png";
import page5 from "../assets/page5.png";
import page6 from "../assets/page6.png";
import page7 from "../assets/page7.png";
import page8 from "../assets/page8.png";
import pinkHex from "../assets/pink-hex.png"; // New pink hex graphic
import orangeHex from "../assets/orange-hex.png"; // New orange hex graphic

// Import the styles
import "../styles.css";

// Define the Landing component
function Landing() {
    const navigate = useNavigate();
    const pages = [
        landingImage,
        page3,
        page4,
        page5,
        page6,
        page7,
        page8,
    ];

    return (
        <div className="landing-page">
            {/* First section with logo video and hex graphics */}
            <div className="logo-section">
                <img src={pinkHex} alt="Pink Hex" className="hex-graphic hex-left" />
                <video autoPlay loop muted playsInline className="logo-video">
                    <source src={logoVideo} type="video/mp4" />
                    Your browser doesn’t support video—update it!
                </video>
                <img src={orangeHex} alt="Orange Hex" className="hex-graphic hex-right" />
            </div>

            {/* Scrollable page sections */}
            {pages.map((page, index) => (
                <div
                    key={index}
                    className="page-section"
                    style={{ backgroundImage: `url(${page})` }}
                />
            ))}

            {/* Get Started button */}
            <button
                className="get-started-btn"
                onClick={() => navigate("/login")}
            >
                Get Started
            </button>
        </div>
    );
}

// Export the Landing component
export default Landing;
