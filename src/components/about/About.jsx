/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useTranslation } from "react-i18next";

function About() {
  const navigate = useNavigate();

  return (
    <section id="about" className="py-10 bg-slate-100 dark:text-white">
      <Navbar/>
      <div className="bg-gray-300 mt-2 py-8">
        <h2
          data-aos="fade-up"
          className="text-center text-4xl font-bold mb-10 text-black dark:text-black py-2"
        >
          About Us
        </h2>
      </div>

      <main className="container mx-auto flex flex-col items-center justify-center">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white rounded-lg shadow-lg">
          <div data-aos="fade-right" className="w-full h-80 bg-blue-700 rounded-lg p-4"></div>
          <div data-aos="fade-left" className="flex flex-col gap-4">
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Who We Are</h3>
              <p className="text-sm dark:text-slate-800">
                Anaweza is an innovative job-matching platform that connects job seekers with employers globally. 
                Our system enables job seekers to create professional profiles visible to potential employers, 
                while job providers can post opportunities and manage applicants seamlessly.
              </p>
            </div>
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Vision</h3>
              <p className="text-sm dark:text-slate-800">
                Our vision is to create a globally accessible platform where job seekers can showcase their skills 
                and job providers can find the right talent effortlessly, bridging employment gaps worldwide.
              </p>
            </div>
            <div className="p-4 border-l-4 border-gray-700">
              <h3 className="text-2xl font-semibold mb-2 text-black">Mission</h3>
              <p className="text-sm dark:text-slate-800">
                We are committed to empowering job seekers by enhancing their visibility and access to opportunities, 
                while providing job providers with efficient tools to recruit top talent and manage applications effectively.
              </p>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}

export default About;




// MY GITHUB LOGIN TOKEN: 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
