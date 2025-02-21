/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600 bg-red-50 rounded-lg">
          <h3 className="font-semibold">Something went wrong</h3>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Users() {
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#0E9F6E', '#1C64F2', '#5145CD'];
  const token = localStorage.getItem("token");

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken) {
      navigate("/login");
      return;
    }
    handleFetch();
  }, [navigate]);

  const handleFetch = async () => {
    try {
      const res = await axios.get("https://anaweza-backend.up.railway.app/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this user?")) return;
    try {
      await axios.delete(`https://anaweza-backend.up.railway.app/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("User deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({ html: "#user-table" });
      doc.save("users.pdf");
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(userData),
        "Users"
      );
      XLSX.writeFile(workbook, "users.xlsx");
    },
    CSV: () => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        Object.keys(userData[0]).join(",") +
        "\n" +
        userData.map((row) => Object.values(row).join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  // Updated role display names
  const getRoleDisplayName = (role) =>
    ({
      admin: "Admin",
      employee: "Employee",
      job_seeker: "Job Seeker",
      job_offer: "Job Offer Manager",
    }[role] || role);

  const renderCharts = () => {
    if (!userData.length) return null;
  
    // Role distribution data
    const roleData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, value]) => ({ name: getRoleDisplayName(role), value }));
  
    // User growth trend data
    const userGrowthData = Object.entries(
      userData.reduce((acc, user) => {
        const date = new Date(user.created_at).toLocaleDateString();
        acc[date] = acc[date] || {
          total: 0,
          admin: 0,
          employee: 0,
          job_seeker: 0,
          job_offer: 0,
        };
        acc[date].total += 1;
        acc[date][user.role] += 1;
        return acc;
      }, {})
    )
      .map(([date, counts]) => ({
        date,
        total: counts.total,
        admin: counts.admin || 0,
        employee: counts.employee || 0,
        job_seeker: counts.job_seeker || 0, 
        job_offer: counts.job_offer || 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <ErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold mb-4 text-green-700">
              User Role Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  label
                >
                  {roleData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
  
        <ErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-sm font-semibold mb-4 text-green-700">
              User Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  padding={{ left: 10, right: 10 }}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  padding={{ top: 10, bottom: 10 }}
                />
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  name="Total Users"
                />
                <Line
                  type="monotone"
                  dataKey="admin"
                  stroke="#82ca9d"
                  name="Admins"
                />
                <Line
                  type="monotone"
                  dataKey="employee"
                  stroke="#6B7280"
                  name="Employees"
                />
                <Line
                  type="monotone"
                  dataKey="job_seeker"
                  stroke="#5521B5"
                  name="Job Seekers"
                />
                <Line
                  type="monotone"
                  dataKey="job_offer"
                  stroke="#FF8042"
                  name="Job Offer Managers"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };
    
  const filteredData = userData.filter((user) =>
    [user.phone_number, user.role, user.email, user.created_at].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const currentUsers = filteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="justify-center w-full px-12 ml-4">
      <ErrorBoundary className="justify-center ml-4">
      <div className="p-4 justify-center ml-4">
        <h1 className="text-center text-green-700 font-bold text-xl mb-4">
          Manage Users
        </h1>
  
        {message && (
          <div
            className={`text-center py-2 px-4 mb-4 rounded ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
  
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="w-full lg:w-auto">
                <button
                  onClick={() => navigate("/admin/createUser")}
                  className="py-2 px-4 bg-sky-900 text-white rounded hover:bg-black w-full lg:w-auto"
                >
                  + Create User
                </button>
              </div>
  
              <div className="relative w-full lg:w-auto">
                <button
                  onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                  className="py-2 bg-green-400 px-4 rounded text-white hover:bg-black w-full lg:w-auto"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download
                </button>
                {downloadMenuVisible && (
                  <div className="absolute right-0 mt-2 bg-white text-gray-700 shadow-md rounded p-2 z-10">
                    {Object.keys(handleDownload).map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          handleDownload[format]();
                          setDownloadMenuVisible(false);
                        }}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>
  
              <div className="w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 text-gray-700 border rounded-full w-full lg:w-auto"
                />
              </div>
            </div>
  
            <div className="mb-4 text-right">
              <span className="text-sky-900">
                Total Users:{" "}
                <span className="font-bold text-black">
                  {filteredData.length}
                </span>
              </span>
            </div>
  
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table id="user-table" className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-sky-900 text-white">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Created Date</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-black">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-black">{index + 1}</td>
                        <td className="px-6 py-4 text-black">
                          {user.phone_number}
                        </td>
                        <td className="px-6 py-4 text-black">{user.email}</td>
                        <td className="px-6 py-4 text-black">
                          {getRoleDisplayName(user.role)}
                        </td>
                        <td className="px-6 py-4 text-black">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            to={`/admin/editUser/${user.id}`}
                            className="text-green-700 hover:text-blue-900"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
  
            <div className="flex justify-end items-center mt-4 space-x-4">
              <div className="flex items-center">
                <span className="mr-2 text-green-700">Filter rows:</span>
                <select
                  value={usersPerPage}
                  onChange={(e) => setUsersPerPage(Number(e.target.value))}
                  className="border rounded-lg px-2 py-1 text-gray-700"
                >
                  {[5, 10, 30, 50, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="mx-2 text-black">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage * usersPerPage >= filteredData.length}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
  
          {renderCharts()}
        </div>
      </div>
    </ErrorBoundary>
    </div>
    
  );
}

export default Users;