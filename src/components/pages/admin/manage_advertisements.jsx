/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faAd,
    faTags,
    faChartPie,
    faCalendarAlt,
    faPlus,
    faTimes,
    faCheckCircle,
    faExclamationTriangle,
    faImage,
    faMoneyBill,
    faUser,
    faPhone,
    faSpinner
} from "@fortawesome/free-solid-svg-icons";
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
    Area,
    AreaChart,
} from "recharts";

function Admin_ManageAdvertisements() {
    // State management
    const [advertisements, setAdvertisements] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [adModalOpen, setAdModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chartView, setChartView] = useState('pie'); // 'pie' or 'area'
    const [previewImage, setPreviewImage] = useState("");
    const [currentAction, setCurrentAction] = useState(""); // Track current action

    const token = localStorage.getItem("token");

    // Chart colors and styles
    const COLORS = {
        primary: '#4F46E5', // Indigo
        secondary: '#10B981', // Emerald
        accent1: '#F59E0B', // Amber
        accent2: '#EC4899', // Pink
        accent3: '#6366F1', // Indigo
        background: '#F3F4F6', // Gray-100
        success: '#34D399', // Emerald-400
        error: '#EF4444', // Red-500
        chart: [
            '#4F46E5',
            '#10B981',
            '#F59E0B',
            '#EC4899',
            '#6366F1',
            '#2DD4BF',
            '#F472B6',
            '#818CF8'
        ]
    };

    useEffect(() => {
        fetchData();
    }, []);

    const logActivity = (action, details = '') => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${action}${details ? `: ${details}` : ''}`;
        console.log(logMessage);
        return logMessage;
    };

    const fetchData = async () => {
        setIsLoading(true);
        setCurrentAction("Fetching advertisements");
        logActivity("Fetching advertisements", "Started API request");
        
        try {
            const response = await axios.get("https://anaweza-backend.up.railway.app/advertisement/advertisements/", {
                headers: { Authorization: `Bearer ${token}` }
            });

            logActivity("Fetching advertisements", "Received response from API");

            // Ensure we're setting an array to advertisements state
            // If response.data is the array directly, use it
            // If response.data contains the array in a property, extract it
            if (Array.isArray(response.data)) {
                setAdvertisements(response.data);
                logActivity("Data processing", `Successfully processed ${response.data.length} advertisements`);
            } else if (response.data && typeof response.data === 'object') {
                // Look for an array property in the response data
                // Common patterns include response.data.data, response.data.advertisements, etc.
                const dataArray = response.data.data ||
                    response.data.advertisements ||
                    response.data.results ||
                    [];
                setAdvertisements(dataArray);
                logActivity("Data processing", `Successfully processed ${dataArray.length} advertisements from nested structure`);

                // If we couldn't find an array, log the response structure for debugging
                if (dataArray.length === 0 && Object.keys(response.data).length > 0) {
                    logActivity("Warning", "Received data in unexpected format");
                    console.log("API Response structure:", response.data);
                    showMessage("Received data in unexpected format. Check console.", "error");
                }
            } else {
                // Fallback to empty array if response.data is neither an array nor an object
                setAdvertisements([]);
                logActivity("Error", "Received invalid data format from server");
                showMessage("Received invalid data from server", "error");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Unknown error";
            logActivity("Error", `Failed to fetch advertisements: ${errorMessage}`);
            console.error("Error fetching advertisements:", error);
            showMessage(`Error fetching advertisements: ${errorMessage}`, "error");
            setAdvertisements([]); // Set to empty array on error
        }
        setIsLoading(false);
        setCurrentAction("");
    };

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        logActivity(type === "success" ? "Success" : "Error", msg);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    // Stats Card Component
    const StatsCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <p className="text-3xl font-bold" style={{ color: color }}>{value}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
                    <FontAwesomeIcon icon={icon} className="text-2xl" style={{ color }} />
                </div>
            </div>
        </div>
    );

    // Modal Component with enhanced styling
    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl transform transition-all duration-300 scale-100 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        );
    };

    // Enhanced Form Component for Advertisements
    const AdvertisementForm = ({ item, onSubmit }) => {
        // Update the formData state to include media_type
        const [formData, setFormData] = useState({
            title: item?.title || "",
            description: item?.description || "",
            contact_info: item?.contact_info || "",
            price: item?.price || "",
            start_date: item?.start_date || new Date().toISOString().split('T')[0],
            end_date: item?.end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            status: item?.status || "waiting", // Fix the typo from "waititng" to "waiting"
            image: null,
            media_type: item?.media_type || "image", // Add media_type field
        });
        
        const [formErrors, setFormErrors] = useState({});
        const [imagePreview, setImagePreview] = useState(item?.image ? `data:image/jpeg;base64,${item.image}` : "");

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
            
            // Clear error for this field when it's being edited
            if (formErrors[name]) {
                setFormErrors({
                    ...formErrors,
                    [name]: null
                });
            }
        };

        // Update the handleImageChange function to handle both image and video
        const handleMediaChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                logActivity("Media handling", `Processing ${formData.media_type} file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
                
                // Validate file size based on media type
                const maxSizeMB = formData.media_type === 'image' ? 5 : 30;
                const fileSizeMB = file.size / (1024 * 1024);

                if (fileSizeMB > maxSizeMB) {
                    const errorMsg = `File size exceeds maximum allowed (${maxSizeMB}MB) for ${formData.media_type}`;
                    logActivity("Error", errorMsg);
                    setFormErrors({
                        ...formErrors,
                        image: errorMsg
                    });
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    // Get the base64 data without the prefix
                    const base64String = reader.result.split(',')[1];
                    setFormData({ ...formData, image: base64String });
                    setImagePreview(reader.result);
                    logActivity("Media handling", "File processed successfully");
                };
                reader.onerror = () => {
                    logActivity("Error", "Failed to read file");
                    setFormErrors({
                        ...formErrors,
                        image: "Failed to process file. Please try again."
                    });
                };
                reader.readAsDataURL(file);
            }
        };

        const validateForm = (data) => {
            const errors = {};
            logActivity("Form validation", "Validating form data");

            // Title validation
            if (data.title.length < 5) {
                errors.title = "Title must be at least 5 characters long.";
            }
            if (data.title.length > 200) {
                errors.title = "Title cannot exceed 200 characters.";
            }

            // Description validation
            if (data.description.length < 20) {
                errors.description = "Description must be at least 20 characters long.";
            }

            // Contact info validation
            if (data.contact_info.length < 5) {
                errors.contact_info = "Contact information must be at least 5 characters long.";
            }

            // Date validation
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);

            if (startDate < today) {
                errors.start_date = "Start date cannot be in the past.";
            }

            if (endDate < today) {
                errors.end_date = "End date cannot be in the past.";
            }

            if (startDate > endDate) {
                errors.date_range = "End date must be after start date.";
            }

            const dateDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (dateDiff > 365) {
                errors.date_range = "Advertisement duration cannot exceed 1 year.";
            }

            // Date format validation
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(data.start_date)) {
                errors.start_date = "Start date must be in YYYY-MM-DD format.";
            }
            if (!dateRegex.test(data.end_date)) {
                errors.end_date = "End date must be in YYYY-MM-DD format.";
            }

            if (Object.keys(errors).length > 0) {
                logActivity("Form validation", `Validation failed with ${Object.keys(errors).length} errors`);
            } else {
                logActivity("Form validation", "Validation successful");
            }

            return errors;
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const errors = validateForm(formData);
            
            if (Object.keys(errors).length > 0) {
                // Display errors
                logActivity("Form submission", "Form has validation errors");
                console.error("Validation errors:", errors);
                setFormErrors(errors);
                return;
            }
            
            logActivity("Form submission", "Form validated successfully, submitting data");
            onSubmit(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 text-gray-500 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                        required
                    />
                    {formErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Media Type</label>
                    <select
                        name="media_type"
                        value={formData.media_type}
                        onChange={handleChange}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full text-gray-500 px-4 py-2 border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                        rows="4"
                        required
                    />
                    {formErrors.description && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                    <input
                        type="text"
                        name="contact_info"
                        value={formData.contact_info}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 text-gray-500 border ${formErrors.contact_info ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                        required
                    />
                    {formErrors.contact_info && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.contact_info}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className={`w-full px-4 text-gray-500 py-2 border ${formErrors.start_date || formErrors.date_range ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                            required
                        />
                        {formErrors.start_date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.start_date}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className={`w-full text-gray-500 px-4 py-2 border ${formErrors.end_date || formErrors.date_range ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                            required
                        />
                        {formErrors.end_date && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.end_date}</p>
                        )}
                    </div>
                </div>
                {formErrors.date_range && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.date_range}</p>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="waiting">Waiting</option>
                        <option value="running">Running</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.media_type === 'image' ? 'Image' : 'Video'}
                    </label>
                    <input
                        type="file"
                        accept={formData.media_type === 'image' ? "image/*" : "video/*"}
                        onChange={handleMediaChange}
                        className={`block w-full text-sm text-gray-500 
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100
                            ${formErrors.image ? 'border border-red-500 rounded-lg' : ''}`}
                    />
                    {formErrors.image && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                    )}
                    {imagePreview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Preview:</p>
                            {formData.media_type === 'image' ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-48 rounded-lg object-contain"
                                />
                            ) : (
                                <video
                                    src={imagePreview}
                                    controls
                                    className="max-h-48 rounded-lg object-contain"
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setAdModalOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        )}
                        {item ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        );
    };

    // CRUD operations
    // Update the handleAdvertisementSubmit function
    const handleAdvertisementSubmit = async (formData) => {
        try {
            setIsLoading(true);
            const actionType = selectedAd ? 'Updating' : 'Creating';
            setCurrentAction(`${actionType} advertisement`);
            logActivity(actionType, `${actionType} advertisement: ${formData.title}`);
            
            const processedData = {
                ...formData,
                start_date: new Date(formData.start_date).toISOString().split('T')[0],
                end_date: new Date(formData.end_date).toISOString().split('T')[0]
            };

            if (selectedAd) {
                logActivity("API Request", `Sending PUT request to update advertisement ID: ${selectedAd.id}`);
                await axios.put(
                    `https://anaweza-backend.up.railway.app/advertisement/update/${selectedAd.id}/`,
                    processedData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                logActivity("Success", `Advertisement ID: ${selectedAd.id} updated successfully`);
            } else {
                logActivity("API Request", "Sending POST request to create new advertisement");
                await axios.post(
                    "https://anaweza-backend.up.railway.app/advertisement/create/",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                logActivity("Success", "New advertisement created successfully");
            }
            
            await fetchData();
            setAdModalOpen(false);
            showMessage(
                `Advertisement ${selectedAd ? 'updated' : 'created'} successfully`,
                "success"
            );
        } catch (error) {
            // Improved error handling
            let errorMessage = "An error occurred";

            if (error.response) {
                logActivity("API Error", `Server responded with status ${error.response.status}`);
                
                if (error.response.data) {
                    // Handle structured error responses
                    if (typeof error.response.data === 'object') {
                        // Extract error message from the first field with error
                        const firstErrorField = Object.keys(error.response.data)[0];
                        const firstError = error.response.data[firstErrorField];
                        errorMessage = Array.isArray(firstError)
                            ? firstError[0]
                            : typeof firstError === 'string'
                                ? firstError
                                : JSON.stringify(firstError);
                                
                        logActivity("Error details", `Field: ${firstErrorField}, Error: ${errorMessage}`);
                    } else if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                        logActivity("Error details", errorMessage);
                    }
                } else {
                    errorMessage = `Server error: ${error.response.status}`;
                    logActivity("Error", errorMessage);
                }
            } else if (error.request) {
                errorMessage = "No response from server. Please check your internet connection.";
                logActivity("Network Error", "No response received from server");
            } else {
                errorMessage = error.message;
                logActivity("Error", `Error message: ${error.message}`);
            }

            showMessage(errorMessage, "error");
        } finally {
            setIsLoading(false);
            setCurrentAction("");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this advertisement?`)) {
            logActivity("Delete cancelled", `User cancelled deletion of advertisement ID: ${id}`);
            return;
        }

        try {
            setIsLoading(true);
            setCurrentAction(`Deleting advertisement`);
            logActivity("Deleting", `Sending delete request for advertisement ID: ${id}`);
            
            await axios.delete(`https://anaweza-backend.up.railway.app/advertisement/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            logActivity("Success", `Advertisement ID: ${id} deleted successfully`);
            await fetchData();
            showMessage("Advertisement deleted successfully", "success");
        } catch (error) {
            const errorMsg = error.response?.data?.error || "An error occurred during deletion";
            logActivity("Error", `Failed to delete advertisement: ${errorMsg}`);
            showMessage(errorMsg, "error");
        } finally {
            setIsLoading(false);
            setCurrentAction("");
        }
    };

    // Chart data preparation
    // Update preparePieChartData function
    const preparePieChartData = () => {
        const statusCount = {
            waiting: 0,
            running: 0,
            closed: 0,
        };

        advertisements.forEach(ad => {
            statusCount[ad.status] = (statusCount[ad.status] || 0) + 1;
        });

        return Object.entries(statusCount).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count
        }));
    };
    
    const prepareTimelineData = () => {
        const monthlyData = {};
        advertisements.forEach(ad => {
            const date = new Date(ad.created_at);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        });

        return Object.entries(monthlyData)
            .sort((a, b) => {
                const dateA = new Date(a[0]);
                const dateB = new Date(b[0]);
                return dateA - dateB;
            })
            .map(([date, count]) => ({
                date,
                Advertisements: count
            }));
    };

    // Loading overlay component
    const LoadingOverlay = ({ action }) => (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-indigo-600 mb-4" />
                <p className="text-gray-700 font-medium">{action || "Loading..."}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {isLoading && <LoadingOverlay action={currentAction} />}
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Advertisement Management
                </h1>

                {/* Alert Messages */}
                {message && (
                    <div className={`mb-8 p-4 rounded-lg flex items-center ${messageType === "success"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                        }`}>
                        <FontAwesomeIcon
                            icon={messageType === "success" ? faCheckCircle : faExclamationTriangle}
                            className="mr-3"
                        />
                        {message}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Advertisements"
                        value={advertisements.length}
                        icon={faAd}
                        color={COLORS.primary}
                    />
                    <StatsCard
                        title="Running Ads"
                        value={advertisements.filter(ad => ad.status === 'running').length}
                        icon={faChartPie}
                        color={COLORS.secondary}
                    />
                    <StatsCard
                        title="Waiting Approval"
                        value={advertisements.filter(ad => ad.status === 'waiting').length}
                        icon={faCalendarAlt}
                        color={COLORS.accent1}
                    />
                    <StatsCard
                        title="Closed Ads"
                        value={advertisements.filter(ad => ad.status === 'closed').length}
                        icon={faTags}
                        color={COLORS.accent2}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Advertisement Status Distribution</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setChartView('pie')}
                                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${chartView === 'pie'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    Pie
                                </button>
                                <button
                                    onClick={() => setChartView('area')}
                                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${chartView === 'area'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    Timeline
                                </button>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartView === 'pie' ? (
                                    <PieChart>
                                        <Pie
                                            data={preparePieChartData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {preparePieChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <AreaChart data={prepareTimelineData()}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAdvertisements" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="Advertisements"
                                            stroke={COLORS.primary}
                                            fillOpacity={1}
                                            fill="url(#colorAdvertisements)"
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Advertisements</h3>
                        <div className="space-y-4">
                            {advertisements
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, 5)
                                .map((ad, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mt-1">
                                            <FontAwesomeIcon icon={faAd} className="text-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{ad.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {ad.created_by?.email || "Unknown"} • {new Date(ad.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {ad.description.substring(0, 100)}...
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${ad.status === 'running' ? 'bg-green-100 text-green-800' :
                                            ad.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {ad.status}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Advertisements Table */}
                <div className="bg-white rounded-xl shadow-lg mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">All Advertisements</h2>
                            <button
                                onClick={() => {
                                    setSelectedAd(null);
                                    setAdModalOpen(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Add Advertisement</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>

                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {advertisements.map((ad) => (
                                    <tr key={ad.id} className="hover:bg-gray-50">

                                        <td className="px-6 py-4">
                                            {ad.image ? (
                                                ad.media_type === 'video' ? (
                                                    <video
                                                        src={`data:video/mp4;base64,${ad.image}`}
                                                        className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            setPreviewImage(`data:video/mp4;base64,${ad.image}`);
                                                            window.open(`data:video/mp4;base64,${ad.image}`, '_blank');
                                                        }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={`data:image/jpeg;base64,${ad.image}`}
                                                        alt={ad.title}
                                                        className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            setPreviewImage(`data:image/jpeg;base64,${ad.image}`);
                                                            window.open(`data:image/jpeg;base64,${ad.image}`, '_blank');
                                                        }}
                                                    />
                                                )
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <FontAwesomeIcon icon={faImage} className="text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
                                                    <FontAwesomeIcon icon={faAd} />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 block">{ad.title}</span>
                                                    <span className="text-xs text-gray-500">{new Date(ad.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-2">
                                                    <FontAwesomeIcon icon={faUser} />
                                                </div>
                                                <span className="text-gray-500 text-sm">{ad.created_by?.email || "Unknown"}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-1 rounded-full bg-green-100 text-green-600 mr-2">
                                                    <FontAwesomeIcon icon={faPhone} className="text-xs" />
                                                </div>
                                                <span className="text-gray-500 text-sm">{ad.contact_info}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-1 rounded-full bg-yellow-100 text-yellow-600 mr-2">
                                                    <FontAwesomeIcon icon={faMoneyBill} className="text-xs" />
                                                </div>
                                                <span className="text-gray-900 font-medium">${ad.price || '0.00'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div>Start: {new Date(ad.start_date).toLocaleDateString()}</div>
                                            <div>End: {new Date(ad.end_date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${ad.status === 'running' ? 'bg-green-100 text-green-800' :
                                                ad.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {ad.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedAd(ad);
                                                    setAdModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal */}
                <Modal
                    isOpen={adModalOpen}
                    onClose={() => setAdModalOpen(false)}
                    title={selectedAd ? "Edit Advertisement" : "Add Advertisement"}
                >
                    <AdvertisementForm
                        item={selectedAd}
                        onSubmit={handleAdvertisementSubmit}
                    />
                </Modal>
            </div>
        </div>
    );
}

export default Admin_ManageAdvertisements;