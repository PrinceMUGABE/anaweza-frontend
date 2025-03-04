/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faImage, faPhone } from "@fortawesome/free-solid-svg-icons";

function Advertisements() {
    const [advertisements, setAdvertisements] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoControls, setVideoControls] = useState({});
    const intervalRef = useRef(null);
    const cardsPerView = useRef(3);

    useEffect(() => {
        fetchData();
        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        startAutoScroll();
        return () => stopAutoScroll();
    }, [advertisements, cardsPerView.current]);

    const fetchData = async () => {
        try {
            const response = await axios.get("https://anaweza-backend.up.railway.app/advertisement/advertisements/");
            if (response.data && Array.isArray(response.data.data)) {
                setAdvertisements(response.data.data);
            } else {
                console.error("Unexpected data format:", response.data);
                setAdvertisements([]);
            }
        } catch (error) {
            console.error("Error fetching advertisements:", error);
        }
    };

    const handleResize = () => {
        if (window.innerWidth < 640) {
            cardsPerView.current = 1; // Small screens
        } else {
            cardsPerView.current = 3; // Large screens
        }
        setCurrentIndex(0); // Reset index on resize
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex + cardsPerView.current >= advertisements.length ? 0 : prevIndex + cardsPerView.current
        );
    };

    const startAutoScroll = () => {
        stopAutoScroll();
        if (advertisements.length > 1) {
            intervalRef.current = setInterval(nextSlide, 5000);
        }
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <section className="pt-24 pb-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="relative overflow-hidden">
                    <div className="flex w-full transition-transform ease-in-out duration-500" style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView.current)}%)` }}>
                        {advertisements.map((ad) => (
                            <div key={ad.id} className={`w-full sm:w-1/2 md:w-1/3 flex-shrink-0 p-2`} onClick={() => { setSelectedAd(ad); setModalOpen(true); }}> 
                                <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                                    <div className="flex justify-center">
                                        {ad.media?.type === "video" ? (
                                            <video 
                                                className="h-72 w-full object-cover " 
                                                controls={videoControls[ad.id] || false} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVideoControls(prev => ({ ...prev, [ad.id]: true }));
                                                }}
                                            >
                                                <source src={`data:video/mp4;base64,${ad.media.content}`} type="video/mp4" />
                                            </video>
                                        ) : ad.media?.type === "image" ? (
                                            <img src={`data:image/jpeg;base64,${ad.media.content}`} alt={ad.title} className="h-24 object-cover" />
                                        ) : (
                                            <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                                                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 mb-2">{ad.title}</h3>
                                        <button className="text-indigo-600 hover:text-indigo-800 font-medium">Show More</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {modalOpen && selectedAd && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedAd.title}</h3>
                            <div className="mb-4">
                                {selectedAd.media?.type === "video" ? (
                                    <video controls className="w-full h-72 object-cover">
                                        <source src={`data:video/mp4;base64,${selectedAd.media.content}`} type="video/mp4" />
                                    </video>
                                ) : selectedAd.media?.type === "image" ? (
                                    <img src={`data:image/jpeg;base64,${selectedAd.media.content}`} alt={selectedAd.title} className="w-full h-48 object-cover" />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 mb-4">{selectedAd.description || "No description available."}</p>
                            <div className="flex items-center">
                                <FontAwesomeIcon icon={faPhone} className="text-indigo-600 mr-3" />
                                <span className="text-gray-700">{selectedAd.contact_info || "Contact info not provided"}</span>
                            </div>
                            <div className="text-right mt-6">
                                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">Show Less</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Advertisements;