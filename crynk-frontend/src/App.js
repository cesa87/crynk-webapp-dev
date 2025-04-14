import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing';
import Login from './components/Login';
import Wallet from './components/Wallet';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Payment from './components/Payment';
import MerchantOnboard from './components/MerchantOnboard';
import MerchantOnboardingProcess from './components/MerchantOnboardingProcess';

const App = () => {
    return (
        <Router>
            <Routes>
	        <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
	    	<Route path="/register" element={<Register />} />
                <Route path="/wallet" element={<Wallet />} />
	        <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/merchant-onboard" element={<MerchantOnboard />} />
	    	<Route path="/merchant-onboarding-process" element={<MerchantOnboardingProcess />} />
            </Routes>
        </Router>
    );
};

export default App;
