/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrash,
    faUser,
    faQuoteLeft,
    faChartPie,
    faCalendarAlt,
    faPlus,
    faTimes,
    faCheckCircle,
    faExclamationTriangle,
    faBriefcase
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

function Job_Seeker_ManageTestimonials() {
    // State management
    const [testimonials, setTestimonials] = useState([]);
    const [selectedTestimonial, setSelectedTestimonial] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
    const [currentDescription, setCurrentDescription] = useState("");
    const [currentTestimonialDetails, setCurrentTestimonialDetails] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chartView, setChartView] = useState('pie'); // 'pie' or 'area'
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const token = localStorage.getItem("token");
    const BASE_URL = "https://anaweza-backend.up.railway.app/testimony";

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
        fetchTestimonials();
        
        // Add window resize listener for responsive layout
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTestimonials = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/testimonials/user/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTestimonials(response.data);
        } catch (error) {
            showMessage("Error fetching testimonials", "error");
            console.error("Error fetching testimonials:", error);
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

    // Function to truncate text
    const truncateText = (text, maxLength = 40) => {
        if (!text) return "";
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    // Function to open description modal
    const openDescriptionModal = (testimonial) => {
        setCurrentDescription(testimonial.description);
        setCurrentTestimonialDetails(testimonial);
        setDescriptionModalOpen(true);
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

    // Description Modal Component
    const DescriptionModal = ({ isOpen, onClose, testimonial, description }) => {
        if (!isOpen || !testimonial) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-full flex flex-col transform transition-all duration-300 scale-100">
                    <div className="flex justify-between items-center p-6 border-b">
                        <div className="flex items-center">
                            {testimonial.created_by_details?.profile_picture ? (
                                <img 
                                    src={testimonial.created_by_details.profile_picture} 
                                    alt={`${testimonial.first_name} ${testimonial.last_name}`}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                    <FontAwesomeIcon icon={faUser} className="text-indigo-600 text-xl" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {testimonial.first_name} {testimonial.last_name}
                                </h2>
                                <p className="text-gray-500">{testimonial.job || 'No Job Title'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow">
                        <div className="bg-indigo-50 p-4 rounded-lg mb-4 flex">
                            <span className="text-indigo-500 mt-1 mr-3">
                                <FontAwesomeIcon icon={faQuoteLeft} className="text-xl" />
                            </span>
                            <p className="text-gray-700 whitespace-pre-line">{description}</p>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            Created on: {new Date(testimonial.created_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="p-4 border-t flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Enhanced Form Component
    const TestimonialForm = ({ testimonial, onSubmit }) => {
        const [formData, setFormData] = useState({
            job: testimonial?.job || "",
            description: testimonial?.description || "",
            first_name: testimonial?.first_name || "",
            last_name: testimonial?.last_name || ""
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                        type="text"
                        value={formData.job}
                        onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        rows="4"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        {testimonial ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        );
    };

    // CRUD operations
    const handleTestimonialSubmit = async (formData) => {
        try {
            if (selectedTestimonial) {
                await axios.put(
                    `${BASE_URL}/testimonials/${selectedTestimonial.id}/update/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Testimonial updated successfully", "success");
            } else {
                await axios.post(
                    `${BASE_URL}/testimonials/create/`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Testimonial created successfully", "success");
            }
            fetchTestimonials();
            setModalOpen(false);
        } catch (error) {
            showMessage(error.response?.data?.detail || "An error occurred", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

        try {
            await axios.delete(`${BASE_URL}/testimonials/${id}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTestimonials();
            showMessage("Testimonial deleted successfully", "success");
        } catch (error) {
            showMessage(error.response?.data?.detail || "An error occurred", "error");
        }
    };

    // Chart data preparation
    const preparePieChartData = () => {
        const jobCount = {};
        testimonials.forEach(testimonial => {
            const job = testimonial.job || 'Not Specified';
            jobCount[job] = (jobCount[job] || 0) + 1;
        });

        return Object.entries(jobCount).map(([job, count]) => ({
            name: job,
            value: count
        }));
    };

    const prepareTimelineData = () => {
        const monthlyData = {};
        testimonials.forEach(testimonial => {
            const date = new Date(testimonial.created_at);
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
                Testimonials: count
            }));
    };

    // Testimonial Card Component for mobile view
    const TestimonialCard = ({ testimonial }) => (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
                        <FontAwesomeIcon icon={faQuoteLeft} />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">
                            {testimonial.first_name} {testimonial.last_name}
                        </h3>
                        <p className="text-sm text-gray-500">{testimonial.job || 'No Job Title'}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            setSelectedTestimonial(testimonial);
                            setModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
            <div 
                className="text-gray-600 mb-2 cursor-pointer hover:text-indigo-600"
                onClick={() => openDescriptionModal(testimonial)}
            >
                {truncateText(testimonial.description, 100)}
            </div>
            <p className="text-xs text-gray-400">
                {new Date(testimonial.created_at).toLocaleDateString()}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8 text-center">
                    Testimonials Management
                </h1>

                {/* Alert Messages */}
                {message && (
                    <div className={`mb-6 md:mb-8 p-4 rounded-lg flex items-center ${
                        messageType === "success"
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

                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-500">Loading testimonials...</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}

                        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                            <StatsCard
                                title="Total Testimonials"
                                value={testimonials.length}
                                icon={faQuoteLeft}
                                color={COLORS.primary}
                            />
                            <StatsCard
                                title="This Month"
                                value={testimonials.filter(t =>
                                    new Date(t.created_at).getMonth() === new Date().getMonth()
                                ).length}
                                icon={faCalendarAlt}
                                color={COLORS.accent1}
                            />
                            <StatsCard
                                title="Different Jobs"
                                value={new Set(testimonials.map(t => t.job).filter(Boolean)).size}
                                icon={faBriefcase}
                                color={COLORS.secondary}
                            />
                        </div> */}

                        {/* Charts */}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800">Testimonial Distribution</h3>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setChartView('pie')}
                                            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                                                chartView === 'pie'
                                                    ? 'bg-indigo-100 text-indigo-700'
                                                    : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            Pie
                                        </button>
                                        <button
                                            onClick={() => setChartView('area')}
                                            className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                                                chartView === 'area'
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
                                                    <linearGradient id="colorTestimonials" x1="0" y1="0" x2="0" y2="1">
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
                                                    dataKey="Testimonials"
                                                    stroke={COLORS.primary}
                                                    fillOpacity={1}
                                                    fill="url(#colorTestimonials)"
                                                />
                                            </AreaChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>
                            </div> */}

                            {/* Recent Activity */}
                            {/* <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Testimonials</h3>
                                <div className="space-y-4">
                                    {testimonials
                                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                        .slice(0, 5)
                                        .map((testimonial, index) => (
                                            <div key={index} className="flex items-start space-x-4">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mt-1">
                                                    <FontAwesomeIcon icon={faQuoteLeft} className="text-lg" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="font-medium text-gray-800">
                                                            {testimonial.first_name} {testimonial.last_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(testimonial.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <p 
                                                        className="text-sm text-gray-600 mt-1 line-clamp-2 cursor-pointer hover:text-indigo-600"
                                                        onClick={() => openDescriptionModal(testimonial)}
                                                    >
                                                        {truncateText(testimonial.description)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div> */}
                        </div>


                        {/* Add Testimonial Button */}
                        <div className="mb-6">
                            <button
                                onClick={() => {
                                    setSelectedTestimonial(null);
                                    setModalOpen(true);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Add Testimonial</span>
                            </button>
                        </div>

                        {/* Testimonials List - Table on desktop, Cards on mobile */}
                        {windowWidth < 768 ? (
                            // Mobile view - Cards
                            <div className="space-y-4">
                                {testimonials.map((testimonial) => (
                                    <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                                ))}
                            </div>
                        ) : (
                            // Desktop view - Table
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Testimonial</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {testimonials.map((testimonial) => (
                                            <tr key={testimonial.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {testimonial.created_by_details?.profile_picture ? (
                                                            <img 
                                                                src={testimonial.created_by_details.profile_picture} 
                                                                alt={`${testimonial.first_name} ${testimonial.last_name}`}
                                                                className="w-8 h-8 rounded-full object-cover mr-3"
                                                            />
                                                        ) : (
                                                            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 mr-3">
                                                                <FontAwesomeIcon icon={faUser} />
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-900">
                                                            {testimonial.first_name} {testimonial.last_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                    {testimonial.job || 'Not specified'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p 
                                                        className="text-gray-500 truncate max-w-xs cursor-pointer hover:text-indigo-600"
                                                        onClick={() => openDescriptionModal(testimonial)}
                                                    >
                                                        {truncateText(testimonial.description, 60)}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                    {new Date(testimonial.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTestimonial(testimonial);
                                                            setModalOpen(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(testimonial.id)}
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
                        )}

                        {/* Form Modal */}
                        <Modal
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            title={selectedTestimonial ? "Edit Testimonial" : "Add Testimonial"}
                        >
                            <TestimonialForm
                                testimonial={selectedTestimonial}
                                onSubmit={handleTestimonialSubmit}
                            />
                        </Modal>

                        {/* Description Modal */}
                        <DescriptionModal
                            isOpen={descriptionModalOpen}
                            onClose={() => setDescriptionModalOpen(false)}
                            testimonial={currentTestimonialDetails}
                            description={currentDescription}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default Job_Seeker_ManageTestimonials;