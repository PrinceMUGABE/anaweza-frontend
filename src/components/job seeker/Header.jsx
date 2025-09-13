/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaBriefcase, FaHome, FaPhone, FaInfoCircle, FaUsersCog, FaStar, FaBullhorn, FaChevronDown } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { X, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/system/anaweza.jpg";
import { useTranslation } from "react-i18next";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const { i18n, t } = useTranslation();

  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData")) || {}, []);
  const userId = userData.id || "";
  const userName = userData.phone_number || "User";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };

  // Group navigation items logically
  const mainNavLinks = useMemo(
    () => [
      { id: 1, name: "Dashboard", path: "/job_seeker", icon: <MdDashboard className="text-lg" /> },
      { id: 4, name: "Jobs", path: "/job_seeker/jobs", icon: <FaBriefcase className="text-lg" /> },
      { id: 5, name: "Job Seekers", path: "/job_seeker/job_seekers", icon: <FaUsersCog className="text-lg" /> },
    ],
    []
  );

  const secondaryNavLinks = useMemo(
    () => [
      { id: 6, name: "Testimonials", path: "/job_seeker/testimonials", icon: <FaStar className="text-lg" /> },
      { id: 7, name: "Advertisements", path: "/job_seeker/advertisements", icon: <FaBullhorn className="text-lg" /> },
      { id: 2, name: "About Us", path: "/job_seeker/about", icon: <FaInfoCircle className="text-lg" /> },
      { id: 3, name: "Contact Us", path: "/job_seeker/contact", icon: <FaPhone className="text-lg" /> },
    ],
    []
  );

  const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/job_seeker" className="flex items-center space-x-3">
              {/* <img src={Logo} alt="Anaweza Logo" className="h-10 w-auto rounded-lg shadow-md" /> */}
              <span className="text-white text-xl font-bold hidden sm:block">anawezA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation */}
            <div className="flex items-center space-x-1 mr-6">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className="px-4 py-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  {link.icon}
                  <span className="text-sm">{t(link.name)}</span>
                </Link>
              ))}
            </div>

            {/* Secondary Navigation */}
            <div className="flex items-center space-x-1 mr-6 border-l border-blue-500 pl-6">
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.id}
                  to={link.path}
                  className="px-3 py-2 rounded-md text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200 flex items-center space-x-2 text-sm"
                >
                  {link.icon}
                  <span>{t(link.name)}</span>
                </Link>
              ))}
            </div>

            {/* Language Selector */}
            <div className="mr-4">
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20"
                value={i18n.language}
              >
                <option value="en" className="text-gray-900">English</option>
                <option value="fr" className="text-gray-900">Français</option>
                <option value="rw" className="text-gray-900">Kinyarwanda</option>
              </select>
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              >
                <FaUserCircle className="text-xl" />
                <span className="text-sm font-medium">{userName}</span>
                <FaChevronDown className={`text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <Link
                    to={`/job_seeker/profile/${userId}`}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUserCircle className="text-gray-400" />
                    <span>{t("Profile")}</span>
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-red-700 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span>{t("Logout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform z-50 transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Menu Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-800 to-blue-600">
          <div className="flex items-center space-x-3">
            {/* <img src={Logo} alt="Logo" className="h-8 w-auto rounded" /> */}
            <h2 className="text-white text-lg font-bold">anawezA</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-md transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex flex-col h-full">
          <div className="p-6 flex-1 overflow-y-auto">
            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FaUserCircle className="text-3xl text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{userName}</p>
                  <p className="text-sm text-gray-600">Job Seeker</p>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={i18n.language}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>

            {/* Navigation Links */}
            <div className="space-y-2">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Main Menu</h3>
                {mainNavLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={link.path}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="text-blue-600">{link.icon}</div>
                    <span className="font-medium">{t(link.name)}</span>
                  </Link>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">More</h3>
                {secondaryNavLinks.map((link) => (
                  <Link
                    key={link.id}
                    to={link.path}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="text-blue-600">{link.icon}</div>
                    <span>{t(link.name)}</span>
                  </Link>
                ))}
              </div>

              <div>
                <Link
                  to={`/job_seeker/profile/${userId}`}
                  className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserCircle className="text-lg text-blue-600" />
                  <span className="font-medium">{t("Profile")}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
            >
              <FaSignOutAlt className="text-lg" />
              <span>{t("Logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;