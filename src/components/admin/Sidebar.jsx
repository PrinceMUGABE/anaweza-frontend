/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard, MdWork, MdRateReview, MdSubscriptions } from "react-icons/md";
import { GiSuitcase } from "react-icons/gi";
import { FiUsers } from "react-icons/fi";
import { AiFillNotification, AiFillProfile } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/pictures/system/anaweza.jpg";

function Sidebar() {
  const [activeLink, setActiveLink] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || "";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
  }, []);

  const handleLinkClick = (index) => {
    setActiveLink(index);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };

  const Sidebar_Links = [
    { id: 1, name: "Dashboard", path: "/admin", icon: <MdDashboard /> },
    { id: 2, name: "Users", path: "/admin/users", icon: <FiUsers /> },
    { id: 3, name: "Job Categories", path: "/admin/job_categories", icon: <MdWork /> },
    { id: 4, name: "Job Offers", path: "/admin/job_offers", icon: <GiSuitcase /> },
    { id: 5, name: "Job Seekers", path: "/admin/job_seekers", icon: <FaUsers /> },
    { id: 6, name: "Job Aplications", path: "/admin/job_applications", icon: <FaUsers /> },
    { id: 7, name: "Advertisements", path: "/admin/advertisements", icon: <AiFillNotification /> },
    { id: 8, name: "Testimonials", path: "/admin/testimonials", icon: <MdRateReview /> },
    { id: 9, name: "Subscribers", path: "/admin/subscribers", icon: <MdSubscriptions /> },
    { id: 10, name: "Profile", path: `/admin/profile/${userId}`, icon: <AiFillProfile /> },
  ];

  return (
    <div>
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white bg-blue-700 p-2 rounded-full shadow-md focus:outline-none"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 z-10 h-screen w-64 bg-blue-700 shadow-md transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center">
          <img
            src={Logo}
            alt="Logo"
            className="h-full w-3/4 ml-4 mt-10 cursor-pointer"
          />
        </div>

        <ul className="space-y-4 mt-8">
          {Sidebar_Links.map((link, index) => (
            <li key={index} className="relative">
              <div
                className={`font-medium rounded-md py-2 px-5 hover:bg-gray-400 hover:text-white ${
                  activeLink === index ? "bg-black text-white" : ""
                }`}
                onClick={() => handleLinkClick(index)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-white">{link.icon}</span>
                  <Link
                    to={link.path || "#"}
                    className="text-sm text-white hover:text-gray-700"
                  >
                    {link.name}
                  </Link>
                </div>
              </div>
            </li>
          ))}

          <li className="relative">
            <div
              className="font-medium rounded-md py-2 px-5 hover:bg-gray-100 hover:text-indigo-500"
              onClick={handleLogout}
            >
              <div className="flex items-center space-x-3 cursor-pointer">
                <span className="text-white">
                  <FaSignOutAlt />
                </span>
                <span className="text-sm text-white hover:text-gray-700">
                  Logout
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-5 bg-black bg-opacity-50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Sidebar;
