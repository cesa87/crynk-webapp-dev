// Import React
import React from "react";

// Import the static images for the Merchant Onboarding Process
import moPage1 from "../assets/mo-page1.png";
import moPage2 from "../assets/mo-page2.png";
import moPage3 from "../assets/mo-page3.png";
import moPage4 from "../assets/mo-page4.png";
import moPage5 from "../assets/mo-page5.png";

// Import the styles
import "../document-styles.css";

// Define the MerchantOnboardingProcess component
function MerchantOnboardingProcess() {
    // Array of image paths
    const pages = [moPage1, moPage2, moPage3, moPage4, moPage5];

    return (
        <div className="merchant-onboarding-page">
            {pages.map((page, index) => (
                <div
                    key={index}
                    className="merchant-section"
                    style={{ backgroundImage: `url(${page})` }}
                />
            ))}
        </div>
    );
}

// Export the MerchantOnboardingProcess component
export default MerchantOnboardingProcess;
