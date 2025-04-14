import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault(); // Prevent form reload

    try {
      const response = await fetch("http://13.48.24.11:8080/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, email, mobile, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creating account");
      }

      setMessage("Account created successfully!");
      alert("Account created successfully!");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error:", error);
      setMessage(error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h2>Create an Account</h2>
      <form className="login-form" onSubmit={handleRegister}>
        <input type="text" placeholder="First Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
        <input type="text" placeholder="Last Name" value={last_name} onChange={(e) => setLastName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="login-btn">Register</button>
      </form>
      {message && <p style={{ color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
    </div>
  );
}

export default RegisterPage;
