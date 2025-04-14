import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BrowserProvider, formatEther } from "ethers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import metamaskLogo from "../Metamask-logo.png";
import phantomLogo from "../Phantom-logo.png";
import "../dashboard-styles.css";

function Dashboard() {
    const location = useLocation();
    const walletAddress = location.state?.wallet || "Not Connected";
    const walletType = location.state?.walletType || "unknown";

    const [balance, setBalance] = useState("Loading...");
    const [ethPrice, setEthPrice] = useState("Loading...");
    const [ethRsi, setEthRsi] = useState("Loading...");
    const [gasFees, setGasFees] = useState("Loading...");
    const [volatility, setVolatility] = useState("Loading...");
    const [walletValue, setWalletValue] = useState("Loading...");
    const [marketSentiment, setMarketSentiment] = useState("Loading...");
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchBalance = async () => {
            if (walletType === "metamask" && window.ethereum && walletAddress !== "Not Connected") {
                try {
                    const provider = new BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const balanceWei = await provider.getBalance(signer.address);
                    const balanceEth = formatEther(balanceWei);
                    setBalance(balanceEth + " ETH");
                } catch (error) {
                    setBalance("Error fetching balance");
                }
            }
            else if (walletType === "phantom" && walletAddress !== "Not Connected") {
                try {
                    const connection = new Connection(clusterApiUrl("mainnet-beta"));
                    const publicKey = new PublicKey(walletAddress);
                    const balanceLamports = await connection.getBalance(publicKey);
                    const balanceSol = balanceLamports / 1e9;
                    setBalance(balanceSol + " SOL");
                } catch (error) {
                    setBalance("Error fetching balance");
                }
            }
            else {
                setBalance("Wallet not connected");
            }
        };

        const fetchEthPrice = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/eth-price');
                const data = await response.json();
                const price = data.price || 0;
                setEthPrice(`$${price.toFixed(2)} USD`);
                return price;
            } catch (error) {
                setEthPrice("Error fetching ETH price");
                return null;
            }
        };

        const fetchEthMetrics = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/eth-metrics');
                const data = await response.json();
                const rsi = data.rsi || 0;
                const vol = data.volatility || 0;
                setEthRsi(rsi.toFixed(2));
                setVolatility(`${vol.toFixed(2)}%`);
            } catch (error) {
                setEthRsi("Error fetching RSI");
                setVolatility("Error fetching volatility");
            }
        };

        const fetchGasFees = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/gas-fees');
                const data = await response.json();
                const fees = data.fees || 0;
                setGasFees(`$${fees.toFixed(2)} USD`);
            } catch (error) {
                setGasFees("Error fetching gas fees");
            }
        };

        const calculateWalletValue = (balanceEth, price) => {
            if (!balanceEth || !price || balanceEth.includes("Error") || price === 0) {
                setWalletValue("Error calculating wallet value");
                return;
            }
            const balanceNum = parseFloat(balanceEth.split(" ")[0]);
            const value = balanceNum * price;
            setWalletValue(`$${value.toFixed(2)} USD`);
        };

        const fetchMarketSentiment = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/market-sentiment');
                const data = await response.json();
                const sentiment = data.sentiment || "Unknown";
                setMarketSentiment(sentiment);
            } catch (error) {
                setMarketSentiment("Error fetching market sentiment");
            }
        };

        const fetchTransactionHistory = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/transactions?wallet_address=${walletAddress}`);
                const data = await response.json();
                const txs = data.transactions || [];
                setTransactions(txs);
            } catch (error) {
                setTransactions([{ amount: "Error", to: "Error", date: "Error", status: "Error fetching transactions" }]);
            }
        };

        const fetchAllData = async () => {
            await fetchBalance();
            if (walletType === "metamask") {
                const price = await fetchEthPrice();
                await fetchEthMetrics();
                await fetchGasFees();
                await fetchMarketSentiment();
                await fetchTransactionHistory();
                if (price) {
                    calculateWalletValue(balance, price);
                }
            }
        };

        fetchAllData();
    }, [walletAddress, walletType]);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2 className="dashboard-title">Dashboard</h2>
                    <div className="wallet-display">
                        {walletType === "metamask" && <img src={metamaskLogo} alt="Metamask" className="wallet-logo" />}
                        {walletType === "phantom" && <img src={phantomLogo} alt="Phantom" className="wallet-logo" />}
                        <div className="wallet-address">{walletAddress}</div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* Wallet Summary Card */}
                    <div className="dashboard-card summary-card">
                        <div className="card-header">
                            <h3>Wallet Summary</h3>
                            <div className="card-icon">💰</div>
                        </div>
                        <div className="card-content">
                            <div className="metric-item">
                                <span className="metric-label">Balance</span>
                                <span className="metric-value">{balance}</span>
                            </div>
                            <div className="metric-item">
                                <span className="metric-label">Wallet Value</span>
                                <span className="metric-value">{walletValue}</span>
                            </div>
                        </div>
                    </div>

                    {/* Market Overview Card */}
                    <div className="dashboard-card market-card">
                        <div className="card-header">
                            <h3>Market Overview</h3>
                            <div className="card-icon">📊</div>
                        </div>
                        <div className="card-content">
                            <div className="metric-grid">
                                <div className="metric-item">
                                    <span className="metric-label">ETH Price</span>
                                    <span className="metric-value">{ethPrice}</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">RSI (14-day)</span>
                                    <span className="metric-value">{ethRsi}</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Gas Fees</span>
                                    <span className="metric-value">{gasFees}</span>
                                </div>
                                <div className="metric-item">
                                    <span className="metric-label">Volatility</span>
                                    <span className="metric-value">{volatility}</span>
                                </div>
                            </div>
                            <div className="sentiment-indicator">
                                <span>Market Sentiment:</span>
                                <span className={`sentiment-value ${marketSentiment.toLowerCase()}`}>
                                    {marketSentiment}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Card */}
                    <div className="dashboard-card transactions-card">
                        <div className="card-header">
                            <h3>Recent Transactions</h3>
                            <div className="card-icon">🔗</div>
                        </div>
                        <div className="card-content">
                            {transactions.length > 0 ? (
                                <div className="transactions-table">
                                    <div className="table-header">
                                        <span>Amount</span>
                                        <span>To</span>
                                        <span>Date</span>
                                        <span>Status</span>
                                    </div>
                                    <div className="table-body">
                                        {transactions.slice(0, 5).map((tx, index) => (
                                            <div className="table-row" key={index}>
                                                <span>{tx.amount}</span>
                                                <span className="wallet-address">{tx.to}</span>
                                                <span>{tx.date}</span>
                                                <span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="no-transactions">No recent transactions found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
