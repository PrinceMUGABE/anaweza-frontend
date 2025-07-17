/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload, faEye, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import JobSeekerFormModal from "./add_update_job_seeker_modal";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  UserIcon
} from "@heroicons/react/24/outline";

// StatCards Component for Job Seekers
const StatCards = ({ jobSeekerData }) => {
  const stats = {
    totalJobSeekers: jobSeekerData.length,
    activeJobSeekers: jobSeekerData.filter(seeker => seeker.status).length,
    inactiveJobSeekers: jobSeekerData.filter(seeker => !seeker.status).length,
    genderDistribution: {
      male: jobSeekerData.filter(seeker => seeker.gender === 'male').length,
      female: jobSeekerData.filter(seeker => seeker.gender === 'female').length,
      other: jobSeekerData.filter(seeker => seeker.gender === 'other').length
    },
    educationLevels: {
      none: jobSeekerData.filter(seeker => seeker.education_level === 'none').length,
      primary: jobSeekerData.filter(seeker => seeker.education_level === 'primary').length,
      ordinary_level: jobSeekerData.filter(seeker => seeker.education_level === 'ordinary_level').length,
      secondary: jobSeekerData.filter(seeker => seeker.education_level === 'secondary').length,
      vocational: jobSeekerData.filter(seeker => seeker.education_level === 'vocational').length,
      advanced_diploma: jobSeekerData.filter(seeker => seeker.education_level === 'advanced_diploma').length,
      bachelor: jobSeekerData.filter(seeker => seeker.education_level === 'bachelor').length,
      master: jobSeekerData.filter(seeker => seeker.education_level === 'master').length,
      phd: jobSeekerData.filter(seeker => seeker.education_level === 'phd').length
    },
    averageExperience: jobSeekerData.reduce((acc, seeker) => acc + seeker.experience, 0) / (jobSeekerData.length || 1)
  };

  const cards = [
    { title: "Total", value: stats.totalJobSeekers, icon: UsersIcon, color: "bg-blue-500" },
    { title: "Active", value: stats.activeJobSeekers, icon: CheckCircleIcon, color: "bg-green-500" },
    { title: "Inactive", value: stats.inactiveJobSeekers, icon: XCircleIcon, color: "bg-red-500" },
    { title: "Avg Experience", value: stats.averageExperience.toFixed(1), icon: BriefcaseIcon, color: "bg-yellow-500" },
    { title: "Male", value: stats.genderDistribution.male, icon: UserIcon, color: "bg-indigo-500" },
    { title: "Female", value: stats.genderDistribution.female, icon: UserIcon, color: "bg-pink-500" },
    { title: "Higher Ed", value: stats.educationLevels.bachelor + stats.educationLevels.master + stats.educationLevels.phd, icon: AcademicCapIcon, color: "bg-purple-500" },
    { title: "Resumes", value: jobSeekerData.filter(seeker => seeker.resume).length, icon: DocumentTextIcon, color: "bg-emerald-500" }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${card.color} bg-opacity-10 mr-3`}>
              <card.icon className={`h-5 w-5 ${card.color.replace('bg', 'text')}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.title}</p>
              <p className="font-bold text-lg">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// JobSeekerDetails Modal Component
const JobSeekerDetailsModal = ({ jobSeeker, onClose }) => {
  if (!jobSeeker) return null;

  const educationLevelMap = {
    'none': 'No Formal Education',
    'primary': 'Primary',
    'ordinary_level': 'Ordinary Level',
    'secondary': 'Secondary',
    'vocational': 'Vocational',
    'advanced_diploma': 'Advanced Diploma',
    'bachelor': 'Bachelor\'s',
    'master': 'Master\'s',
    'phd': 'PhD'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">Job Seeker Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-700">{`${jobSeeker.first_name} ${jobSeeker.middle_name || ''} ${jobSeeker.last_name}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-700">{jobSeeker.custom_user?.phone_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-700">{jobSeeker.custom_user?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium text-gray-700 capitalize">{jobSeeker.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium text-gray-700">{jobSeeker.experience} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Education</p>
              <p className="font-medium text-gray-700">{educationLevelMap[jobSeeker.education_level]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Education Sector</p>
              <p className="font-medium text-gray-700">{jobSeeker.education_sector || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`font-medium ${jobSeeker.status ? 'text-green-600' : 'text-red-600'}`}>
                {jobSeeker.status ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {jobSeeker.skills ? 
                jobSeeker.skills.split(',').map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                    {skill.trim()}
                  </span>
                )) : 
                <p className="text-gray-500">No skills listed</p>
              }
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">Resume</p>
            {jobSeeker.resume ? (
              <a
                href={`https://anaweza-backend.up.railway.app${jobSeeker.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Download Resume
              </a>
            ) : (
              <p className="text-gray-500">No resume uploaded</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

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
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Admin_Manage_JobSeekers() {
  const [jobSeekerData, setJobSeekerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [jobSeekerToEdit, setJobSeekerToEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    gender: "all",
    education: "all",
    experienceMin: "",
    experienceMax: "",
    salaryMin: "",
    salaryMax: ""
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B'];

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData || !JSON.parse(storedUserData).access_token) {
      navigate("/login");
      return;
    }
    fetchJobSeekers();
  }, [navigate]);

  useEffect(() => {
    filterData();
  }, [jobSeekerData, searchQuery, filters]);

  const fetchJobSeekers = async () => {
    try {
      const res = await axios.get("https://anaweza-backend.up.railway.app/job_seeker/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobSeekerData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching job seekers:", err);
      setMessage("Failed to load job seekers data");
      setMessageType("error");
    }
  };

  const filterData = () => {
    let result = jobSeekerData.filter(seeker => {
      // Search query filter
      const matchesSearch = 
        `${seeker.first_name} ${seeker.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seeker.custom_user?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seeker.custom_user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seeker.skills?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = 
        filters.status === "all" || 
        (filters.status === "active" && seeker.status) || 
        (filters.status === "inactive" && !seeker.status);

      // Gender filter
      const matchesGender = 
        filters.gender === "all" || 
        seeker.gender === filters.gender;

      // Education filter
      const matchesEducation = 
        filters.education === "all" || 
        seeker.education_level === filters.education;

      // Experience filter
      const matchesExperience = 
        (filters.experienceMin === "" || seeker.experience >= Number(filters.experienceMin)) &&
        (filters.experienceMax === "" || seeker.experience <= Number(filters.experienceMax));

      // Salary filter (assuming salary_range is in format "1000-2000")
      const matchesSalary = () => {
        if (!seeker.salary_range) return true;
        const [min, max] = seeker.salary_range.split('-').map(Number);
        return (
          (filters.salaryMin === "" || max >= Number(filters.salaryMin)) &&
          (filters.salaryMax === "" || min <= Number(filters.salaryMax))
        );
      };

      return matchesSearch && matchesStatus && matchesGender && 
             matchesEducation && matchesExperience && matchesSalary();
    });

    setFilteredData(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job seeker?")) return;
    try {
      await axios.delete(`https://anaweza-backend.up.railway.app/job_seeker/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchJobSeekers();
      setMessage("Job seeker deleted successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred while deleting");
      setMessageType("error");
    }
  };

  const handleAddJobSeeker = () => {
    setJobSeekerToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditJobSeeker = (jobSeeker) => {
    setJobSeekerToEdit(jobSeeker);
    setIsFormModalOpen(true);
  };

  const handleFormSuccess = () => {
    fetchJobSeekers();
    setMessage(jobSeekerToEdit ? "Job seeker updated successfully" : "New job seeker created successfully");
    setMessageType("success");
  };

  const exportData = (format) => {
    const data = filteredData.map(seeker => ({
      "First Name": seeker.first_name,
      "Last Name": seeker.last_name,
      "Phone": seeker.custom_user?.phone_number || 'N/A',
      "Email": seeker.custom_user?.email || 'N/A',
      "Gender": seeker.gender,
      "Experience": `${seeker.experience} years`,
      "Education": getEducationLevelDisplay(seeker.education_level),
      "Skills": seeker.skills || 'N/A',
      "Salary Range": seeker.salary_range || 'N/A',
      "Status": seeker.status ? "Active" : "Inactive",
      "Registration Fee": seeker.registration_fee || 'N/A',
      "Renewal Fee": seeker.renewal_fee || 'N/A'
    }));

    if (format === 'PDF') {
      const doc = new jsPDF();
      doc.autoTable({
        head: [Object.keys(data[0] || {})],
        body: data.map(item => Object.values(item)),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
      doc.save("job_seekers.pdf");
    } else if (format === 'Excel') {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Job Seekers");
      XLSX.writeFile(workbook, "job_seekers.xlsx");
    } else if (format === 'CSV') {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "job_seekers.csv";
      link.click();
    }
  };

  const getEducationLevelDisplay = (level) => {
    const educationMap = {
      'none': 'No Formal',
      'primary': 'Primary',
      'ordinary_level': 'Ordinary Level',
      'secondary': 'Secondary',
      'vocational': 'Vocational',
      'advanced_diploma': 'Advanced Diploma',
      'bachelor': 'Bachelor\'s',
      'master': 'Master\'s',
      'phd': 'PhD'
    };
    return educationMap[level] || level;
  };

  const renderCharts = () => {
    if (filteredData.length === 0) return null;

    // Gender distribution data
    const genderData = [
      { name: 'Male', value: filteredData.filter(s => s.gender === 'male').length },
      { name: 'Female', value: filteredData.filter(s => s.gender === 'female').length },
      { name: 'Other', value: filteredData.filter(s => s.gender === 'other').length }
    ].filter(item => item.value > 0);

    // Education level distribution
    const educationData = [
      { name: 'No Formal', value: filteredData.filter(s => s.education_level === 'none').length },
      { name: 'Primary', value: filteredData.filter(s => s.education_level === 'primary').length },
      { name: 'Ordinary', value: filteredData.filter(s => s.education_level === 'ordinary_level').length },
      { name: 'Secondary', value: filteredData.filter(s => s.education_level === 'secondary').length },
      { name: 'Vocational', value: filteredData.filter(s => s.education_level === 'vocational').length },
      { name: 'Advanced', value: filteredData.filter(s => s.education_level === 'advanced_diploma').length },
      { name: 'Bachelor', value: filteredData.filter(s => s.education_level === 'bachelor').length },
      { name: 'Master', value: filteredData.filter(s => s.education_level === 'master').length },
      { name: 'PhD', value: filteredData.filter(s => s.education_level === 'phd').length }
    ].filter(item => item.value > 0);

    // Experience distribution
    const experienceData = [
      { range: '0-2', count: filteredData.filter(s => s.experience >= 0 && s.experience <= 2).length },
      { range: '3-5', count: filteredData.filter(s => s.experience >= 3 && s.experience <= 5).length },
      { range: '6-10', count: filteredData.filter(s => s.experience >= 6 && s.experience <= 10).length },
      { range: '11+', count: filteredData.filter(s => s.experience > 10).length }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {genderData.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-2">Gender Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} job seekers`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {educationData.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-2">Education Levels</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={educationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {educationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} job seekers`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold mb-2">Years of Experience</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={experienceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} job seekers`, 'Count']} />
              <Bar dataKey="count" name="Job Seekers" fill="#3B82F6">
                {experienceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4">
      <ErrorBoundary>
        <div className="bg-white rounded-lg shadow p-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Job Seekers Management</h1>

          {/* Stats Cards */}
          <StatCards jobSeekerData={filteredData} />

          {/* Message Alert */}
          {message && (
            <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message}
            </div>
          )}

          {/* Search and Action Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, email, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-gray-700 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faFilter} />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <button
                onClick={handleAddJobSeeker}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Add Job Seeker
              </button>

              <div className="relative">
                <button
                  onClick={() => exportData('Excel')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-lg z-10 hidden group-hover:block">
                  <button
                    onClick={() => exportData('Excel')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => exportData('PDF')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportData('CSV')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full border text-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  className="w-full text-gray-700 border rounded-lg px-3 py-2"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <select
                  value={filters.education}
                  onChange={(e) => setFilters({...filters, education: e.target.value})}
                  className="w-full text-gray-700 border rounded-lg px-3 py-2"
                >
                  <option value="all">All Education Levels</option>
                  <option value="none">No Formal</option>
                  <option value="primary">Primary</option>
                  <option value="ordinary_level">Ordinary Level</option>
                  <option value="secondary">Secondary</option>
                  <option value="vocational">Vocational</option>
                  <option value="advanced_diploma">Advanced Diploma</option>
                  <option value="bachelor">Bachelor's</option>
                  <option value="master">Master's</option>
                  <option value="phd">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.experienceMin}
                    onChange={(e) => setFilters({...filters, experienceMin: e.target.value})}
                    className="w-1/2 text-gray-700 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.experienceMax}
                    onChange={(e) => setFilters({...filters, experienceMax: e.target.value})}
                    className="w-1/2 text-gray-700 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) => setFilters({...filters, salaryMin: e.target.value})}
                    className="w-1/2 text-gray-700 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) => setFilters({...filters, salaryMax: e.target.value})}
                    className="w-1/2 text-gray-700 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-2 text-sm text-gray-600">
            Showing {filteredData.length === 0 ? 0 : indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} job seekers
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((seeker) => (
                    <tr key={seeker.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{seeker.first_name} {seeker.last_name}</div>
                        <div className="text-xs text-gray-500 capitalize">{seeker.gender}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{seeker.custom_user?.email || "N/A"}</div>
                        <div className="text-xs text-gray-500">{seeker.custom_user?.phone_number || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{seeker.experience} {seeker.experience === 1 ? "year" : "years"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{getEducationLevelDisplay(seeker.education_level)}</div>
                        <div className="text-xs text-gray-500">{seeker.education_sector || ""}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-gray-900">{seeker.salary_range || "N/A"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${seeker.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {seeker.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedJobSeeker(seeker)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            onClick={() => handleEditJobSeeker(seeker)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDelete(seeker.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                      No job seekers found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {[5, 10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
                  let pageNum;
                  if (pageCount <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pageCount - 2) {
                    pageNum = pageCount - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${currentPage === pageNum ? "bg-blue-700 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageCount}
                  className={`px-3 py-1 rounded ${currentPage === pageCount ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pageCount)}
                  disabled={currentPage === pageCount}
                  className={`px-3 py-1 rounded ${currentPage === pageCount ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Last
                </button>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {renderCharts()}

          {/* Job Seeker Details Modal */}
          {selectedJobSeeker && (
            <JobSeekerDetailsModal
              jobSeeker={selectedJobSeeker}
              onClose={() => setSelectedJobSeeker(null)}
            />
          )}

          {/* Job Seeker Form Modal */}
          <JobSeekerFormModal
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            jobSeeker={jobSeekerToEdit}
            onSuccess={handleFormSuccess}
            token={token}
          />
        </div>
      </ErrorBoundary>
    </div>
  );
}

export default Admin_Manage_JobSeekers;