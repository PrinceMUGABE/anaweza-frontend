/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faArrowRight, 
  faImage, 
  faPhone, 
  faFilter,
  faSort
} from "@fortawesome/free-solid-svg-icons";

function Job_Seeker_Advertisements() {
    const [advertisements, setAdvertisements] = useState([]);
    const [filteredAds, setFilteredAds] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [category, setCategory] = useState("all");
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterAdvertisements();
    }, [advertisements, category, itemsPerPage]);

    const fetchData = async () => {
        try {
            const response = await axios.get("https://anaweza-backend.up.railway.app/advertisement/advertisements/");
            console.log("Retrieved Ads: ", response.data);
            
            let adsData = [];
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                adsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                adsData = response.data;
            } else {
                console.error("Unexpected data format:", response.data);
            }
            
            // Add created_at property if not exists for testing
            adsData = adsData.map(ad => ({
                ...ad,
                created_at: ad.created_at || new Date().toISOString()
            }));
            
            setAdvertisements(adsData);
        } catch (error) {
            console.error("Error fetching advertisements:", error);
        }
    };

    const filterAdvertisements = () => {
        let filtered = [...advertisements];
        
        // Filter by category
        if (category === "recent") {
            // Get ads from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(ad => {
                const adDate = new Date(ad.created_at);
                return adDate >= sevenDaysAgo;
            });
        }
        
        // Sort by newest first (assuming created_at is a date string)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setFilteredAds(filtered);
        setCurrentPage(1); // Reset to first page when filtering changes
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAds.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const AdDetailModal = ({ ad, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{ad.title}</h3>
                    <div className="mb-4">
                        {ad.image ? (
                            <img
                                src={`data:image/jpeg;base64,${ad.image.startsWith("data:image") ? ad.image.split(",")[1] : ad.image}`}
                                alt={ad.title}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                            </div>
                        )}
                    </div>
                    <p className="text-gray-700 mb-4">{ad.description || "No description available."}</p>
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faPhone} className="text-indigo-600 mr-3" />
                        <span className="text-gray-700">{ad.contact_info || "Contact info not provided"}</span>
                    </div>
                    {/* <div className="mt-2 text-sm text-gray-500">
                        Posted: {new Date(ad.created_at).toLocaleDateString()}
                    </div> */}
                    <div className="text-right mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const FilterPanel = () => (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <div className="flex space-x-2">
                        <button 
                            className={`px-3 py-1 rounded-md text-sm ${category === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            onClick={() => setCategory("all")}
                        >
                            All Advertisements
                        </button>
                        <button 
                            className={`px-3 py-1 rounded-md text-sm ${category === 'recent' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                            onClick={() => setCategory("recent")}
                        >
                            Recent (7 Days)
                        </button>
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Page</label>
                    <select 
                        className="block w-full pl-3 text-gray-500 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        <option value={6}>6</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <section className="pt-24 pb-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Job Advertisements</h2>
                    <button 
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        <span>Filter</span>
                    </button>
                </div>
                
                {filterOpen && <FilterPanel />}
                
                {currentItems.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {currentItems.map((ad) => (
                                <div 
                                    key={ad.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                    onClick={() => {
                                        setSelectedAd(ad);
                                        setModalOpen(true);
                                    }}
                                >
                                    <div className="flex justify-center">
                                        {ad.image ? (
                                            <img
                                                src={`data:image/jpeg;base64,${ad.image}`}
                                                alt={ad.title}
                                                className="w-full h-40 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-2">{ad.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                            {ad.description || "No description available."}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            {/* <span className="text-xs text-gray-500">
                                                {new Date(ad.created_at).toLocaleDateString()}
                                            </span> */}
                                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Pagination */}
                        <div className="mt-8 flex justify-center">
                            <nav className="flex items-center space-x-2">
                                <button 
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} />
                                </button>
                                
                                {/* Generate page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => paginate(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                                currentPage === pageNum
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="text-gray-500">...</span>
                                        <button
                                            onClick={() => paginate(totalPages)}
                                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-200"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                                
                                <button 
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </nav>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-gray-600">No advertisements found.</p>
                    </div>
                )}

                {modalOpen && selectedAd && (
                    <AdDetailModal ad={selectedAd} onClose={() => setModalOpen(false)} />
                )}
            </div>
        </section>
    );
}

export default Job_Seeker_Advertisements;