import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import metamaskLogo from '../Metamask-logo.png';
import phantomLogo from '../Phantom-logo.png';

function Payment() {
    const [wallet, setWallet] = useState(null);
    const [asset, setAsset] = useState('');
    const [chain, setChain] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const total = searchParams.get('total') || '0';
    const merchantId = searchParams.get('merchant') || 'unknown';

    const connectWallet = async (selectedChain) => {
        if (selectedChain === 'solana' && window.solana) {
            await window.solana.connect();
            setWallet(window.solana.publicKey.toString());
            setChain('solana');
        } else if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWallet(accounts[0]);
            setChain('ethereum');
        } else {
            alert('Install MetaMask or Phantom!');
        }
    };

    const submitPayment = async () => {
        setLoading(true);
        const fee = parseFloat(total) * 0.02; // 2% fee placeholder
        const amount = (parseFloat(total) + fee).toString();
        const response = await fetch('https://crynk.co.uk/api/payment/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet_address: wallet,
                asset,
                amount,
                chain,
                merchant_id: merchantId
            })
        });
        const result = await response.json();
        setLoading(false);
        if (result.success) {
            alert('Payment complete!');
            navigate('/dashboard');
        } else {
            alert('Payment failed: ' + result.message);
        }
    };

    return (
        <div>
            <h1>Pay with CRYNK</h1>
            <p>Total: ${total} (Fee: 2% TBD)</p>
            {!wallet ? (
                <>
                    <img src={metamaskLogo} alt="Metamask" style={{ width: '150px', cursor: 'pointer' }} onClick={() => connectWallet('ethereum')} />
                    <img src={phantomLogo} alt="Phantom" style={{ width: '150px', cursor: 'pointer' }} onClick={() => connectWallet('solana')} />
                </>
            ) : (
                <>
                    <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                        <option value="">Select Asset</option>
                        {chain === 'ethereum' && <option value="ETH">Ethereum (ETH)</option>}
                        {chain === 'solana' && <option value="SOL">Solana (SOL)</option>}
                    </select>
                    <button onClick={submitPayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </>
            )}
        </div>
    );
}

export default Payment;
