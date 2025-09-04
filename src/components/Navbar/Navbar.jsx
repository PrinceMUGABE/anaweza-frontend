/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { 
  AiOutlineHome, 
  AiOutlineUser, 
  AiOutlineInfoCircle, 
  AiOutlineMail 
} from "react-icons/ai";
import { 
  BsBriefcase, 
  BsTools 
} from "react-icons/bs";
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/system/anaweza.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const MenuLinks = [
  { 
    id: 1, 
    name: "home", 
    link: "/", 
    icon: AiOutlineHome 
  },
  { 
    id: 2, 
    name: "jobs", 
    link: "/jobs", 
    icon: BsBriefcase 
  },
  { 
    id: 3, 
    name: "Job Seekers", 
    link: "/job_seekers", 
    icon: AiOutlineUser 
  },
  { 
    id: 4, 
    name: "about", 
    link: "/about", 
    icon: AiOutlineInfoCircle 
  },
  { 
    id: 5, 
    name: "services", 
    link: "/#service", 
    icon: BsTools 
  },
  { 
    id: 6, 
    name: "contact", 
    link: "#contact", 
    icon: AiOutlineMail 
  },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const handleLoginClick = () => navigate("/login");

  const handleLinkClick = (name, link) => {
    if (name === "contact") {
      setShowContact(true);
    } else if (link.startsWith('/#')) {
      // Handle anchor links
      const targetId = link.substring(2);
      if (location.pathname !== '/') {
        navigate('/');
        // Small delay to ensure navigation completes before scrolling
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Handle regular route navigation
      navigate(link);
    }
  };

  // Contact information
  const phoneNumbers = [
    { number: '+250796087267', display: '+250 796 087 267' },
    { number: '+250783251199', display: '+250 783 251 199' },
    { number: '+250725169154', display: '+250 725 196 154' }
  ];

  const emails = [
    'ltdanaweza@gmail.com'
  ];

  const getEmailLink = (email) => {
    return `mailto:${email}`;
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 w-full ${scrolled ? 'bg-white shadow-md' : 'bg-white bg-opacity-95'} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-3 md:py-2">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex items-center gap-3 bg-white p-1 rounded flex-shrink-0"
              aria-label="Anaweza Home"
            >
              <img src={Logo} alt="Anaweza Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
              <ul className="flex items-center gap-3 xl:gap-6">
                {MenuLinks.map(({ id, name, link, icon: Icon }) => {
                  const isActive = location.pathname === link || 
                    (location.pathname === '/' && link === '/');
                  
                  return (
                    <li key={id} className="py-2">
                      <a
                        href={link}
                        className={`flex items-center gap-2 text-sm xl:text-lg font-medium py-2 px-2 xl:px-3 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? 'text-blue-700 bg-blue-50 border border-blue-200' 
                            : 'text-gray-800 hover:text-blue-700 hover:bg-blue-50 hover:border hover:border-blue-200'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(name, link);
                        }}
                      >
                        <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                        <span className="whitespace-nowrap">{t(name)}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              {/* Login Button */}
              <button 
                onClick={handleLoginClick} 
                className="bg-blue-700 text-white py-2 px-4 xl:px-5 rounded-lg hover:bg-blue-800 transition-colors duration-300 font-medium shadow-sm text-sm xl:text-base ml-2"
                aria-label="Login"
              >
                {t("login")}
              </button>

              {/* Language Selector */}
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="border text-gray-500 rounded-lg px-2 xl:px-3 py-1.5 text-xs xl:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ml-1"
                value={i18n.language}
                aria-label="Select language"
              >
                <option value="en">ENG</option>
                <option value="fr">FR</option>
                <option value="rw">RW</option>
              </select>
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={toggleMenu} 
              className="lg:hidden flex items-center text-gray-800 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
              aria-label={showMenu ? "Close menu" : "Open menu"}
            >
              {showMenu ? (
                <IoMdClose size={28} />
              ) : (
                <HiMenuAlt3 size={28} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <ResponsiveMenu
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          handleLinkClick={handleLinkClick}
        />
      </header>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-auto relative animate-fadeIn">
            {/* Close button */}
            <button
              onClick={() => setShowContact(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close contact dialog"
            >
              <IoMdClose size={24} />
            </button>

            <div className="p-8">
              <h2 className='text-blue-700 font-bold text-3xl mb-6 text-center'>
                Contact Us
              </h2>

              <div className='flex flex-col md:flex-row md:justify-between gap-8'>
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Phone Numbers
                  </h3>
                  <ul className="space-y-3 text-lg text-gray-600">
                    {phoneNumbers.map((phone, index) => (
                      <li key={index} className="flex items-center">
                        <a href={`tel:${phone.number}`} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                          {phone.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Email Addresses
                  </h3>
                  <ul className="space-y-3 text-lg text-gray-600">
                    {emails.map((email, index) => (
                      <li key={index} className="flex items-center">
                        <a href={getEmailLink(email)} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors break-all">
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