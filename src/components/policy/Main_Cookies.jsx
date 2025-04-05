/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React from 'react';
import Navbar from '../Navbar/Navbar';
import { useTranslation } from "react-i18next";

const Cookies = () => {
  return (
    <section className="bg-gray-100 min-h-screen py-8">
      <Navbar />

      <div className="pt-20 pb-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-10 text-blue-800">Cookies Policy</h1>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Introduction</h2>
            <p className="text-gray-700 mb-4">
              This Cookies Policy explains how we use cookies and similar technologies to enhance your experience on our platform,
              analyze site traffic, and provide personalized services. By using our platform, you consent to the use of cookies as described in this policy.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">What are Cookies?</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us remember your preferences, 
              ensure a smoother user experience, and collect data on how you use our platform to improve our services.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">How We Use Cookies</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>To improve website functionality and provide a better user experience.</li>
              <li>To personalize content and ads based on your preferences and browsing behavior.</li>
              <li>To analyze traffic and usage patterns to enhance our platform’s performance.</li>
              <li>To remember login information and user settings for a seamless experience.</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Types of Cookies We Use</h2>
            <p className="text-gray-700 mb-4">
              We use the following types of cookies to improve your experience:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Essential Cookies</h3>
                <p className="text-gray-700">
                  These cookies are necessary for the website to function and cannot be disabled. They allow you to navigate our platform 
                  and use essential features such as secure logins, forms, and user authentication.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Performance Cookies</h3>
                <p className="text-gray-700">
                  Performance cookies collect data on how users interact with the website, such as which pages are visited the most 
                  or if users receive error messages. These cookies help us improve the performance of our platform.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Functionality Cookies</h3>
                <p className="text-gray-700">
                  Functionality cookies allow us to remember your preferences and settings, such as language, location, or font size, 
                  to provide a more personalized experience.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800">Targeting Cookies</h3>
                <p className="text-gray-700">
                  These cookies are used to track your browsing habits and to show you relevant ads and content based on your interests. 
                  They can also limit the number of times you see an ad.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies through your browser settings. You can choose to accept or reject cookies, and you can 
              also delete cookies that have already been stored on your device.
            </p>
            <p className="text-gray-700">
              Please note that disabling cookies may affect the functionality of our platform and limit your experience on our site.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Changes to This Cookie Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Cookies Policy from time to time. When we do, we will post the updated policy on this page and update the 
              “Last Updated” date. We encourage you to review this policy periodically for any changes.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions or concerns regarding our Cookies Policy, please contact support team:
            </p>
            <ul className='text-gray-500'>
                <li>Phone: +250 788 457 408</li>
                <li>Email: ltdanaweza@gmail.com</li>

            </ul>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Cookies;
