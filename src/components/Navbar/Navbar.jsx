/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import ResponsiveMenu from "./ResponsiveMenu";
import Logo from "../../assets/pictures/system/anaweza.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const MenuLinks = [
  { id: 1, name: "home", link: "/#home" },
  { id: 2, name: "jobs", link: "/#jobs" },
  { id: 3, name: "about", link: "/#about" },
  { id: 4, name: "services", link: "/#service" },
  { id: 5, name: "contact", link: "/#contact" },
  { id: 6, name: "partners", link: "/#partner" },
];

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const handleLoginClick = () => navigate("/login");

  return (
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
                  <a href={link} className="text-lg font-medium hover:text-blue-700 py-2 hover:border-b-2 hover:border-black transition-colors duration-500">
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
            <select
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              value={i18n.language}
            >
              <option value="en">ENG</option>
              <option value="fr">FR</option>
              <option value="rw">RW</option>
            </select>
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
      <ResponsiveMenu showMenu={showMenu} setShowMenu={setShowMenu} />
    </div>
  );
};

export default Navbar;
