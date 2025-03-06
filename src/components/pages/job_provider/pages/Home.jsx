/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle2, Search, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Job management component that combines listing, filtering, and CRUD operations
const Employer_Home = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', type: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewJob, setViewJob] = useState(null);
  const [viewJobLoading, setViewJobLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, categoriesRes, typesRes] = await Promise.all([
          axios.get('https://anaweza-backend.up.railway.app/job_offer/my-offers/', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get('https://anaweza-backend.up.railway.app/category/categories/'),
          axios.get('https://anaweza-backend.up.railway.app/category/types/')
        ]);
        setJobs(jobsRes.data);
        setCategories(categoriesRes.data);
        setTypes(typesRes.data);
        setError(null);
      } catch (err) {
        setError(t('Failed to fetch data. Please try again.'));
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t, token]);

  // Fetch job details by ID
  const fetchJobDetails = async (jobId) => {
    try {
      setViewJobLoading(true);
      const response = await axios.get(`https://anaweza-backend.up.railway.app/job_offer/${jobId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setViewJob(response.data);
      setIsViewModalOpen(true);
      setError(null);
    } catch (err) {
      setError(t('Failed to fetch job details. Please try again.'));
      console.error('Error:', err);
    } finally {
      setViewJobLoading(false);
    }
  };

  // Handle view job details
  const handleViewDetails = (jobId) => {
    fetchJobDetails(jobId);
  };

  // Handle view applications
  const handleViewApplications = (jobId) => {
    navigate(`/employer/job_application/${jobId}`);
  };

  // Filter jobs based on search and filter criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || job.status === filters.status;
    const matchesCategory = !filters.category || String(job.job_category?.id) === String(filters.category);
    const matchesType = !filters.type || String(job.job_type?.id) === String(filters.type);

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  // Handle job deletion with token authentication
  const handleDelete = async (jobId) => {
    if (!window.confirm(t('Are you sure you want to delete this job offer?'))) return;
    try {
      await axios.delete(`https://anaweza-backend.up.railway.app/job_offer/delete/${jobId}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setJobs(jobs.filter(job => job.id !== jobId));
      setError(null);
    } catch (err) {
      setError(t('Failed to delete job offer. Please try again.'));
      console.error('Error:', err);
    }
  };

  // Handle opening the edit modal for a job
  const handleEdit = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Handle opening the create modal
  const handleCreate = () => {
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  // Handle saving a job (create or update) with token authentication
  const handleSave = async (formData) => {
    try {
      if (selectedJob) {
        const response = await axios.put(
          `https://anaweza-backend.up.railway.app/job_offer/update/${selectedJob.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setJobs(jobs.map(job => job.id === selectedJob.id ? response.data : job));
      } else {
        const response = await axios.post(
          'https://anaweza-backend.up.railway.app/job_offer/create/',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setJobs([...jobs, response.data]);
      }
      setIsModalOpen(false);
      setSelectedJob(null);
      setError(null);
    } catch (err) {
      setError(t('Failed to save job offer. Please try again.'));
      console.error('Error:', err);
      throw err; // Re-throw to be caught by the modal
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">{t('Job Offers Management')}</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          {t('Add New Job')}
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('Search jobs...')}
              className="pl-10 w-full text-gray-700 rounded-lg border border-gray-300 p-2"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-lg text-gray-700 border border-gray-300 p-2"
          >
            <option value="">{t('All Statuses')}</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-lg border text-gray-500 border-gray-300 p-2"
          >
            <option value="">{t('All Categories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="rounded-lg text-gray-500 border border-gray-300 p-2"
          >
            <option value="">{t('All Types')}</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Jobs Table */}
      <div className="w-full overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className='text-xs text-white uppercase bg-sky-900'>
            <tr className="">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Title')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Company')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Type')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Number of Employees')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">{t('No job offers found')}</td>
              </tr>
            ) : (
              filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.job_category?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.job_type?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{job.employees_needed}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 
                      job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status === 'active' ? <CheckCircle2 size={14} className="mr-1" /> : 
                       job.status === 'closed' ? <AlertCircle size={14} className="mr-1" /> : null}
                      {t(job.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button onClick={() => handleViewDetails(job.id)} className="text-blue-600 hover:text-blue-900" title={t("View Details")}>
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleViewApplications(job.id)} className="text-green-600 hover:text-green-900" title={t("View Applications")}>
                        <Users size={18} />
                      </button>
                      <button onClick={() => handleEdit(job)} className="text-blue-600 hover:text-blue-900" title={t("Edit")}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(job.id)} className="text-red-600 hover:text-red-900" title={t("Delete")}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Job Modal */}
      {isModalOpen && (
        <JobModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedJob(null); }}
          job={selectedJob}
          categories={categories}
          types={types}
          onSave={handleSave}
        />
      )}

      {/* Job View Modal */}
      {isViewModalOpen && (
        <JobViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setViewJob(null); }}
          job={viewJob}
          loading={viewJobLoading}
        />
      )}
    </div>
  );
};

// Helper function to format date for form input
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Date formatting error:', e);
    return '';
  }
};

// Helper function to convert newline-separated text to array
const convertToList = (text) => {
  if (!text) return [];
  return text.split('\n').filter(item => item.trim() !== '');
};

// Custom alert component
const CustomAlert = ({ message, onClose }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <AlertCircle className="h-5 w-5 text-red-500" />
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
      <div className="ml-auto pl-3">
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-600 focus:outline-none"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
);

// Job Modal Component
const JobModal = ({ isOpen, onClose, job, onSave, categories, types }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    offer_type: "individual",
    company_name: "",
    location: "",
    job_type_id: "",
    job_category_id: "",
    experience_level: "entry",
    salary_range: "",
    description: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    deadline: "",
    status: "draft",
    employees_needed: ""
  });
  const [error, setError] = useState(null);

  // Initialize form data when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        ...job,
        requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements,
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : job.responsibilities,
        benefits: Array.isArray(job.benefits) ? job.benefits.join('\n') : job.benefits,
        job_type_id: job.job_type?.id || "",
        job_category_id: job.job_category?.id || "",
        deadline: formatDate(job.deadline)
      });
    } else {
      // Reset form for new job offer
      setFormData({
        title: "",
        offer_type: "individual",
        company_name: "",
        location: "",
        job_type_id: "",
        job_category_id: "",
        experience_level: "entry",
        salary_range: "",
        description: "",
        requirements: "",
        responsibilities: "",
        benefits: "",
        deadline: "",
        status: "draft",
        employees_needed: ""
      });
    }
  }, [job]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        requirements: convertToList(formData.requirements),
        responsibilities: convertToList(formData.responsibilities),
        benefits: convertToList(formData.benefits)
      };
      
      await onSave(dataToSend);
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">{job ? t("Edit Job Offer") : t("Create Job Offer")}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {error && <CustomAlert message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Offer Type *</label>
              <select
                value={formData.offer_type}
                onChange={(e) => setFormData({...formData, offer_type: e.target.value})}
                className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
                <option value="government">Government</option>
                <option value="non-government organization">NGO</option>
              </select>
            </div>

            {formData.offer_type === 'company' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name *</label>
                <input
                  type="text"
                  value={formData.company_name || ''}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Category *</label>
              <select
                value={formData.job_category_id}
                onChange={(e) => setFormData({...formData, job_category_id: e.target.value})}
                className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Type *</label>
              <select
                value={formData.job_type_id}
                onChange={(e) => setFormData({...formData, job_type_id: e.target.value})}
                className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {types.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Experience Level *</label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({...formData, experience_level: e.target.value})}
                className="mt-1 text-gray-500 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="mid">Mid Level</option>
                <option value="senior or executive">Senior or Executive Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Range</label>
              <input
                type="text"
                value={formData.salary_range || ''}
                onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Deadline *</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Full-width text areas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="mt-1 text-gray-500 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Requirements * (One per line)</label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                rows={4}
                className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Responsibilities * (One per line)</label>
              <textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                rows={4}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Benefits (One per line)</label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({...formData, benefits: e.target.value})}
                rows={4}
                className="mt-1 text-gray-500 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Position</label>
              <input
                type="number"
                value={formData.employees_needed || ''}
                onChange={(e) => setFormData({...formData, employees_needed: e.target.value})}
                className="mt-1 block w-full text-gray-500 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {job ? "Update Job Offer" : "Create Job Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Job View Modal Component
const JobViewModal = ({ isOpen, onClose, job, loading }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-black">{t("Job Details")}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">{t("Failed to load job details.")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
        active: "bg-red-100 text-red-800"
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">{t("Job Details")}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-6">
          {/* Benefits Section */}
          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t("Benefits")}</h4>
              <ul className="list-disc pl-5 space-y-1">
                {Array.isArray(job.benefits) ? (
                  job.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-600">{benefit}</li>
                  ))
                ) : (
                  <li className="text-gray-600">{job.benefits}</li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{t("Number of Positions")}</h4>
            <p className="text-gray-600 whitespace-pre-line">{job.employees_needed}</p>
          </div>

          {/* Metadata Section */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {job.created_by && (
                <div>
                  <span className="font-medium">{t("Created By")}:</span>
                  <span className="ml-1">{job.created_by.email}</span>
                </div>
              )}
              {job.created_at && (
                <div>
                  <span className="font-medium">{t("Created At")}:</span>
                  <span className="ml-1">{formatDate(job.created_at)}</span>
                </div>
              )}
              {job.updated_at && (
                <div>
                  <span className="font-medium">{t("Last Updated")}:</span>
                  <span className="ml-1">{formatDate(job.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employer_Home;