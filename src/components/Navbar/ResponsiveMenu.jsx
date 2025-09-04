/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MenuLinks } from "./Navbar";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

const ResponsiveMenu = ({ showMenu, setShowMenu, handleLinkClick }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleLoginClick = () => {
    navigate("/login");
    setShowMenu(false);
  };

  const handleMenuItemClick = (name, link) => {
    setShowMenu(false);
    
    if (handleLinkClick) {
      handleLinkClick(name, link);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, setShowMenu]);

  return (
    <>
      {/* Overlay to detect outside clicks on mobile */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}
      
      <div
        ref={menuRef}
        className={`${
          showMenu ? "left-0" : "-left-[100%]"
        } fixed bottom-0 top-0 z-20 flex h-screen w-[85%] sm:w-[75%] flex-col justify-between bg-gradient-to-b from-blue-700 to-blue-800 text-white px-6 pb-6 pt-16 transition-all duration-300 lg:hidden rounded-r-xl shadow-2xl`}
      >
        {/* Header with close button */}
        <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white opacity-90">Menu</h2>
          <button 
            className="text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/10"
            onClick={() => setShowMenu(false)}
            aria-label="Close menu"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-4 flex-1">
          <ul className="space-y-2 text-lg">
            {MenuLinks.map(({ id, name, link, icon: Icon }) => (
              <li key={id}>
                <a 
                  href={link} 
                  className="flex items-center gap-4 py-3 px-4 hover:text-blue-200 transition-all duration-200 rounded-xl hover:bg-white/10 active:bg-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuItemClick(name, link);
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{t(name)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section - Language Selector & Login Button */}
        <div className="mt-auto space-y-4 pt-6 border-t border-white/20">
          {/* Language Selector */}
          <div>
            <label className="block text-white text-sm mb-2 font-medium opacity-90">
              {t("language") || "Language"}
            </label>
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="w-full bg-white text-gray-800 px-3 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              value={i18n.language}
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="rw">Kinyarwanda</option>
            </select>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLoginClick}
            className="w-full bg-white text-blue-700 font-bold py-3 rounded-lg shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
            aria-label="Login"
          >
            {t("login")}
          </button>
        </div>
      </div>
    </>
  );
};

export default ResponsiveMenu;