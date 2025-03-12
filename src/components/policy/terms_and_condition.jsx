/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useTranslation } from "react-i18next";


const TermsAndConditions = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <section className="bg-gray-100 min-h-screen">
      <Navbar />
      
      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10 text-blue-800">Terms and Conditions</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Anaweza. These Terms and Conditions govern your use of our platform and services. 
              By accessing or using Anaweza, you agree to be bound by these Terms. If you disagree with any 
              part of these terms, you may not access the service.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Accounts</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>Registration:</strong> When you create an account with us, you must provide accurate, 
                complete, and up-to-date information. Failure to do so constitutes a breach of the Terms, which 
                may result in immediate termination of your account.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for safeguarding the password used to access 
                the service and for any activities or actions under your password. We encourage you to use 'strong' 
                passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) 
                with your account.
              </p>
              <p>
                <strong>Dual Role Capabilities:</strong> As an Anaweza user, you have the flexibility to both seek employment 
                and post job opportunities. This dual functionality is subject to appropriate pricing tiers and usage 
                policies as outlined in our Pricing Policy.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Conduct</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                As a user of Anaweza, you agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false, misleading, or inaccurate information in your profile or job postings.</li>
                <li>Use the service for any illegal purpose or in violation of any local, state, national, or international law.</li>
                <li>Harass, abuse, or harm another person, including sending unwelcome communications to others.</li>
                <li>Post discriminatory job listings or engage in discriminatory hiring practices.</li>
                <li>Share or distribute private or personal information about other users without their consent.</li>
                <li>Create multiple accounts for deceptive or fraudulent purposes.</li>
                <li>Post irrelevant, misleading, or fraudulent job listings.</li>
                <li>Attempt to access the accounts of other users or breach the security of the website.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Job Seeker Specific Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>Profile Accuracy:</strong> Job seekers must provide accurate information about their qualifications, 
                experience, and desired salary range. The salary range you select will determine your registration 
                fee as per our pricing policy.
              </p>
              <p>
                <strong>Application Process:</strong> When applying for jobs through Anaweza, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Apply only for positions for which you are genuinely interested and qualified.</li>
                <li>Provide truthful information in your applications.</li>
                <li>Adhere to the application limits associated with your account tier.</li>
                <li>Respect the confidentiality of any information provided during the application process.</li>
              </ul>
              <p>
                <strong>Account Renewal:</strong> Job seeker accounts are subject to annual renewal fees as specified in 
                our Pricing Policy. Failure to renew may result in reduced visibility or account deactivation.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Job Posting Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                All users, including those primarily registered as job seekers, may post job opportunities subject to the following terms:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All job postings must accurately represent the position being offered.</li>
                <li>Job postings must include clear information about the role, responsibilities, qualifications required, and location.</li>
                <li>Compensation details should be transparent and honest.</li>
                <li>Job postings must comply with all applicable labor and employment laws.</li>
                <li>No discriminatory language or requirements are permitted in job postings.</li>
                <li>Postings for illegal activities or services are strictly prohibited.</li>
                <li>Job posting fees are charged according to the tier selected and are non-refundable after 48 hours or after receiving applications.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Payment Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>Fee Structure:</strong> Fees for user registration and job postings are detailed in our Pricing Policy. 
                These fees are subject to change with reasonable notice posted on our platform.
              </p>
              <p>
                <strong>Payment Obligation:</strong> You agree to pay all fees associated with your selected tier and services. 
                All payments are due in advance and are non-refundable except as specified in our Refund Policy.
              </p>
              <p>
                <strong>Billing:</strong> We use trusted third-party payment processors for all transactions. 
                By providing payment information, you represent that you are authorized to use the payment method and 
                agree to allow us to charge your chosen payment method for the services you select.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Intellectual Property</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>Platform Content:</strong> The service and its original content, features, and functionality are and will 
                remain the exclusive property of Anaweza and its licensors. The service is protected by copyright, 
                trademark, and other laws of both Rwanda and foreign countries.
              </p>
              <p>
                <strong>User Content:</strong> You retain all rights to the content you post on Anaweza. By posting content, 
                you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your 
                content in connection with providing and promoting the service.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Termination</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
                including, without limitation, if you breach the Terms. Upon termination, your right to use the service 
                will immediately cease.
              </p>
              <p>
                All provisions of the Terms which by their nature should survive termination shall survive termination, 
                including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Privacy Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Your use of Anaweza is also governed by our Privacy Policy, which is incorporated herein by reference. 
                Please review our Privacy Policy, which also governs the Service and informs users of our data 
                collection practices.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Changes to Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                We will provide notice of any changes by posting the new Terms on this page.
              </p>
              <p>
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. 
                If you do not agree to any of these terms or any future version of the Terms, do not use or access the service.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: ltdanaweza@gmail.com<br />
                Phone: <ul>
                  <li>+250 788 457 54081</li>
                  <li>+250 783 251 199</li>
                  
                  </ul><br />
                Address: Kigali, Rwanda
              </p>
              <p className="mt-6 text-sm text-gray-500">
                Last updated: March 1, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsAndConditions;