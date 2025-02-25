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
    faPhone
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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("https://anaweza-backend.up.railway.app/advertisement/advertisements/", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Ensure we're setting an array to advertisements state
            // If response.data is the array directly, use it
            // If response.data contains the array in a property, extract it
            if (Array.isArray(response.data)) {
                setAdvertisements(response.data);
            } else if (response.data && typeof response.data === 'object') {
                // Look for an array property in the response data
                // Common patterns include response.data.data, response.data.advertisements, etc.
                const dataArray = response.data.data || 
                                  response.data.advertisements || 
                                  response.data.results || 
                                  [];
                setAdvertisements(dataArray);
                
                // If we couldn't find an array, log the response structure for debugging
                if (dataArray.length === 0 && Object.keys(response.data).length > 0) {
                    console.log("API Response structure:", response.data);
                    showMessage("Received data in unexpected format. Check console.", "error");
                }
            } else {
                // Fallback to empty array if response.data is neither an array nor an object
                setAdvertisements([]);
                showMessage("Received invalid data from server", "error");
            }
        } catch (error) {
            console.error("Error fetching advertisements:", error);
            showMessage("Error fetching advertisements", "error");
            setAdvertisements([]); // Set to empty array on error
        }
        setIsLoading(false);
    };

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
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
        const [formData, setFormData] = useState({
            title: item?.title || "",
            description: item?.description || "",
            contact_info: item?.contact_info || "",
            price: item?.price || "",
            start_date: item?.start_date || new Date().toISOString().split('T')[0],
            end_date: item?.end_date || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            status: item?.status || "running",
            image: null,
        });

        const [imagePreview, setImagePreview] = useState(item?.image ? `data:image/jpeg;base64,${item.image}` : "");

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Get the base64 data without the prefix (data:image/jpeg;base64,)
                    const base64String = reader.result.split(',')[1];
                    setFormData({ ...formData, image: base64String });
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
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
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        rows="4"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                    <input
                        type="text"
                        name="contact_info"
                        value={formData.contact_info}
                        onChange={handleChange}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                    />
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
                            className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>
                </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                    {imagePreview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">Preview:</p>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-h-48 rounded-lg object-contain" 
                            />
                        </div>
                    )}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setAdModalOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        {item ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        );
    };

    // CRUD operations
    const handleAdvertisementSubmit = async (formData) => {
        try {
            if (selectedAd) {
                // Updated URL for updating advertisement
                await axios.put(
                    `https://anaweza-backend.up.railway.app/advertisement/update/${selectedAd.id}/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // Updated URL for creating advertisement
                await axios.post(
                    "https://anaweza-backend.up.railway.app/advertisement/create/",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchData();
            setAdModalOpen(false);
            showMessage(
                `Advertisement ${selectedAd ? 'updated' : 'created'} successfully`,
                "success"
            );
        } catch (error) {
            showMessage(error.response?.data?.error || "An error occurred", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete this advertisement?`)) return;

        try {
            await axios.delete(`https://anaweza-backend.up.railway.app/advertisement/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchData();
            showMessage("Advertisement deleted successfully", "success");
        } catch (error) {
            showMessage(error.response?.data?.error || "An error occurred", "error");
        }
    };

    // Chart data preparation
    const preparePieChartData = () => {
        const statusCount = {
            waititng: 0,
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
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
                        value={advertisements.filter(ad => ad.status === 'waititng').length}
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
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                            ad.status === 'running' ? 'bg-green-100 text-green-800' :
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
                                                <img 
                                                    src={`data:image/jpeg;base64,${ad.image}`} 
                                                    alt={ad.title} 
                                                    className="h-12 w-12 object-cover rounded-lg cursor-pointer"
                                                    onClick={() => {
                                                        setPreviewImage(`data:image/jpeg;base64,${ad.image}`);
                                                        window.open(`data:image/jpeg;base64,${ad.image}`, '_blank');
                                                    }}
                                                />
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
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                ad.status === 'running' ? 'bg-green-100 text-green-800' :
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