import React, { useState } from 'react';

function MerchantOnboard() {
    const [formData, setFormData] = useState({ businessName: '', bankDetails: '', swiftCode: '' });

    const handleSubmit = async () => {
        const response = await fetch('https://crynk.co.uk/api/merchant/onboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business_name: formData.businessName,
                bank_details: formData.bankDetails,
                swift_code: formData.swiftCode
            })
        });
        const result = await response.json();
        if (result.success) {
            alert(`Onboarding complete! Merchant ID: ${result.merchant_id}`);
        } else {
            alert('Error: ' + result.message);
        }
    };

    return (
        <div>
            <h1>CRYNK Merchant Onboarding</h1>
            <input
                placeholder="Business Name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
            <input
                placeholder="Bank Details"
                value={formData.bankDetails}
                onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
            />
            <input
                placeholder="SWIFT Code"
                value={formData.swiftCode}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
            />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default MerchantOnboard;
