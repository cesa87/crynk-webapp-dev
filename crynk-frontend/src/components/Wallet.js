/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import metamaskLogo from "../Metamask-logo.png";
import phantomLogo from "../Phantom-logo.png"; 
import { ethers } from "ethers"; // eslint-disable-line no-unused-vars
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js"; // eslint-disable-line no-unused-vars

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
    <div>
      <h2>Connect to Wallet</h2>
      <div>
        <img
          src={metamaskLogo}
          alt="Metamask"
          style={{ width: "300px", cursor: "pointer", margin: "10px" }}
          onClick={connectMetamask}
        />
        <img
          src={phantomLogo}
          alt="Phantom"
          style={{ width: "300px", cursor: "pointer", margin: "10px" }}
          onClick={connectPhantom}
        />
      </div>
    </div>
  );
}

export default WalletPage;
