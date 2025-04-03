/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Filter, Search, ChevronLeft, ChevronRight, Calendar, AlertCircle, X, MapPin, Clock, Briefcase, ListChecks, DollarSign, Award, UserCircle, CheckCircle, Upload, ChevronDown } from "lucide-react";
import axios from "axios";

const BASE_URL = "https://anaweza-backend.up.railway.app/application";

function Admin_Job_Applications() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Changed default to 10 for table view

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // all, month, week

  // Modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState("");
  const [statusFeedback, setStatusFeedback] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);

  // Add this at the beginning of your component after the state declarations:
// useEffect(() => {
//   // Initialize filteredApplications when applications changes
//   if (Array.isArray(applications)) {
//     setFilteredApplications([...applications]);
//   } else {
//     setFilteredApplications([]);
//   }
// }, [applications]);



// Fix 4: Update the fetchApplications call in the useEffect to ensure it runs on component mount
useEffect(() => {
  fetchApplications();
}, []); // Empty dependency array to ensure it only runs on mount

// Fix 5: Add an additional useEffect to reset filtering when statusFilter changes
useEffect(() => {
  if (statusFilter !== "all") {
    fetchApplications();
  }
}, [statusFilter]);


  // Fetch applications
  // Fix 1: Modify the fetchApplications function to better handle the response
