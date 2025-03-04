/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { useTranslation } from "react-i18next";
import { MenuLinks } from "./Navbar";
import { Link, useNavigate } from "react-router-dom";

const ResponsiveMenu = ({ showMenu, setShowMenu, handleLinkClick }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
    setShowMenu(false); // Close menu after clicking login
  };

  const handleMenuItemClick = (name, link) => {
    // Close the mobile menu
    setShowMenu(false);
    
    // Handle the link click using the parent component's function
    if (handleLinkClick) {
      handleLinkClick(name, link);
    }
  };

  return (
    <div
      className={`${
        showMenu ? "left-0" : "-left-[100%]"
      } fixed bottom-0 top-0 z-20 flex h-screen w-[75%] flex-col justify-between bg-blue-700 text-white px-6 pb-6 pt-16 transition-all duration-200 md:hidden rounded-r-xl shadow-md`}
    >
      {/* Navigation Links */}
      <nav className="mt-12">
        <ul className="space-y-6 text-lg">
          {MenuLinks.map(({ id, name, link }) => (
            <li key={id}>
              <a 
                href={link} 
                className="block py-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuItemClick(name, link);
                }}
              >
                {t(name)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Language Selector & Login Button */}
      <div className="mt-auto">
        {/* Language Selector */}
        <label className="block text-white text-sm mb-2">{t("language")}</label>
        {/* <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="w-full bg-white text-black px-3 py-2 rounded"
          value={i18n.language}
        >
          <option value="en">ENG</option>
          <option value="fr">FR</option>
          <option value="rw">RW</option>
        </select> */}

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          className="w-full mt-4 bg-white text-sky-900 font-semibold py-2 rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
        >
          {t("login")}
        </button>
      </div>
    </div>
  );
};

export default ResponsiveMenu;