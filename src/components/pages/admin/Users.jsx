/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
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
  BarChart,
  Bar
} from "recharts";
import {
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  UserIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

// StatCards Component
const StatCards = ({ userData }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    totalUsers: userData.length,
    newUsers: userData.filter(user => {
      const createdDate = new Date(user.created_at);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length,
    activeUsers: userData.filter(user => user.status === "Active").length,
    inactiveUsers: userData.filter(user => user.status === "Non-Active").length,
    roles: {
      admin: userData.filter(user => user.role === "admin").length,
      employee: userData.filter(user => user.role === "employee").length,
      jobSeeker: userData.filter(user => user.role === "job_seeker").length,
      jobOffer: userData.filter(user => user.role === "job_offer").length
    }
  };

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      trend: stats.totalUsers / (userData.length || 1) * 100
    },
    {
      title: "New Users Today",
      value: stats.newUsers,
      icon: UserPlusIcon,
      color: "bg-green-500",
      textColor: "text-green-600",
      trend: stats.newUsers / (stats.totalUsers || 1) * 100
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      trend: stats.activeUsers / (stats.totalUsers || 1) * 100
    },
    {
      title: "Inactive Users",
      value: stats.inactiveUsers,
      icon: XCircleIcon,
      color: "bg-red-500",
      textColor: "text-red-600",
      trend: stats.inactiveUsers / (stats.totalUsers || 1) * 100
    }
  ];

  const roleCards = [
    {
      title: "Admins",
      value: stats.roles.admin,
      icon: ShieldCheckIcon,
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "Employees",
      value: stats.roles.employee,
      icon: UserIcon,
      color: "bg-indigo-500",
      textColor: "text-indigo-600"
    },
    {
      title: "Job Seekers",
      value: stats.roles.jobSeeker,
      icon: BriefcaseIcon,
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Job Providers",
      value: stats.roles.jobOffer,
      icon: BuildingOfficeIcon,
      color: "bg-orange-500",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{card.value}</h3>
                <div className="flex items-center">
                  <span className={`text-xs font-medium ${card.trend > 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {card.trend.toFixed(1)}% of total
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
                <card.icon className={`h-6 w-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <h3 className="text-sm font-semibold text-gray-500 mb-3">ROLE DISTRIBUTION</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg mr-3 ${card.color} bg-opacity-10`}>
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.title}</p>
                <h3 className="text-lg font-semibold text-gray-800">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#0E9F6E', '#1C64F2', '#5145CD', '#FF8042'];
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
      setLoading(true);
      const res = await axios.get("https://anaweza-backend.up.railway.app/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.users) ? res.data.users : [];
      setUserData(data);
      setFilteredData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`https://anaweza-backend.up.railway.app/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await handleFetch();
      setMessage("User deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data.message || "An error occurred");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.text("User Report", 14, 16);
      doc.autoTable({ 
        html: "#user-table",
        startY: 20,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [33, 150, 243],
          textColor: 255
        }
      });
      doc.save(`users-report-${new Date().toISOString().slice(0,10)}.pdf`);
    },
    Excel: () => {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(userData.map(user => ({
        ID: user.id,
        Phone: user.phone_number,
        Email: user.email,
        Role: getRoleDisplayName(user.role),
        Status: user.status,
        'Created At': new Date(user.created_at).toLocaleString()
      })));
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      XLSX.writeFile(workbook, `users-report-${new Date().toISOString().slice(0,10)}.xlsx`);
    },
    CSV: () => {
      const csvContent = [
        Object.keys({
          ID: '',
          Phone: '',
          Email: '',
          Role: '',
          Status: '',
          'Created At': ''
        }).join(','),
        ...userData.map(user => [
          user.id,
          user.phone_number,
          user.email,
          getRoleDisplayName(user.role),
          user.status,
          new Date(user.created_at).toLocaleString()
        ].map(e => `"${e}"`).join(','))
      ].join('\n');
      
      const link = document.createElement("a");
      link.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
      link.setAttribute("download", `users-report-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };

  const getRoleDisplayName = (role) =>
    ({
      admin: "Admin",
      employee: "Employee",
      job_seeker: "Job Seeker",
      job_offer: "Job Provider",
    }[role] || role);

  const getStatusDisplayName = (status) =>
    ({
      Active: "Active",
      "Non-Active": "Inactive",
    }[status] || status);

  const applyFilters = () => {
    let result = [...userData];
    
    // Apply search query
    if (searchQuery) {
      result = result.filter(user =>
        Object.values(user).some(
          value => value && 
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply role filter
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(user => user.status === filters.status);
    }
    
    // Apply date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(user => new Date(user.created_at) >= fromDate);
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(user => new Date(user.created_at) <= toDate);
    }
    
    setFilteredData(result);
    setCurrentPage(1);
    setFilterMenuVisible(false);
  };

  const resetFilters = () => {
    setFilters({
      role: "",
      status: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchQuery("");
    setFilteredData(userData);
    setCurrentPage(1);
  };

  const renderCharts = () => {
    if (!userData.length || loading) return null;
  
    // Role distribution data for pie chart
    const roleData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    ).map(([role, value]) => ({ 
      name: getRoleDisplayName(role), 
      value,
      percentage: ((value / userData.length) * 100).toFixed(1) + '%'
    }));
  
    // Status distribution data for bar chart
    const statusData = Object.entries(
      userData.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({
      status: getStatusDisplayName(status),
      count,
      fill: status === "Active" ? "#0E9F6E" : "#F05252"
    }));
  
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
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ErrorBoundary>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              User Role Distribution
            </h3>
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      label={({ name, percentage }) => `${name}: ${percentage}`}
                    >
                      {roleData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        value, 
                        `${props.payload.percentage} of total`
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Details</h4>
                <div className="space-y-3">
                  {roleData.map((role, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium text-gray-700">{role.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {role.value} <span className="text-gray-500">({role.percentage})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ErrorBoundary>
  
        <div className="space-y-6">
          <ErrorBoundary>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                User Status Overview
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    name="Users"
                    radius={[4, 4, 0, 0]}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ErrorBoundary>
  
          <ErrorBoundary>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                User Growth Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    name="Total Users"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ErrorBoundary>
        </div>
      </div>
    );
  };

  const currentUsers = filteredData.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredData.length / usersPerPage);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFetch()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Refresh data"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate("/admin/createUser")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 mb-6 rounded-lg ${
              messageType === "success" 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message}</span>
              <button onClick={() => setMessage("")} className="text-lg">
                &times;
              </button>
            </div>
          </div>
        )}

        <StatCards userData={userData} />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  applyFilters();
                }}
                className="pl-10 text-gray-700 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <button
                  onClick={() => setFilterMenuVisible(!filterMenuVisible)}
                  className="px-4 text-blue-700 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  <span>Filters</span>
                </button>
                
                {filterMenuVisible && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={filters.role}
                          onChange={(e) => setFilters({...filters, role: e.target.value})}
                          className="w-full text-gray-700 border border-gray-300 rounded-md p-2 text-sm"
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Admin</option>
                          <option value="employee">Employee</option>
                          <option value="job_seeker">Job Seeker</option>
                          <option value="job_offer">Job Provider</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                          className="w-full text-gray-700 border border-gray-300 rounded-md p-2 text-sm"
                        >
                          <option value="">All Statuses</option>
                          <option value="Active">Active</option>
                          <option value="Non-Active">Inactive</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                            className="border text-gray-700 border-gray-300 rounded-md p-2 text-sm"
                            placeholder="From"
                          />
                          <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                            className="border text-gray-700 border-gray-300 rounded-md p-2 text-sm"
                            placeholder="To"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <button
                          onClick={resetFilters}
                          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          onClick={applyFilters}
                          className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                  className="px-4 py-2 border text-green-800 border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Export</span>
                </button>
                
                {downloadMenuVisible && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-1">
                    {Object.keys(handleDownload).map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          handleDownload[format]();
                          setDownloadMenuVisible(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table id="user-table" className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {filteredData.length === 0 && userData.length > 0 
                            ? "No users match your filters" 
                            : "No users found"}
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((user, index) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {(currentPage - 1) * usersPerPage + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone_number || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'employee' ? 'bg-indigo-100 text-indigo-800' :
                              user.role === 'job_seeker' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {getStatusDisplayName(user.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                            <div className="text-xs text-gray-400">
                              {new Date(user.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <Link
                                to={`/admin/editUser/${user.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Link>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between mt-4 px-2">
                <div className="flex items-center mb-4 md:mb-0">
                  <span className="text-sm text-gray-700 mr-2">Show</span>
                  <select
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border text-blue-700 border-gray-300 rounded-md px-2 py-1 text-sm "
                  >
                    {[5, 10, 25, 50, 100].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-blue-700 ml-2">entries</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-blue-700">
                    Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
                    {Math.min(currentPage * usersPerPage, filteredData.length)} of{' '}
                    {filteredData.length} entries
                  </span>
                </div>
                
                <div className="flex space-x-1 mt-4 md:mt-0">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border text-blue-700 border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border text-blue-700 border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="px-3 py-1 text-blue-700 border border-gray-300 rounded-md text-sm bg-gray-100">
                    {currentPage}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border text-blue-700 border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-blue-700 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {renderCharts()}
      </div>
    </div>
  );
}

export default Users;