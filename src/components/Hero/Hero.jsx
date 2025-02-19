/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import hero from "../../assets/pictures/system/anaweza.jpg";
import { useTranslation } from "react-i18next"; // Import translation hook

const Hero = () => {
  const { t } = useTranslation(); // Initialize translation function

  // Sample Data (Replace with API call)
  const [jobs, setJobs] = useState([
    { id: 1, title: "Software Engineer", company: "TechCorp" },
    { id: 2, title: "Marketing Specialist", company: "BrandX" },
    { id: 3, title: "Graphic Designer", company: "CreativeHub" }
  ]);

  const [ads, setAds] = useState([
    { id: 1, title: "50% Off Web Hosting!", company: "HostMaster" },
    { id: 2, title: "Learn AI in 30 Days!", company: "EduTech" }
  ]);



  return (
    <div className="bg-white pt-36 relative" id="home">
      <div className="absolute inset-0 bg-white/20 px-4"></div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center px-16 ml-8 mt-16">
        <h1 data-aos="fade-up" className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          <span className="text-black">{t("connectingTalentWith")}</span> <span className="text-black extrabold">{t("opportunities")}</span>
        </h1>
        <p data-aos="fade-up" data-aos-delay="300" className="text-white text-lg leading-relaxed py-4">
          {t("heroDescription")}
        </p>

      </div>

      {/* Jobs & Advertisements Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-16 py-10">
        {/* Jobs Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Latest Jobs")}</h2>
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.id} className="border-b pb-2">
                <h3 className="text-lg font-semibold text-blue-700">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Advertisements Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">

          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("Advertisements")}</h2>
          <ul className="space-y-4">
            {ads.map((ad) => (
              <li key={ad.id} className="border-b pb-2">
                <h3 className="text-lg font-semibold text-red-600">{ad.title}</h3>
                <p className="text-gray-600">{ad.company}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Hero;