const fetchApplications = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BASE_URL}/applications/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Safely extract results and ensure it's always an array
    const results = response.data?.results || [];
    
    console.log("Retrieved applications: ", response.data);
    setApplications(results);
    // Don't set filteredApplications here - let the useEffect handle it
    setLoading(false);
  } catch (err) {
    console.error("Error fetching applications:", err);
    setError(err.response?.data?.error || "Failed to load applications");
    setApplications([]);
    setLoading(false);
  }
};

  // Update application status
  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return;

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/${selectedApplication.id}/status/`,
        {
          status: newStatus,
          feedback: statusFeedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the application status locally
      const updatedApplications = applications.map(app =>
        app.id === selectedApplication.id ? {
          ...app,
          status: newStatus,
          feedback: statusFeedback,
          reviewed_at: new Date().toISOString()
        } : app
      );

      setApplications(updatedApplications);

      // Update the selected application in the modal
      setSelectedApplication({
        ...selectedApplication,
        status: newStatus,
        feedback: statusFeedback,
        reviewed_at: new Date().toISOString()
      });

      setUpdatingStatus(false);
      alert("Application status updated successfully");

      // Reset the form
      setNewStatus("");
      setStatusFeedback("");
    } catch (err) {
      console.error("Error updating application status:", err);
      alert(err.response?.data?.error || "Failed to update application status");
      setUpdatingStatus(false);
    }
  };

  // Withdraw an application
  const handleWithdraw = async (applicationId) => {
    if (window.confirm("Are you sure you want to withdraw this application?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${BASE_URL}/withdraw/${applicationId}/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the application status locally
        const updatedApplications = applications.map(app =>
          app.id === applicationId ? { ...app, status: "withdrawn" } : app
        );

        setApplications(updatedApplications);

        // If we're withdrawing the currently viewed application, update it in the modal too
        if (selectedApplication && selectedApplication.id === applicationId) {
          setSelectedApplication({ ...selectedApplication, status: "withdrawn" });
        }

        alert("Application withdrawn successfully");
      } catch (err) {
        console.error("Error withdrawing application:", err);
        alert(err.response?.data?.error || "Failed to withdraw application");
      }
    }
  };

  // Open application details modal
  const openApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);

    // Initialize the new status with the current status
    setNewStatus(application.status);
  };

  // Apply filters
  // In your useEffect for filtering applications
 // Fix 2: Ensure proper dependency tracking in the useEffect for filtering
// This useEffect should run whenever applications, statusFilter, searchTerm or timeFilter changes
useEffect(() => {
  if (!Array.isArray(applications) || applications.length === 0) {
    setFilteredApplications([]);
    return;
  }

  let filtered = [...applications];

  // Apply status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter(app => app && app.status === statusFilter);
  }

  // Apply search filter with null checks
  if (searchTerm) {
    filtered = filtered.filter(app =>
      app && (
        (app.job_offer?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.job_offer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.job_seeker?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.job_seeker?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.user?.phone_number?.includes(searchTerm))
      )
    );
  }

  // Apply time filter
  if (timeFilter !== "all") {
    const now = new Date();
    let timeLimit;

    if (timeFilter === "month") {
      timeLimit = new Date(now);
      timeLimit.setDate(now.getDate() - 30);
    } else if (timeFilter === "week") {
      timeLimit = new Date(now);
      timeLimit.setDate(now.getDate() - 7);
    }

    filtered = filtered.filter(app => {
      if (!app || !app.applied_at) return false;
      const appliedDate = new Date(app.applied_at);
      return appliedDate >= timeLimit;
    });
  }

  setFilteredApplications(filtered);
}, [applications, statusFilter, searchTerm, timeFilter]); // Ensure all dependencies are listed


  // Fetch applications on component mount and when filters change
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);


  

  // Calculate pagination
// Then modify the pagination section:
// Calculate pagination with safeguards
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const safeFilteredApplications = Array.isArray(filteredApplications) ? filteredApplications : [];
const currentItems = safeFilteredApplications.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(safeFilteredApplications.length / itemsPerPage);


  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewing": return "bg-blue-100 text-blue-800";
      case "shortlisted": return "bg-purple-100 text-purple-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "withdrawn": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-500">Loading job applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 p-4 rounded-lg text-red-700 max-w-md">
          <AlertCircle className="inline mr-2" size={20} />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }


  {/* Add these functions to handle status changes */ }
  // Add this to your imports
  // import { ChevronDown } from "lucide-react";

  // Add this state


  // Add this function to handle status change
  // Add this state to your component

  // Add this function to handle status change
  const handleStatusChange = async () => {
    if (!newStatus || newStatus === selectedApplication.status) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${BASE_URL}/${selectedApplication.id}/status/`,
        {
          status: newStatus,
          feedback: statusFeedback
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the application status locally
      const updatedApplications = applications.map(app =>
        app.id === selectedApplication.id ? {
          ...app,
          status: newStatus,
          feedback: statusFeedback,
          reviewed_at: new Date().toISOString()
        } : app
      );

      setApplications(updatedApplications);
      setSelectedApplication({
        ...selectedApplication,
        status: newStatus,
        feedback: statusFeedback,
        reviewed_at: new Date().toISOString()
      });

      alert("Application status updated successfully");

      // Reset the form fields but not the current newStatus
      setStatusFeedback("");
    } catch (err) {
      console.error("Error updating application status:", err);
      alert(err.response?.data?.error || "Failed to update application status");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-700">Manage Job Applications</h1>

      {/* Filters and Search */}
      <div className="bg-white p-4 mb-6 rounded-lg shadow flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center">
            <Filter className="mr-2" size={18} />
            <select
              className="border text-gray-500 rounded-md px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>

          {/* Time Filter */}
          <div className="flex items-center">
            <Calendar className="mr-2" size={18} />
            <select
              className="border text-gray-500 rounded-md px-2 py-1"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="month">Last 30 Days</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>

          {/* Items Per Page */}
          <div className="flex items-center">
            <span className="mr-2">Show:</span>
            <select
              className="border text-gray-500 rounded-md px-2 py-1"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            className="border text-gray-500 rounded-md pl-8 pr-4 py-1 w-full md:w-64"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Applications Table */}

      {!Array.isArray(currentItems) || currentItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <BriefcaseBusiness size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {applications.length > 0
              ? "Try adjusting your filters to see more results."
              : ""}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.job_offer.title}</div>
                      <div className="text-sm text-gray-500">{application.job_offer.job_category?.name || "Not specified"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.job_offer.company_name || "Individual"}</div>
                      <div className="text-sm text-gray-500">{application.job_offer.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.applied_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {application.job_seeker ?
                          `${application.job_seeker.first_name} ${application.job_seeker.last_name}` :
                          application.user.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        onClick={() => openApplicationDetails(application)}
                      >
                        View
                      </button>
                      {!["accepted", "rejected", "withdrawn"].includes(application.status) && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleWithdraw(application.id)}
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>

        </div>
      )}

      {/* Pagination Controls */}
      {Array.isArray(filteredApplications) && filteredApplications.length > 0 && (
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} applications
          </div>

          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page numbers - show current, first, last, and adjacent pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .reduce((acc, page, i, arr) => {
                if (i > 0 && arr[i - 1] !== page - 1) {
                  acc.push('...');
                }
                acc.push(page);
                return acc;
              }, [])
              .map((page, i) =>
                page === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-3 py-1">...</span>
                ) : (
                  <button
                    key={page}
                    className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )
            }

            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Job Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Job Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {selectedApplication.job_offer.title}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Location</p>
                            <p className="text-gray-600">{selectedApplication.job_offer.location || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Clock className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Job Type</p>
                            <p className="text-gray-600">{selectedApplication.job_offer?.job_type?.name || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Briefcase className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Company</p>
                            <p className="text-gray-600">{selectedApplication.job_offer.company_name || "Individual Employer"}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <ListChecks className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Category</p>
                            <p className="text-gray-600">{selectedApplication.job_offer?.job_category?.name || "Not specified"}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <DollarSign className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Salary</p>
                            <p className="text-gray-600">
                              {selectedApplication.job_offer.salary_range
                                ? selectedApplication.job_offer.salary_range
                                : "Not disclosed"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Award className="text-gray-500 mt-0.5" size={18} />
                          <div>
                            <p className="font-medium text-gray-700">Experience Required</p>
                            <p className="text-gray-600">
                              {selectedApplication.job_offer.experience_required
                                ? `${selectedApplication.job_offer.experience_required} years`
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicant Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Applicant Information</h3>

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Applicant Picture */}
                  <div className="w-full md:w-1/4 flex justify-center">
                    {selectedApplication.user.profile_picture ? (
                      <img
                        src={selectedApplication.user.profile_picture}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="text-gray-400" size={64} />
                      </div>
                    )}
                  </div>

                  {/* Applicant Details */}
                  <div className="w-full md:w-3/4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.job_seeker && (
                        <>
                          <div>
                            <p className="font-medium text-gray-700">Full Name</p>
                            <p className="text-gray-700">
                              {`${selectedApplication.job_seeker.first_name} ${selectedApplication.job_seeker.middle_name || ''} ${selectedApplication.job_seeker.last_name}`}
                            </p>
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">Gender</p>
                            <p className="text-gray-700">{selectedApplication.job_seeker.gender}</p>
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">Education Level</p>
                            <p className="text-gray-700">{selectedApplication.job_seeker.education_level}</p>
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">Field of Study</p>
                            <p className="text-gray-700">{selectedApplication.job_seeker.education_sector || "Not specified"}</p>
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">Expected Salaray Range</p>
                            <p className="text-gray-700">{selectedApplication.job_seeker.salary_range || "Not specified"}</p>
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">Experience</p>
                            <p className="text-gray-700">{selectedApplication.job_seeker.experience} years</p>
                          </div>



                          <div>
                            <p className="font-medium text-gray-700">Job Seeker Status</p>
                            <p className="text-gray-700">
                              {selectedApplication.job_seeker?.status ? "Active" : "Non-active"}
                            </p>
                          </div>


                          <div>
                            <p className="font-medium text-gray-700">Location</p>
                            <p className="text-gray-700">
                              {selectedApplication.job_seeker.district && selectedApplication.job_seeker.sector
                                ? `${selectedApplication.job_seeker.sector}, ${selectedApplication.job_seeker.district}`
                                : "Not specified"}
                            </p>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="font-medium text-gray-700">Contact</p>
                        <p className="text-gray-700">{selectedApplication.user.phone_number}</p>
                      </div>

                      <div>
                        <p className="font-medium text-gray-700">Email</p>
                        <p className="text-gray-700">{selectedApplication.user.email || "Not provided"}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    {selectedApplication.job_seeker?.skills && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-1">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.job_seeker.skills.split(',').map((skill, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Application Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-700">Applied On</p>
                      <p className="text-gray-600">{formatDate(selectedApplication.applied_at)}</p>
                    </div>

                    <div>
                      <p className="font-medium text-gray-700">Current Status</p>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      </span>
                    </div>

                    {selectedApplication.reviewed_at && (
                      <div>
                        <p className="font-medium text-gray-700">Last Reviewed</p>
                        <p className="text-gray-600">{formatDate(selectedApplication.reviewed_at)}</p>
                      </div>
                    )}

                    {selectedApplication.feedback && (
                      <div className="col-span-2">
                        <p className="font-medium text-gray-700">Feedback</p>
                        <p className="text-gray-600">{selectedApplication.feedback}</p>
                      </div>
                    )}
                  </div>

                  {/* Resume or CV */}
                  {selectedApplication.resume_url && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2">Resume/CV</p>
                      <a
                        href={selectedApplication.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        <Upload className="mr-2" size={16} />
                        View Resume
                      </a>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {selectedApplication.cover_letter && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-700 mb-2">Cover Letter</p>
                      <div className="bg-white p-4 rounded border">
                        <p className="text-gray-700 whitespace-pre-line">{selectedApplication.cover_letter}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Update Application Status */}
              {!["withdrawn"].includes(selectedApplication.status) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Application Status</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Status
                        </label>
                        <select
                          className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2"
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                        >
                          <option value="">Select status</option>
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback (optional)
                        </label>
                        <textarea
                          className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2"
                          rows={3}
                          value={statusFeedback}
                          onChange={(e) => setStatusFeedback(e.target.value)}
                          placeholder="Provide feedback to the applicant regarding this status change"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={updateApplicationStatus}
                        disabled={!newStatus || updatingStatus}
                      >
                        {updatingStatus ? (
                          <>
                            <span className="mr-2">Updating...</span>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2" size={16} />
                            Update Status
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer - Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {/* Status Change Dropdown */}
                <div className="relative">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center"
                    onClick={() => setIsChangeStatusOpen(!isChangeStatusOpen)}
                  >
                    Change Status
                    <ChevronDown className="ml-2" size={16} />
                  </button>

                  {isChangeStatusOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      {["pending", "reviewing", "shortlisted", "accepted", "rejected"].map((status) => (
                        <button
                          key={status}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setNewStatus(status);
                            setIsChangeStatusOpen(false);

                            // Show confirmation dialog before changing status
                            if (window.confirm(`Are you sure you want to change status to ${status.charAt(0).toUpperCase() + status.slice(1)}?`)) {
                              handleStatusChange();
                            }
                          }}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!["accepted", "rejected", "withdrawn"].includes(selectedApplication.status) && (
                  <button
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    onClick={() => {
                      setShowModal(false);
                      handleWithdraw(selectedApplication.id);
                    }}
                  >
                    Withdraw Application
                  </button>
                )}

                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}

export default Admin_Job_Applications;