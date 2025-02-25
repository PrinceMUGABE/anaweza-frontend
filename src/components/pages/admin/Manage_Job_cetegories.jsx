/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faBriefcase,
    faTags,
    faChartPie,
    faCalendarAlt,
    faPlus,
    faTimes,
    faCheckCircle,
    faExclamationTriangle,
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

function Manage_Job_categories() {
    // State management
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [jobTypes, setJobTypes] = useState([]);
    const [selectedJobType, setSelectedJobType] = useState(null);
    const [jobTypeModalOpen, setJobTypeModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chartView, setChartView] = useState('pie'); // 'pie' or 'area'

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
            const [categoriesRes, typesRes] = await Promise.all([
                axios.get("https://anaweza-backend.up.railway.app/category/categories/", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("https://anaweza-backend.up.railway.app/category/types/", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setCategories(categoriesRes.data);
            setJobTypes(typesRes.data);
        } catch (error) {
            showMessage("Error fetching data", "error");
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
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
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

    // Enhanced Form Component
    const Form = ({ type, item, onSubmit }) => {
        const [formData, setFormData] = useState({
            name: item?.name || "",
            description: item?.description || ""
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        rows="4"
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => type === 'category' ? setCategoryModalOpen(false) : setJobTypeModalOpen(false)}
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
    const handleCategorySubmit = async (formData) => {
        try {
            if (selectedCategory) {
                await axios.put(
                    `https://anaweza-backend.up.railway.app/category/update/${selectedCategory.id}/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    "https://anaweza-backend.up.railway.app/category/create/",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchData();
            setCategoryModalOpen(false);
            showMessage(
                `Category ${selectedCategory ? 'updated' : 'created'} successfully`,
                "success"
            );
        } catch (error) {
            showMessage(error.response?.data?.error || "An error occurred", "error");
        }
    };

    const handleJobTypeSubmit = async (formData) => {
        try {
            if (selectedJobType) {
                await axios.put(
                    `https://anaweza-backend.up.railway.app/category/type/update/${selectedJobType.id}/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    "https://anaweza-backend.up.railway.app/category/type/create/",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            fetchData();
            setJobTypeModalOpen(false);
            showMessage(
                `Job type ${selectedJobType ? 'updated' : 'created'} successfully`,
                "success"
            );
        } catch (error) {
            showMessage(error.response?.data?.error || "An error occurred", "error");
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const url = type === 'category'
                ? `https://anaweza-backend.up.railway.app/category/delete/${id}/`
                : `https://anaweza-backend.up.railway.app/category/type/delete/${id}/`;

            await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchData();
            showMessage(`${type} deleted successfully`, "success");
        } catch (error) {
            showMessage(error.response?.data?.error || "An error occurred", "error");
        }
    };

    // Chart data preparation
    const preparePieChartData = () => {
        return categories.map(cat => ({
            name: cat.name,
            value: 1
        }));
    };

    const prepareTimelineData = () => {
        const monthlyData = {};
        categories.forEach(cat => {
            const date = new Date(cat.created_at);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        });

        return Object.entries(monthlyData).map(([date, count]) => ({
            date,
            Categories: count,
            Types: jobTypes.filter(type => {
                const typeDate = new Date(type.created_at);
                return `${typeDate.toLocaleString('default', { month: 'short' })} ${typeDate.getFullYear()}` === date;
            }).length
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Job Categories and Types Management
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
                        title="Total Categories"
                        value={categories.length}
                        icon={faTags}
                        color={COLORS.primary}
                    />
                    <StatsCard
                        title="Total Job Types"
                        value={jobTypes.length}
                        icon={faBriefcase}
                        color={COLORS.secondary}
                    />
                    <StatsCard
                        title="Categories This Month"
                        value={categories.filter(cat =>
                            new Date(cat.created_at).getMonth() === new Date().getMonth()
                        ).length}
                        icon={faChartPie}
                        color={COLORS.accent1}
                    />
                    <StatsCard
                        title="Types This Month"
                        value={jobTypes.filter(type =>
                            new Date(type.created_at).getMonth() === new Date().getMonth()
                        ).length}
                        icon={faCalendarAlt}
                        color={COLORS.accent2}
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Category Distribution</h3>
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
                                            <linearGradient id="colorCategories" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorTypes" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                                                <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="Categories"
                                            stroke={COLORS.primary}
                                            fillOpacity={1}
                                            fill="url(#colorCategories)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Types"
                                            stroke={COLORS.secondary}
                                            fillOpacity={1}
                                            fill="url(#colorTypes)"
                                        />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            {[...categories, ...jobTypes]
                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                .slice(0, 5)
                                .map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${'name' in item
                                                ? 'bg-indigo-100 text-indigo-600'
                                                : 'bg-green-100 text-green-600'
                                            }`}>
                                            <FontAwesomeIcon
                                                icon={'name' in item ? faTags : faBriefcase}
                                                className="text-lg"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-xl shadow-lg mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Job Categories</h2>
                            <button
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setCategoryModalOpen(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Add Category</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
                                                    <FontAwesomeIcon icon={faTags} />
                                                </div>
                                                <span className="font-medium text-gray-900">{category.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-500 truncate max-w-xs">{category.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(category.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    setCategoryModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id, 'category')}
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

                {/* Job Types Table */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">Job Types</h2>
                            <button
                                onClick={() => {
                                    setSelectedJobType(null);
                                    setJobTypeModalOpen(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Add Job Type</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {jobTypes.map((jobType) => (
                                    <tr key={jobType.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="p-2 rounded-lg bg-green-100 text-green-600 mr-3">
                                                    <FontAwesomeIcon icon={faBriefcase} />
                                                </div>
                                                <span className="font-medium text-gray-900">{jobType.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-500 truncate max-w-xs">{jobType.description}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {new Date(jobType.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    setSelectedJobType(jobType);
                                                    setJobTypeModalOpen(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(jobType.id, 'type')}
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

                {/* Modals */}
                <Modal
                    isOpen={categoryModalOpen}
                    onClose={() => setCategoryModalOpen(false)}
                    title={selectedCategory ? "Edit Category" : "Add Category"}
                >
                    <Form
                        type="category"
                        item={selectedCategory}
                        onSubmit={handleCategorySubmit}
                    />
                </Modal>

                <Modal
                    isOpen={jobTypeModalOpen}
                    onClose={() => setJobTypeModalOpen(false)}
                    title={selectedJobType ? "Edit Job Type" : "Add Job Type"}
                >
                    <Form
                        type="jobType"
                        item={selectedJobType}
                        onSubmit={handleJobTypeSubmit}
                    />
                </Modal>
            </div>
        </div>
    );
}

export default Manage_Job_categories;