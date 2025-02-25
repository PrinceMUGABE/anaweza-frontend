/* eslint-disable react/jsx-no-undef */
/* eslint-disable no-undef */
/* eslint-disable react/prop-types */
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
      status: "draft"
    });
    const [error, setError] = useState(null);
  
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
          status: "draft"
        });
      }
    }, [job]);
  
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
            <h2 className="text-2xl font-bold">{job ? t("Edit Job Offer") : t("Create Job Offer")}</h2>
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
                  className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className="mt-1 block text-gray-500 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className="mt-1 text-gray-500 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Responsibilities * (One per line)</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                  rows={4}
                  className="mt-1 text-gray-500 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
  
  export default JobModal;