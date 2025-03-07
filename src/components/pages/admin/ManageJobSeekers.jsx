/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
import JobSeekerFormModal from "./add_update_job_seeker_modal";
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
  Bar,
} from "recharts";
import {
  UserGroupIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// StatCards Component for Job Seekers
const StatCards = ({ jobSeekerData }) => {
  const stats = {
    totalJobSeekers: jobSeekerData.length,
    activeJobSeekers: jobSeekerData.filter(seeker => seeker.status === true).length,
    inactiveJobSeekers: jobSeekerData.filter(seeker => seeker.status === false).length,
    genderDistribution: {
      male: jobSeekerData.filter(seeker => seeker.gender === 'male').length,
      female: jobSeekerData.filter(seeker => seeker.gender === 'female').length,
      other: jobSeekerData.filter(seeker => seeker.gender === 'other').length
    },
    educationLevels: {
      none: jobSeekerData.filter(seeker => seeker.education_level === 'none').length,
      primary: jobSeekerData.filter(seeker => seeker.education_level === 'primary').length,
      secondary: jobSeekerData.filter(seeker => seeker.education_level === 'secondary').length,
      vocational: jobSeekerData.filter(seeker => seeker.education_level === 'vocational').length,
      bachelor: jobSeekerData.filter(seeker => seeker.education_level === 'bachelor').length,
      master: jobSeekerData.filter(seeker => seeker.education_level === 'master').length,
      phd: jobSeekerData.filter(seeker => seeker.education_level === 'phd').length
    },
    averageExperience: jobSeekerData.reduce((acc, seeker) => acc + seeker.experience, 0) /
      (jobSeekerData.length || 1)
  };

  const cards = [
    {
      title: "Total Job Seekers",
      value: stats.totalJobSeekers,
      icon: UsersIcon,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Active Job Seekers",
      value: stats.activeJobSeekers,
      icon: CheckCircleIcon,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Inactive Job Seekers",
      value: stats.inactiveJobSeekers,
      icon: XCircleIcon,
      color: "bg-red-500",
      textColor: "text-red-600"
    },
    {
      title: "Average Experience (Years)",
      value: stats.averageExperience.toFixed(1),
      icon: BriefcaseIcon,
      color: "bg-yellow-500",
      textColor: "text-yellow-600"
    },
    {
      title: "Male Job Seekers",
      value: stats.genderDistribution.male,
      icon: UserGroupIcon,
      color: "bg-indigo-500",
      textColor: "text-indigo-600"
    },
    {
      title: "Female Job Seekers",
      value: stats.genderDistribution.female,
      icon: UserGroupIcon,
      color: "bg-pink-500",
      textColor: "text-pink-600"
    },
    {
      title: "Higher Education",
      value: stats.educationLevels.bachelor + stats.educationLevels.master + stats.educationLevels.phd,
      icon: AcademicCapIcon,
      color: "bg-purple-500",
      textColor: "text-purple-600"
    },
    {
      title: "Resume Uploaded",
      value: jobSeekerData.filter(seeker => seeker.resume).length,
      icon: ClipboardDocumentListIcon,
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 border border-gray-200 transition-transform duration-300 hover:transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
            <div className={`${card.color} p-3 rounded-full bg-opacity-20`}>
              <card.icon className={`h-6 w-6 ${card.textColor}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className={`h-2 rounded-full ${card.color} bg-opacity-20`}>
              <div
                className={`h-2 rounded-full ${card.color}`}
                style={{ width: `${(card.value / (stats.totalJobSeekers || 1)) * 100}%` }}
              />
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
    'primary': 'Primary Education',
    'secondary': 'Secondary Education',
    'vocational': 'Vocational Training',
    'bachelor': 'Bachelor\'s Degree',
    'master': 'Master\'s Degree',
    'phd': 'PhD'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-800">Job Seeker Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Full Name</p>
            <p className="font-semibold text-gray-500">{`${jobSeeker.first_name} ${jobSeeker.middle_name ? jobSeeker.middle_name + ' ' : ''}${jobSeeker.last_name}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone Number</p>
            <p className="font-semibold text-gray-500">{jobSeeker.user?.phone_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-gray-500">{jobSeeker.user?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Gender</p>
            <p className="font-semibold capitalize text-gray-500">{jobSeeker.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Work Experience</p>
            <p className="font-semibold text-gray-500">{jobSeeker.experience} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Education Level</p>
            <p className="font-semibold text-gray-500">{educationLevelMap[jobSeeker.education_level]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Education Sector</p>
            <p className="font-semibold text-gray-500">{jobSeeker.education_sector || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-semibold ${jobSeeker.status ? 'text-green-600' : 'text-red-600'}`}>
              {jobSeeker.status ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Skills</p>
          <div className="flex flex-wrap gap-2">
            {jobSeeker.skills ?
              jobSeeker.skills.split(',').map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
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
              className="inline-block mt-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View Resume
            </a>
          ) : (
            <p className="text-gray-500">No resume uploaded</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Link
            to={`/admin/editJobSeeker/${jobSeeker.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Edit Profile
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
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

function Admin_Manage_JobSeekers() {
  const [jobSeekerData, setJobSeekerData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [downloadMenuVisible, setDownloadMenuVisible] = useState(false);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterEducation, setFilterEducation] = useState("all");
  // New state variables for the form modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [jobSeekerToEdit, setJobSeekerToEdit] = useState(null);
  const navigate = useNavigate();

  const COLORS = ['#0088FE', '#0E9F6E', '#1C64F2', '#5145CD', '#EC4899', '#8B5CF6', '#EF4444'];
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
    fetchJobSeekers();
  }, [navigate]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete this job seeker profile?")) return;
    try {
      await axios.delete(`https://anaweza-backend.up.railway.app/job_seeker/delete/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchJobSeekers();
      setMessage("Job seeker profile deleted successfully");
      setMessageType("success");
      setCurrentPage(1);
    } catch (err) {
      setMessage(err.response?.data.error || "An error occurred while deleting");
      setMessageType("error");
    }
  };



  // New function to open modal for creating a new job seeker
  const handleAddJobSeeker = () => {
    setJobSeekerToEdit(null);
    setIsFormModalOpen(true);
  };

  // New function to open modal for editing an existing job seeker
  const handleEditJobSeeker = (jobSeeker) => {
    setJobSeekerToEdit(jobSeeker);
    setIsFormModalOpen(true);
  };

  // New function to handle form submission success
  const handleFormSuccess = (data) => {
    fetchJobSeekers();
    setMessage(
      jobSeekerToEdit
        ? "Job seeker updated successfully"
        : "New job seeker created successfully"
    );
    setMessageType("success");
  };

  const handleDownload = {
    PDF: () => {
      const doc = new jsPDF();
      doc.autoTable({
        html: "#job-seeker-table",
        styles: { fillColor: [255, 255, 255] },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
      });
      doc.save("job-seekers.pdf");
    },
    Excel: () => {
      const data = jobSeekerData.map(seeker => ({
        ID: seeker.id,
        "First Name": seeker.first_name,
        "Last Name": seeker.last_name,
        "Phone": seeker.user?.phone_number || 'N/A',
        "Email": seeker.user?.email || 'N/A',
        "Gender": seeker.gender,
        "Experience (Years)": seeker.experience,
        "Education": seeker.education_level,
        "Status": seeker.status ? "Active" : "Inactive",
        "Registration Fee": seeker.registration_fee,
        "Renewal Fee": seeker.renewal_fee,
        "Created At": new Date(seeker.created_at).toLocaleDateString()
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(data),
        "Job Seekers"
      );
      XLSX.writeFile(workbook, "job-seekers.xlsx");
    },
    CSV: () => {
      const data = jobSeekerData.map(seeker => ({
        ID: seeker.id,
        "First Name": seeker.first_name,
        "Last Name": seeker.last_name,
        "Phone": seeker.user?.phone_number || 'N/A',
        "Email": seeker.user?.email || 'N/A',
        "Gender": seeker.gender,
        "Experience (Years)": seeker.experience,
        "Education": seeker.education_level,
        "Status": seeker.status ? "Active" : "Inactive",
        "Registration Fee": seeker.registration_fee,
        "Renewal Fee": seeker.renewal_fee,
        "Created At": new Date(seeker.created_at).toLocaleDateString()
      }));

      const headers = Object.keys(data[0] || {}).join(",");
      const csvContent =
        "data:text/csv;charset=utf-8," +
        headers +
        "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", "job-seekers.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  };

  const getEducationLevelDisplay = (level) => {
    const educationMap = {
      'none': 'No Formal Education',
      'primary': 'Primary',
      'secondary': 'Secondary',
      'vocational': 'Vocational',
      'bachelor': 'Bachelor\'s',
      'master': 'Master\'s',
      'phd': 'PhD'
    };
    return educationMap[level] || level;
  };

  const renderCharts = () => {
    if (!jobSeekerData.length) return null;

    // Gender distribution data
    const genderData = Object.entries({
      Male: jobSeekerData.filter(seeker => seeker.gender === 'male').length,
      Female: jobSeekerData.filter(seeker => seeker.gender === 'female').length,
      Other: jobSeekerData.filter(seeker => seeker.gender === 'other').length
    }).map(([name, value]) => ({ name, value }));

    // Education level distribution
    const educationData = Object.entries({
      'No Formal': jobSeekerData.filter(seeker => seeker.education_level === 'none').length,
      
      'Primary': jobSeekerData.filter(seeker => seeker.education_level === 'primary').length,
      'Ordinary Level': jobSeekerData.filter(seeker => seeker.education_level === 'ordinary_level').length,
      'Secondary': jobSeekerData.filter(seeker => seeker.education_level === 'secondary').length,
      'Vocational': jobSeekerData.filter(seeker => seeker.education_level === 'vocational').length,
      'Bachelor\'s': jobSeekerData.filter(seeker => seeker.education_level === 'bachelor').length,
      'Master\'s': jobSeekerData.filter(seeker => seeker.education_level === 'master').length,
      'PhD': jobSeekerData.filter(seeker => seeker.education_level === 'phd').length
    }).map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    // Experience distribution
    const experienceRanges = {
      '0-2': jobSeekerData.filter(seeker => seeker.experience >= 0 && seeker.experience <= 2).length,
      '3-5': jobSeekerData.filter(seeker => seeker.experience >= 3 && seeker.experience <= 5).length,
      '6-10': jobSeekerData.filter(seeker => seeker.experience >= 6 && seeker.experience <= 10).length,
      '11+': jobSeekerData.filter(seeker => seeker.experience > 10).length
    };

    const experienceData = Object.entries(experienceRanges)
      .map(([range, count]) => ({ range, count }));

    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <ErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-md col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-green-700">
              Gender Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Job Seekers`, 'Count']} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-md col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-green-700">
              Education Level Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={educationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {educationData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 2) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Job Seekers`, 'Count']} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="bg-white p-4 rounded-lg shadow-md col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-green-700">
              Years of Experience
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} Job Seekers`, 'Count']} />
                <Bar dataKey="count" name="Job Seekers" fill="#3B82F6">
                  {experienceData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 4) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ErrorBoundary>
      </div>
    );
  };

  const filteredData = jobSeekerData.filter((seeker) => {
    // Apply search query filter
    const searchMatch =
      seeker.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.user?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seeker.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seeker.skills && seeker.skills.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply status filter
    const statusMatch = filterStatus === "all" ||
      (filterStatus === "active" && seeker.status) ||
      (filterStatus === "inactive" && !seeker.status);

    // Apply gender filter
    const genderMatch = filterGender === "all" ||
      seeker.gender === filterGender;

    // Apply education filter
    const educationMatch = filterEducation === "all" ||
      seeker.education_level === filterEducation;

    return searchMatch && statusMatch && genderMatch && educationMatch;
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);  // Reset to first page when changing items per page
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="justify-center w-full px-4 md:px-12 ml-0 md:ml-4">
      <ErrorBoundary>
        <div className="p-2 md:p-4 justify-center">
          <h1 className="text-center text-green-700 font-bold text-xl md:text-2xl mb-6">
            Job Seekers Management
          </h1>

          {/* Stats Cards */}
          <StatCards jobSeekerData={jobSeekerData} />

          {message && (
            <div
              className={`text-center py-2 px-4 mb-4 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div className="w-full">
              {/* Action Buttons Row */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-auto">
                  <button
                    onClick={handleAddJobSeeker} // Updated to use the new modal function
                    className="py-2 px-4 bg-sky-900 text-white rounded hover:bg-black w-full md:w-auto"
                  >
                    + Add Job Seeker
                  </button>
                </div>

                <div className="relative w-full md:w-auto">
                  <button
                    onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                    className="py-2 bg-green-600 px-4 rounded text-white hover:bg-green-700 w-full md:w-auto"
                  >
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export
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
              </div>

              {/* Filters Row */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="w-full md:w-auto flex-grow">
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2 text-gray-700 border rounded w-full"
                  />
                </div>

                <div className="w-full md:w-auto">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 text-gray-700 border rounded w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="w-full md:w-auto">
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="px-4 py-2 text-gray-700 border rounded w-full"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="w-full md:w-auto">
                  <select
                    value={filterEducation}
                    onChange={(e) => setFilterEducation(e.target.value)}
                    className="px-4 py-2 text-gray-700 border rounded w-full"
                  >
                    <option value="all">All Education Levels</option>
                    <option value="none">No Formal Education</option>
                    <option value="primary">Primary Education</option>
                    <option value="ordinary_level">Ordinary Level</option>
                    <option value="secondary">Secondary Education</option>
                    <option value="vocational">Vocational Training</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>

              <div className="mb-4 text-right">
                <span className="font-bold text-black">
                  {filteredData.length}
                </span>

              </div>

              {/* Data Table */}
              <div className="w-full overflow-x-auto shadow-md rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-white uppercase bg-sky-900">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Experience</th>
                      <th className="px-4 py-3">Education</th>
                      <th className="px-4 py-3">Salary Range</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Registration Fee</th>
                      <th className="px-4 py-3">Reanual Fee</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((seeker) => (
                        <tr
                          key={seeker.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold">
                              <span className="text-gray-500">{`${seeker.first_name} ${seeker.last_name}`}</span>

                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              <span className="text-gray-400">
                                {seeker.gender}
                              </span>

                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-500">{seeker.user?.email || "N/A"}</div>
                            <div className="text-xs text-gray-500">
                              {seeker.user?.phone_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {seeker.experience} {seeker.experience === 1 ? "year" : "years"}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {getEducationLevelDisplay(seeker.education_level)}
                          </td>

                          <div className="text-xs text-gray-500 capitalize">
                              <span className="text-gray-400">
                                {seeker.salary_range || "N/A"}
                              </span>

                            </div>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${seeker.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {seeker.status ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-gray-500">{seeker.registration_fee || "N/A"}</div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="text-gray-500">{seeker.renewal_fee || "N/A"}</div>
                          </td>

                          
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedJobSeeker(seeker)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
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
                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                          No job seekers found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border rounded px-2 text-gray-500 py-1 text-sm"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span className="text-sm text-gray-700">entries</span>
                </div>

                <div className="flex justify-end">
                  <nav className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded ${currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-sky-900 text-white hover:bg-black"
                        }`}
                    >
                      Previous
                    </button>

                    {[...Array(pageCount).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => handlePageChange(number + 1)}
                        className={`px-3 py-1 rounded ${currentPage === number + 1
                          ? "bg-sky-900 text-white"
                          : "bg-white text-sky-900 border border-sky-900 hover:bg-gray-100"
                          }`}
                      >
                        {number + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
                      disabled={currentPage === pageCount || pageCount === 0}
                      className={`px-3 py-1 rounded ${currentPage === pageCount || pageCount === 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-sky-900 text-white hover:bg-black"
                        }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="mt-8 mb-4">
            <div className="relative">
              <button
                onClick={() => setDownloadMenuVisible(!downloadMenuVisible)}
                className="bg-sky-900 text-white py-2 px-4 rounded-md hover:bg-black flex items-center"
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export Data
              </button>
              {downloadMenuVisible && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        const doc = new jsPDF();
                        doc.autoTable({
                          head: [["Name", "Gender", "Contact", "Experience", "Education", "Salary Range", "Status"]],
                          body: filteredData.map((seeker) => [
                            `${seeker.first_name} ${seeker.last_name}`,
                            seeker.gender,
                            `${seeker.user?.email || "N/A"}\n${seeker.user?.phone_number || "N/A"}`,
                            `${seeker.experience} ${seeker.experience === 1 ? "year" : "years"}`,
                            getEducationLevelDisplay(seeker.education_level),
                            seeker.salary_range || "N/A",
                            seeker.status ? "Active" : "Inactive",
                          ]),
                        });
                        doc.save("job_seekers.pdf");
                        setDownloadMenuVisible(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => {
                        const worksheet = XLSX.utils.json_to_sheet(
                          filteredData.map((seeker) => ({
                            "First Name": seeker.first_name,
                            "Last Name": seeker.last_name,
                            "Gender": seeker.gender,
                            "Email": seeker.user?.email || "N/A",
                            "Phone": seeker.user?.phone_number || "N/A",
                            "Experience (Years)": seeker.experience,
                            "Education Level": getEducationLevelDisplay(seeker.education_level),
                            "Skills": seeker.skills || "N/A",
                            "salary_range": seeker.salary_range || "N/A",
                            "Status": seeker.status ? "Active" : "Inactive",
                            "Registration fee": seeker.registration_fee || "N/A",
                            "Renewal fee": seeker.renewal_fee || "N/A",
                          }))
                        );
                        const workbook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, "Job Seekers");
                        XLSX.writeFile(workbook, "job_seekers.xlsx");
                        setDownloadMenuVisible(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Render Charts Section */}
          {jobSeekerData.length > 0 && renderCharts()}

          {/* Job Seeker Details Modal */}
          {selectedJobSeeker && (
            <JobSeekerDetailsModal
              jobSeeker={selectedJobSeeker}
              onClose={() => setSelectedJobSeeker(null)}
            />
          )}


          {/* Add the Job Seeker Form Modal */}
          <div className="py-4">
            <JobSeekerFormModal
              isOpen={isFormModalOpen}
              onClose={() => setIsFormModalOpen(false)}
              jobSeeker={jobSeekerToEdit}
              onSuccess={handleFormSuccess}
              token={token}
            />
          </div>

        </div>
      </ErrorBoundary>)
    </div>
  )
}

export default Admin_Manage_JobSeekers;