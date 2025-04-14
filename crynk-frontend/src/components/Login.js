// Import React and necessary hooks for state and routing
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Import assets (logo video, hex graphics, and menu icon)
import logoVideo from "../assets/crynk-logo-video.mp4";
import pinkHex from "../assets/pink-hex.png";
import orangeHex from "../assets/orange-hex.png";
import menuIcon from "../assets/menu-icon.png"; // New menu icon

// Import the styles
import "../styles.css";
import "../document-styles.css";

// Define the LoginPage component
function LoginPage() {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [isSignup, setIsSignup] = useState(false);
const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu visibility

// Signup state
const [first_name, setFirstName] = useState("");
const [last_name, setLastName] = useState("");
const [email, setEmail] = useState("");
const [mobile, setMobile] = useState("");

const navigate = useNavigate();

// Toggle menu visibility
const toggleMenu = () => {
setIsMenuOpen(!isMenuOpen);
};

// Handle click outside to close menu
const handleOutsideClick = (event) => {
if (!event.target.closest(".menu-container")) {
setIsMenuOpen(false);
}
};

// Handle Login
const handleLogin = async (event) => {
event.preventDefault();
try {
console.log("Sending login request...");
const response = await fetch("http://localhost:8080/api/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ username, password }),
});

console.log("Login response received:", response);
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || "Login failed");
}

const data = await response.json();
console.log("Login successful:", data);
setMessage(data.message);

if (data.success) {
navigate("/wallet");
}
} catch (error) {
console.error("Login error:", error);
setMessage(error.message || "An error occurred during login.");
alert(`Login error: ${error.message}`);
}
};

// Handle Signup
const handleSignup = async (event) => {
event.preventDefault();
try {
console.log("Sending signup request...");
const response = await fetch("http://localhost:8080/api/register", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ first_name, last_name, email, mobile, username, password }),
});

console.log("Signup response received:", response);
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || "Signup failed");
}

const data = await response.json();
console.log("Signup successful:", data);
setMessage(data.message);

if (data.success) {
alert("Account created successfully!");
setIsSignup(false);
}
} catch (error) {
console.error("Signup error:", error);
setMessage(error.message || "An error occurred during registration.");
alert(`Signup error: ${error.message}`);
}
};

return (
<div className="login-page" onClick={handleOutsideClick}>
{/* Menu icon and dropdown */}
<div className="menu-container">
<img
src={menuIcon}
alt="Menu Icon"
className="menu-icon"
onClick={toggleMenu}
/>
{isMenuOpen && (
<div className="dropdown-menu">
<Link to="/merchant-onboarding-process" className="dropdown-item">
Merchant Onboarding Process
</Link>
{/* Add more links here in the future (e.g., TOS, How-Tos) */}
</div>
)}
</div>

{/* Logo section with video and hex graphics */}
<div className="logo-section">
<img src={pinkHex} alt="Pink Hex" className="hex-graphic hex-left" />
<video autoPlay loop muted playsInline className="logo-video">
<source src={logoVideo} type="video/mp4" />
Your browser doesn’t support video—update it!
</video>
<img src={orangeHex} alt="Orange Hex" className="hex-graphic hex-right" />
</div>

{/* Toggle buttons for Login/Signup */}
<div className="toggle-buttons">
<button
className={`toggle-btn ${!isSignup ? "active" : ""}`}
onClick={() => setIsSignup(false)}
>
Login
</button>
<button
className={`toggle-btn ${isSignup ? "active" : ""}`}
onClick={() => setIsSignup(true)}
>
Create Account
</button>
</div>

{/* Signup Form */}
{isSignup ? (
<form className="login-form" onSubmit={handleSignup}>
<input
type="text"
placeholder="First Name"
value={first_name}
onChange={(e) => setFirstName(e.target.value)}
className="form-field"
required
/>
<input
type="text"
placeholder="Last Name"
value={last_name}
onChange={(e) => setLastName(e.target.value)}
className="form-field"
required
/>
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="form-field"
required
/>
<input
type="tel"
placeholder="Mobile Number"
value={mobile}
onChange={(e) => setMobile(e.target.value)}
className="form-field"
required
/>
<input
type="text"
placeholder="Username"
value={username}
onChange={(e) => setUsername(e.target.value)}
className="form-field"
required
/>
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="form-field"
required
/>
<button type="submit" className="login-btn">Create Account</button>
</form>
) : (
// Login Form
<form className="login-form" onSubmit={handleLogin}>
<input
type="text"
placeholder="Username"
value={username}
onChange={(e) => setUsername(e.target.value)}
className="form-field"
required
/>
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="form-field"
required
/>
<button type="submit" className="login-btn">Login</button>
</form>
)}

{/* Login/Signup message */}
{message && <p id="loginMessage">{message}</p>}
</div>
);
}

// Export the LoginPage component
export default LoginPage;
