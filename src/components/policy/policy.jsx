/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const Policy = () => {
  const navigate = useNavigate();
  
  // Pricing tiers based on salary ranges
  const pricingTiers = [
    {
      range: "Below 100,000 RWF",
      registrationFee: "2,000 RWF",
      renewalFee: "1,000 RWF/year",
      features: [
        "Basic profile visibility",
        "Access to entry-level job listings",
        "Limited application submissions (10/month)"
      ]
    },
    {
      range: "100,000 - 199,000 RWF",
      registrationFee: "5000 RWF",
      renewalFee: "2,500 RWF/year",
      features: [
        "Enhanced profile visibility",
        "Access to mid-level job listings",
        "Standard application submissions (20/month)",
        // "Resume highlighting feature"
      ]
    },
    {
      range: "199,000 - 499,000 RWF -",
      registrationFee: "10,000 RWF",
      renewalFee: "5,000 RWF/year",
      features: [
        "Premium profile visibility",
        "Priority access to all job listings",
        "Unlimited application submissions",
        "Featured profile status",
        "Direct messaging to employers"
      ]
    },
    {
        range: "500,000 - Above RWF -",
        registrationFee: "20,000 RWF",
        renewalFee: "10,000 RWF/year",
        features: [
          "Premium profile visibility",
          "Priority access to all job listings",
          "Unlimited application submissions",
          "Featured profile status",
          "Direct messaging to employers"
        ]
      }
  ];

  // Job posting pricing for job seekers who also want to post jobs
  const jobPostingPricing = [
    {
      type: "Basic Listing",
      price: "15,000 RWF",
      duration: "30 days",
      features: [
        "Standard visibility",
        "Up to 5 candidate applications",
        "Basic job description"
      ]
    },
    {
      type: "Featured Listing",
      price: "30,000 RWF",
      duration: "30 days",
      features: [
        "Highlighted in search results",
        "Up to 20 candidate applications",
        "Detailed job description with company profile",
        "Initial candidate screening"
      ]
    },
    {
      type: "Premium Listing",
      price: "50,000 RWF",
      duration: "60 days",
      features: [
        "Top placement in search results",
        "Unlimited candidate applications",
        "Complete job and company description",
        "Candidate screening and shortlisting",
        "Featured in weekly job alert emails"
      ]
    }
  ];

  return (
    <section className="bg-gray-100 min-h-screen py-8">
      <Navbar />
      
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10 text-blue-800">Anaweza Pricing Policy</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Overview</h2>
            <p className="text-gray-700 mb-4">
              At Anaweza, we believe in providing fair and transparent pricing that aligns with our users' career levels and needs. 
              Our pricing structure is designed to be accessible to job seekers at all income levels.
            </p>
            <p className="text-gray-700 mb-4">
              Additionally, we understand that many professionals wear multiple hats – sometimes seeking opportunities while also 
              needing to hire talent for their own projects or businesses. Our platform accommodates this flexibility by allowing 
              all users to both seek and post jobs as needed.
            </p>
          </div>
          
          {/* Job Seeker Registration Pricing */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Job Seeker Registration Pricing</h2>
            <p className="text-gray-700 mb-4">
              Our registration fees are scaled according to the salary range you're targeting in your job search. 
              This ensures that our service remains accessible to everyone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {pricingTiers.map((tier, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-blue-700 text-white p-4">
                    <h3 className="text-xl font-bold">{tier.range}</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-800">{tier.registrationFee}</span>
                      <span className="text-gray-600"> registration</span>
                    </div>
                    <div className="mb-6 text-sm text-gray-600">
                      Annual renewal: {tier.renewalFee}
                    </div>
                    {/* <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Job Posting Pricing */}
          {/* <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Job Posting Pricing</h2>
            <p className="text-gray-700 mb-4">
              As an Anaweza user, you have the flexibility to post job opportunities even while you're searching for positions yourself.
              This is ideal for freelancers, entrepreneurs, or professionals managing teams who need to hire while also exploring their own career growth.
            </p>


            kjbdhvsdgjvshdvsjv
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {jobPostingPricing.map((tier, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-green-700 text-white p-4">
                    <h3 className="text-xl font-bold">{tier.type}</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-800">{tier.price}</span>
                      <span className="text-gray-600"> for {tier.duration}</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
          
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Methods</h2>
            <p className="text-gray-700 mb-4">
              We accept various payment methods to ensure convenience for all our users:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Mobile Money: 0795570541</li>
              <li>MOMO: 15492374</li>
              {/* <li>Credit/Debit Cards</li>
              <li>PayPal (for international users)</li> */}
            </ul>
            <p className="text-gray-700 mt-4">
              All payments are secured using industry-standard encryption protocols to ensure the safety of your financial information.
            </p>
          </div>
          
     
          <div className="bg-white rounded-lg shadow-lg p-6">

            <p className="text-gray-700">
              For any questions regarding our pricing or refund policy, please contact our support team at ltdanaweza@gmail.com or call us on: 0795570541, 0725169154.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Policy;