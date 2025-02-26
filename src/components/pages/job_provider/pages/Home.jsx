/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faImage, faPhone } from "@fortawesome/free-solid-svg-icons";

function Employer_Home() {
    const [advertisements, setAdvertisements] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, [advertisements]);

    const fetchData = async () => {
        try {
            const response = await axios.get("https://anaweza-backend.up.railway.app/advertisement/advertisements/");
            console.log("Retrieved Ads: ", response.data);
            
            // Check if response.data has a 'data' property that is an array
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setAdvertisements(response.data.data);
            } else if (Array.isArray(response.data)) {
                setAdvertisements(response.data);
            } else {
                console.error("Unexpected data format:", response.data);
                setAdvertisements([]);
            }
        } catch (error) {
            console.error("Error fetching advertisements:", error);
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => {
            // Calculate next index ensuring we don't go beyond available slides
            const maxIndex = Math.max(0, advertisements.length - 3);
            return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => {
            // Calculate previous index ensuring we don't go below 0
            const maxIndex = Math.max(0, advertisements.length - 3);
            return prevIndex <= 0 ? maxIndex : prevIndex - 1;
        });
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        if (advertisements.length > 3) {
            intervalRef.current = setInterval(nextSlide, 5000);
        }
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
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
                            className="w-full h-48 object-cover"
                        />
                        
                        ) : (
                            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                            </div>
                        )}
                    </div>
                    <p className="text-gray-700 mb-4">{ad.description || "No description available."}</p>
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faPhone} className="text-indigo-600 mr-3" />
                        <span className="text-gray-700">{ad.contact_info || "Contact info not provided"}</span>
                    </div>
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

    return (
        <section className="pt-24 pb-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* <h2 className="text-3xl font-bold text-center mb-8">Featured Advertisements</h2> */}
                <div className="relative">
                    {advertisements.length > 0 && (
                        <div className="overflow-hidden">
                            {/* This wrapper establishes a fixed window through which we see exactly 3 cards */}
                            <div className="w-full flex">
                                {/* This is the sliding container */}
                                <div 
                                    className="flex transition-transform ease-in-out duration-500 w-full"
                                    style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
                                >
                                    {advertisements.map((ad, index) => (
                                        <div 
                                            key={ad.id} 
                                            className="w-1/3 flex-shrink-0 p-2 cursor-pointer"
                                            onClick={() => {
                                                setSelectedAd(ad);
                                                setModalOpen(true);
                                            }}
                                        >
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                                                <div className="flex justify-center">
                                                    {ad.image ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${ad.image}`}
                                                            alt={ad.title}
                                                            className="h-24 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-2">{ad.title}</h3>
                                                    <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            {advertisements.length > 3 && (
                                <>
                                    <button 
                                        onClick={prevSlide} 
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white rounded-full z-10"
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} />
                                    </button>
                                    <button 
                                        onClick={nextSlide} 
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-gray-800 text-white rounded-full z-10"
                                    >
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {modalOpen && selectedAd && (
                    <AdDetailModal ad={selectedAd} onClose={() => setModalOpen(false)} />
                )}
            </div>
        </section>
    );
}


export default Employer_Home;
