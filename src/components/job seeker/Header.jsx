/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { FaUserCircle, FaSignOutAlt, FaBriefcase, FaHome, FaPhone, FaInfoCircle, FaUsersCog, FaStar, FaBullhorn } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { X, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/system/anaweza.jpg";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData")) || {}, []);
  const userId = userData.id || "";

  useEffect(() => {
    if (userData.phone) setPhone(userData.phone);
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Navbar_Links = useMemo(() => [
    { id: 1, name: "Dashboard", path: "/job_seeker", icon: <MdDashboard className="text-xl" /> },
    { id: 2, name: "About Us", path: "/job_seeker/about", icon: <FaInfoCircle className="text-xl" /> },
    { id: 3, name: "Contact Us", path: "/job_seeker/contact", icon: <FaPhone className="text-xl" /> },
    { id: 4, name: "Jobs", path: "/job_seeker/jobs", icon: <FaBriefcase className="text-xl" /> },
    { id: 5, name: "Job Seekers", path: "/job_seeker/job_seekers", icon: <FaUsersCog className="text-xl" /> },
    { id: 6, name: "Testimonials", path: "/job_seeker/testimonials", icon: <FaStar className="text-xl" /> },
    { id: 7, name: "Advertisements", path: "/job_seeker/advertisements", icon: <FaBullhorn className="text-xl" /> },
    { id: 8, name: "Profile", path: `/job_seeker/profile/${userId}`, icon: <FaUserCircle className="text-xl" /> },
  ], [userId]);

  return (
    <nav className="bg-blue-700 shadow-lg py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">
        <img src={Logo} alt="Logo" className="h-12 w-auto" />

        <div className="hidden md:flex items-center space-x-6">
          {Navbar_Links.map((link) => (
            <Link key={link.id} to={link.path} className="text-white hover:text-blue-200 flex items-center space-x-2">
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="text-white hover:text-blue-200 flex items-center space-x-2">
            <FaSignOutAlt className="text-xl" />
            <span>Logout</span>
          </button>
        </div>

        <button onClick={() => setIsOpen(true)} className="md:hidden text-white hover:text-blue-200">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}></div>
      )}

      <div ref={menuRef} className={`fixed top-0 right-0 h-full w-64 bg-blue-700 transform z-50 p-4 transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center border-b border-blue-800 pb-2">
          <h2 className="text-white text-lg font-semibold">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-blue-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex flex-col space-y-4 mt-4">
          {Navbar_Links.map((link) => (
            <Link key={link.id} to={link.path} className="text-white hover:text-blue-200 flex items-center space-x-3 p-2 rounded-md hover:bg-blue-700" onClick={() => setIsOpen(false)}>
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="text-white hover:text-blue-200 flex items-center space-x-3 p-2 rounded-md hover:bg-blue-700">
            <FaSignOutAlt className="text-xl" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;