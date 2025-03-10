/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Filter, Search, ChevronLeft, ChevronRight, Calendar, AlertCircle, X, MapPin, Clock, Briefcase, ListChecks, DollarSign, Award } from "lucide-react";
import axios from "axios";

const BASE_URL = "https://anaweza-backend.up.railway.app/application";

function JobSeekerHome() {
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all"); // all, month, week

  // Modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/my-applications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });

      setApplications(response.data.results);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.response?.data?.error || "Failed to load applications");
      setLoading(false);
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
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...applications];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.job_offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job_offer.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      let timeLimit;

      if (timeFilter === "month") {
        // Set to 30 days ago
        timeLimit = new Date(now);
        timeLimit.setDate(now.getDate() - 30);
      } else if (timeFilter === "week") {
        // Set to 7 days ago
        timeLimit = new Date(now);
        timeLimit.setDate(now.getDate() - 7);
      }

      filtered = filtered.filter(app => {
        const appliedDate = new Date(app.applied_at);
        return appliedDate >= timeLimit;
      });
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, searchTerm, timeFilter]);

  // Fetch applications on component mount and when filters change
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

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
          <p className="mt-2 text-gray-500">Loading your applications...</p>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-700">My Job Applications</h1>

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
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={30}>30</option>
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
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-2 text-gray-400" size={16} />
        </div>
      </div>

      {/* Applications List */}
      {currentItems.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-700 text-lg truncate" title={application.job_offer.title}>
                    {application.job_offer.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-1 text-blue-700 rounded-full ${getStatusColor(application.status)}`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">
                  {application.job_offer.company_name}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar size={14} className="mr-1" />
                  <span>Applied: {formatDate(application.applied_at)}</span>
                </div>

                {application.feedback && (
                  <div className="bg-gray-50 p-2 rounded mb-4 text-sm">
                    <p className="font-semibold text-gray-500 mb-1">Feedback:</p>
                    <p className="text-gray-500">{application.feedback}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 border-t flex justify-between">
                <button
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => openApplicationDetails(application)}
                >
                  View Details
                </button>

                {/* Only show withdraw button for applications that can be withdrawn */}
                {!["accepted", "rejected", "withdrawn"].includes(application.status) && (
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                    onClick={() => handleWithdraw(application.id)}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredApplications.length > 0 && (
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-auto">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-700">Application Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Application Status */}
              <div className="mb-6 flex justify-between items-center">
                <span
                  className={`text-sm px-3 py-1 text-blue-700 rounded-full ${getStatusColor(selectedApplication.status)}`}
                >
                  Status: {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Applied on {formatDate(selectedApplication.applied_at)}
                </span>
              </div>

              {/* Job Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg text-gray-700 font-semibold mb-4">{selectedApplication.job_offer.title}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <BriefcaseBusiness className="mr-2 text-blue-700 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Company</p>
                      <p className="text-gray-700">{selectedApplication.job_offer?.company_name || "Individual"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="mr-2 mt-1 text-blue-700 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Location</p>
                      <p className="text-gray-700">{selectedApplication.job_offer.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Briefcase className="mr-2 mt-1 text-blue-700 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Job Type</p>
                      <p className="text-gray-700">{selectedApplication.job_offer.job_type?.name || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ListChecks className="mr-2 mt-1 text-blue-700 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Category</p>
                      <p className="text-gray-700">{selectedApplication.job_offer.job_category?.name || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award className="mr-2 mt-1 text-blue-700 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Experience Level</p>
                      <p className="text-gray-700">{selectedApplication.job_offer.experience_level}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <DollarSign className="mr-2 text-blue-700 mt-1 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Salary Range</p>
                      <p className="text-gray-700">{selectedApplication.job_offer.salary_range || "Not disclosed"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="mr-2 mt-1 text-blue-700 flex-shrink-0" size={18} />
                    <div>
                      <p className="font-medium text-gray-700">Application Deadline</p>
                      <p className="text-gray-700">{formatDate(selectedApplication.job_offer.deadline)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-gray-700">Job Description</h4>
                  <p className="text-gray-700 whitespace-pre-line">{selectedApplication.job_offer.description}</p>
                </div>

                {/* Requirements */}
                {selectedApplication.job_offer.requirements && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-700">Requirements</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedApplication.job_offer.requirements}</p>
                  </div>
                )}

                {/* Responsibilities */}
                {selectedApplication.job_offer.responsibilities && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-700">Responsibilities</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedApplication.job_offer.responsibilities}</p>
                  </div>
                )}

                {/* Benefits */}
                {selectedApplication.job_offer.benefits && (
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700">Benefits</h4>
                    <p className="text-gray-700 whitespace-pre-line">{selectedApplication.job_offer.benefits}</p>
                  </div>
                )}


                <div className="flex items-start">

                  <div>
                    <p className="font-medium text-gray-700">Number of position</p>
                    <p className="text-gray-700">{selectedApplication.job_offer?.employees_needed || "1"}</p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Application</h3>

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-gray-700">Cover Letter</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500 whitespace-pre-line">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Resume */}
                {selectedApplication.resume && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Resume</h4>
                    <a
                      href={selectedApplication.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View Resume
                    </a>
                  </div>
                )}

                {/* Additional Documents */}
                {selectedApplication.additional_documents && selectedApplication.additional_documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Additional Documents</h4>
                    <ul className="list-disc list-inside">
                      {selectedApplication.additional_documents.map((doc, index) => (
                        <li key={index}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {doc.name || `Document ${index + 1}`}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Feedback */}
                {selectedApplication.feedback && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Feedback from Employer</h4>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="text-gray-800">{selectedApplication.feedback}</p>
                    </div>
                  </div>
                )}

                {/* Review Information */}
                {selectedApplication.reviewed_at && (
                  <div className="text-sm text-gray-500">
                    Reviewed on: {formatDate(selectedApplication.reviewed_at)}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 border-t pt-4">
                <button
                  className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>

                {!["accepted", "rejected", "withdrawn"].includes(selectedApplication.status) && (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => {
                      handleWithdraw(selectedApplication.id);
                      // Don't close modal, it will update with the new status
                    }}
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSeekerHome;