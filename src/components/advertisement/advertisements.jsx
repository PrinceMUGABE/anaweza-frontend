/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight, faImage, faPhone, faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import crystalBallVideo from "../../assets/pictures/videos/video game2.mp4";
import { useTranslation } from "react-i18next";

function Advertisements() {
    const [advertisements, setAdvertisements] = useState([]);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [videoPlaying, setVideoPlaying] = useState({});
    const intervalRef = useRef(null);
    const cardsPerView = useRef(3);
    const videoRefs = useRef({});

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
            let adsData = [];
            
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
                adsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                adsData = response.data;
            } else {
                console.error("Unexpected data format:", response.data);
                adsData = [];
            }
            
            // Create three local video advertisements with different titles
            const localVideoAds = [
                {
                    id: "local-video-1",
                    title: "Crystalball",
                    description: "Crystal Ball – A thrilling new tabletop football game that blends skill, strategy, and excitement! Challenge your friends, score epic goals, and experience football like never before. Are you ready to play?",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                },
                {
                    id: "local-video-2",
                    title: "Crystalball",
                    description: "Crystal Ball – A thrilling new tabletop football game that blends skill, strategy, and excitement! Challenge your friends, score epic goals, and experience football like never before. Are you ready to play?",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                },
                {
                    id: "local-video-3",
                    title: "Crystalball",
                    description: "Crystal Ball – A thrilling new tabletop football game that blends skill, strategy, and excitement! Challenge your friends, score epic goals, and experience football like never before. Are you ready to play?",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                }
            ];
            
            // Shuffle the advertisements to mix local videos with API ads
            const shuffledAds = shuffleArray([...adsData, ...localVideoAds]);
            setAdvertisements(shuffledAds);
        } catch (error) {
            console.error("Error fetching advertisements:", error);
            
            // Even if API fails, still show the local videos
            const localVideoAds = [
                {
                    id: "local-video-1",
                    title: "Featured Video 1",
                    description: "Our main promotional video",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                },
                {
                    id: "local-video-2",
                    title: "Featured Video 2",
                    description: "Check out our second promotional video",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                },
                {
                    id: "local-video-3",
                    title: "Featured Video 3",
                    description: "Watch our third promotional video",
                    contact_info: "Contact us for more information",
                    media: {
                        type: "local-video",
                        path: crystalBallVideo
                    }
                }
            ];
            
            setAdvertisements(localVideoAds);
        }
    };

    // Fisher-Yates shuffle algorithm to mix the advertisements
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Setup video loop when a video ref is created
    useEffect(() => {
        Object.keys(videoRefs.current).forEach(id => {
            const videoElement = videoRefs.current[id];
            if (videoElement) {
                // Set loop count for local videos
                if (id.startsWith('local-video-')) {
                    let loopCount = 0;
                    videoElement.addEventListener('ended', function() {
                        if (loopCount < 2) { // Loop 3 times (initial play + 2 more)
                            videoElement.play();
                            loopCount++;
                        } else {
                            // Reset play state when loops are done
                            setVideoPlaying(prev => ({ ...prev, [id]: false }));
                        }
                    });
                }
            }
        });
    }, [advertisements]);

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

    const handleVideoClick = (e, adId) => {
        e.stopPropagation(); // Prevent opening the modal when clicking on video
        
        const videoElement = videoRefs.current[adId];
        if (videoElement) {
            if (videoPlaying[adId]) {
                videoElement.pause();
            } else {
                videoElement.play();
            }
            
            setVideoPlaying(prev => ({ 
                ...prev, 
                [adId]: !prev[adId] 
            }));
        }
    };

    const renderMedia = (ad) => {
        if (ad.media?.type === "video") {
            return (
                <div className="relative h-72 w-full">
                    <video 
                        className="h-72 w-full object-cover"
                        ref={el => videoRefs.current[ad.id] = el}
                    >
                        <source src={`data:video/mp4;base64,${ad.media.content}`} type="video/mp4" />
                    </video>
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                        onClick={(e) => handleVideoClick(e, ad.id)}
                    >
                        <FontAwesomeIcon 
                            icon={videoPlaying[ad.id] ? faPause : faPlay} 
                            className="text-white text-4xl" 
                        />
                    </div>
                </div>
            );
        } else if (ad.media?.type === "local-video") {
            return (
                <div className="relative h-72 w-full">
                    <video 
                        className="h-72 w-full object-cover"
                        ref={el => videoRefs.current[ad.id] = el}
                    >
                        <source src={ad.media.path} type="video/mp4" />
                    </video>
                    <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                        onClick={(e) => handleVideoClick(e, ad.id)}
                    >
                        <FontAwesomeIcon 
                            icon={videoPlaying[ad.id] ? faPause : faPlay} 
                            className="text-white text-4xl" 
                        />
                    </div>
                </div>
            );
        } else if (ad.media?.type === "image") {
            return (
                <img src={`data:image/jpeg;base64,${ad.media.content}`} alt={ad.title} className="h-72 w-full object-cover" />
            );
        } else {
            return (
                <div className="w-full h-72 bg-gray-100 flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                </div>
            );
        }
    };

    const renderModalMedia = (ad) => {
        if (ad.media?.type === "video") {
            return (
                <video controls className="w-full h-72 object-cover">
                    <source src={`data:video/mp4;base64,${ad.media.content}`} type="video/mp4" />
                </video>
            );
        } else if (ad.media?.type === "local-video") {
            return (
                <video 
                    controls 
                    className="w-full h-72 object-cover"
                    ref={el => {
                        if (el) {
                            let loopCount = 0;
                            el.addEventListener('ended', function() {
                                if (loopCount < 2) { // Loop 3 times
                                    el.play();
                                    loopCount++;
                                }
                            });
                        }
                    }}
                >
                    <source src={ad.media.path} type="video/mp4" />
                </video>
            );
        } else if (ad.media?.type === "image") {
            return (
                <img src={`data:image/jpeg;base64,${ad.media.content}`} alt={ad.title} className="w-full h-48 object-cover" />
            );
        } else {
            return (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-gray-400 text-4xl" />
                </div>
            );
        }
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
                                        {renderMedia(ad)}
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
                                {renderModalMedia(selectedAd)}
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