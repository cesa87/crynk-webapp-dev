/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import metamaskLogo from "../Metamask-logo.png";
import phantomLogo from "../Phantom-logo.png"; 
import { ethers } from "ethers"; // eslint-disable-line no-unused-vars
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"; // eslint-disable-line no-unused-vars

// Import the styles
import "../wallet-styles.css";

function WalletPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const navigate = useNavigate();

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Connect to MetaMask
  const connectMetamask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]); 
        navigate("/dashboard", { state: { wallet: accounts[0], walletType: "metamask" } }); 
      } catch (error) {
        alert("Connection failed!");
      }
    } else if (isMobile) {
      window.location.href = "https://metamask.app.link/dapp/crynk.co.uk";
    } else {
      alert("Please install Metamask!");
    }
  };

  // Connect to Phantom
  const connectPhantom = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();
        setWalletAddress(publicKey); 
        navigate("/dashboard", { state: { wallet: publicKey, walletType: "phantom" } }); 
      } catch (error) {
        alert("Connection failed!");
      }
    } else {
      alert("Please install Phantom Wallet!");
    }
  };

  return (
    <div className="wallet-container">
      <h1 className="wallet-header">Connect Your Wallet</h1>
      <div className="wallet-options">
        <div className="wallet-option" onClick={connectMetamask}>
          <img src={metamaskLogo} alt="Metamask" className="wallet-logo" />
          <h2 className="wallet-name">MetaMask</h2>
          <p className="wallet-description">Connect with your Ethereum wallet</p>
          <button className="wallet-connect-btn">Connect</button>
        </div>
        <div className="wallet-option" onClick={connectPhantom}>
          <img src={phantomLogo} alt="Phantom" className="wallet-logo" />
          <h2 className="wallet-name">Phantom</h2>
          <p className="wallet-description">Connect with your Solana wallet</p>
          <button className="wallet-connect-btn">Connect</button>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;
