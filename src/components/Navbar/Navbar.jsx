// Navbar.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io"; // Import close icon
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/system/anaweza.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const MenuLinks = [
  { id: 1, name: "home", link: "/" },
  { id: 2, name: "jobs", link: "/jobs" },
  { id: 3, name: "about", link: "/about" },
  { id: 4, name: "services", link: "/#service" },
  { id: 5, name: "contact", link: "#" },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const handleLoginClick = () => navigate("/login");
  
  const handleLinkClick = (name, link) => {
    if (name === "about") {
      navigate("/about");
    } else if (name === "contact") {
      setShowContact(true);
    } else if (link.startsWith('/#')) {
      window.location.href = link;
    } else if (name==="jobs"){
      navigate("/jobs")
    } else if (name==="home"){
      navigate("/")
    }
  };

  // Contact information
  const phoneNumbers = [
    { number: '+250788457408', display: '+250 788 457 408' },
    { number: '+250789990408', display: '+250 789 990 408' },
    { number: '+250786779262', display: '+250 786 779 262' }
  ];

  const emails = [
    'princemugabe568@gmail.com',
    'princemugabe567@gmail.com',
    'eddy123@gmail.com'
  ];

  const getEmailLink = (email) => {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 w-full bg-white text-black shadow-md">
        <div className="container py-3 md:py-2">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 bg-white p-1 rounded">
              <img src={Logo} alt="Logo" className="w-1/2 h-3/4" />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <ul className="flex items-center gap-6">
                {MenuLinks.map(({ id, name, link }) => (
                  <li key={id} className="py-2">
                    <a 
                      href={link} 
                      className="text-lg font-medium hover:text-blue-700 py-2 hover:border-b-2 hover:border-black transition-colors duration-500"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(name, link);
                      }}
                    >
                      {t(name)}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Login Button */}
              <button onClick={handleLoginClick} className="bg-blue-700 text-white py-2 px-4 rounded hover:bg-black transition-colors duration-300">
                {t("login")}
              </button>

              {/* Language Selector */}
              {/* <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                value={i18n.language}
              >
                <option value="en">ENG</option>
                <option value="fr">FR</option>
                <option value="rw">RW</option>
              </select> */}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              {showMenu ? (
                <HiMenuAlt1 onClick={toggleMenu} className="cursor-pointer transition-all" size={30} />
              ) : (
                <HiMenuAlt3 onClick={toggleMenu} className="cursor-pointer transition-all" size={30} />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <ResponsiveMenu 
          showMenu={showMenu} 
          setShowMenu={setShowMenu} 
          handleLinkClick={handleLinkClick} 
        />
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto relative">
            {/* Close button */}
            <button 
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>
            
            <div className="p-6">
              <h2 className='text-headingColor font-[700] text-[2rem] mb-6 text-black text-center'>
                Contact Us
              </h2>
              
              <div className='flex flex-col md:flex-row md:justify-between gap-6'>
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Phone Numbers:</h3>
                  <ul className="space-y-2 text-lg text-gray-600">
                    {phoneNumbers.map((phone, index) => (
                      <li key={index}>
                        <a href={`tel:${phone.number}`} className="text-blue-600 hover:underline">
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Email Addresses:</h3>
                  <ul className="space-y-2 text-lg text-gray-600">
                    {emails.map((email, index) => (
                      <li key={index}>
                        <a href={getEmailLink(email)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;