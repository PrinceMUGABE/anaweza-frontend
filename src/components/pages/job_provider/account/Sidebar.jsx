/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { GiHealthNormal } from "react-icons/gi";
import { FiActivity } from "react-icons/fi";
import { BiAccessibility } from "react-icons/bi";
import { AiFillDatabase } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../../assets/pictures/system/logo.png";

function Sidebar() {
  const [activeLink, setActiveLink] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For toggling sidebar on small screens
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");

  // Retrieve user data from local storage
  const userData = JSON.parse(localStorage.getItem("userData")) || {};
  const userId = userData.id || ""; // Fallback to an empty string if no id is found

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData && userData.phone) {
      setPhone(userData.phone);
    }
    console.log("Retrieved user data:", userData);
  }, []);

  const handleLinkClick = (index) => {
    setActiveLink(index);
    setIsMenuOpen(false); // Close the menu when a link is clicked
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    navigate("/");
  };

  const Sidebar_Links = [
    { id: 1, name: "Dashboard", path: "/admin", icon: <MdDashboard /> },
    { id: 2, name: "Users", path: "/admin/users", icon: <FaUsers /> },
    {
      id: 3,
      name: "Health Facilities",
      path: "/admin/facilities",
      icon: <GiHealthNormal />,
    },
    {
      id: 4,
      name: "Population Data",
      path: "/admin/populations",
      icon: <AiFillDatabase />,
    },
    {
      id: 5,
      name: "Disease Incidence",
      path: "/admin/diseases",
      icon: <FiActivity />,
    },
    {
      id: 6,
      name: "Health Accessibilities",
      path: "/admin/accessibilities",
      icon: <BiAccessibility />,
    },
    {
      id: 7,
      name: "Resource Allocations",
      path: "/admin/allocations",
      icon: <GiHealthNormal />,
    },
    {
      id: 8,
      name: "Profile",
      path: `/admin/profile/${userId}`,
      icon: <FaUserCircle />,
    },
  ];

  return (
    <div>
      {/* Hamburger Icon for Small Screens */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white bg-black p-2 rounded-full shadow-md focus:outline-none"
        >
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-10 h-screen w-64 mr-12 pr-8 bg-sky-900 shadow-md transform ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        {/* Sidebar Logo */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="Logo"
            className="h-1/2 w-1/2 ml-4  mt-10 rounded-full cursor-pointer"
          />
        </div>

        {/* Sidebar Links */}
        <ul className="space-y-6 mt-16">
          {Sidebar_Links.map((link, index) => (
            <li key={index} className="relative">
              <div
                className={`font-medium rounded-md py-2 px-5 hover:bg-gray-400 hover:text-white ${
                  activeLink === index ? "bg-black text-white" : ""
                }`}
                onClick={() => handleLinkClick(index)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-indigo-500">{link.icon}</span>
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

          {/* Logout Button */}
          <li className="relative">
            <div
              className="font-medium rounded-md py-2 px-5 hover:bg-gray-100 hover:text-indigo-500"
              onClick={handleLogout}
            >
              <div className="flex items-center space-x-3 cursor-pointer">
                <span className="text-indigo-500">
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

      {/* Overlay for small screens */}
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
