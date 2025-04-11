/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const FeaturedSeekers = () => {
  // State for job seekers data
  const [featuredSeekers, setFeaturedSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // State for modal
  const [selectedSeeker, setSelectedSeeker] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch job seekers from API
  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await axios.get(
          "https://anaweza-backend.up.railway.app/job_seeker/all/"
        );
        // Filter only active job seekers
        const activeJobSeekers = response.data.filter(
          (seeker) => seeker.status === true
        );

        // Get 8 random job seekers from the active ones
        const randomizedSeekers = getRandomSeekers(activeJobSeekers, 8);
        setFeaturedSeekers(randomizedSeekers);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch job seekers");
        setLoading(false);
        console.error("Error fetching job seekers:", err);
      }
    };

    fetchJobSeekers();
  }, []);

  // Function to get N random elements from an array
  const getRandomSeekers = (array, count) => {
    // Create a copy of the original array to avoid modifying it
    const shuffled = [...array];

    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Return the first 'count' elements or all if count > array length
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  // Open modal with selected job seeker details
  const openModal = (seeker) => {
    setSelectedSeeker(seeker);
    setIsModalOpen(true);
    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = "hidden";
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeeker(null);
    // Re-enable scrolling
    document.body.style.overflow = "auto";
  };

  // Helper function to parse skills from string to array
  const parseSkills = (skillsString) => {
    if (!skillsString) return [];
    return skillsString.split(",").map((skill) => skill.trim());
  };

  // Format full name
  const formatFullName = (seeker) => {
    if (seeker.middle_name) {
      return `${seeker.first_name} ${seeker.middle_name} ${seeker.last_name}`;
    }
    return `${seeker.first_name} ${seeker.last_name}`;
  };

  // Get initials for the avatar
  const getInitials = (seeker) => {
    return `${seeker.first_name.charAt(0)}${seeker.last_name.charAt(0)}`;
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
          </div>
          <p className="text-gray-700 mt-4">
            {t("Discovering talented job seekers...")}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="talent-pool"
      className="py-16 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t("Top Talent Highlights")}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t(
              "Meet some of our exceptional job seekers ready to bring their expertise to your organization. Each candidate has been randomly selected from our talent pool."
            )}
          </p>
        </div>

        <div className="flex justify-end mb-6">
          <button
            className="flex items-center text-blue-700 hover:text-blue-800 font-medium transition duration-300"
            onClick={() => navigate("/job_seekers")}
          >
            {t("View All Candidates")}
            <svg
              className="w-5 h-5 ml-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>

        {featuredSeekers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <p className="text-gray-600 mt-4">
              {t("No active job seekers found at the moment.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSeekers.map((seeker) => {
              const skills = parseSkills(seeker.skills);
              return (
                <div
                  key={seeker.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                      {/* Profile picture or initials */}
                      <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-2 border-gray-100 shadow-sm">
                        {seeker.custom_user?.profile_picture ? (
                          <img
                            src={seeker.custom_user.profile_picture}
                            alt={formatFullName(seeker)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 text-2xl font-medium">
                              {getInitials(seeker)}
                            </span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg text-gray-900">
                        {formatFullName(seeker)}
                      </h3>
                      <p className="text-blue-700 font-medium">
                        {seeker.education_sector || seeker.education_level}
                      </p>
                      <div className="flex items-center text-gray-600 mt-2">
                        <svg
                          className="w-4 h-4 mr-1 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {seeker.experience} {t("years experience")}
                      </div>
                      <p className="text-blue-700 font-medium">
                        {t("Status")}:
                        <span className="text-gray-800 text-lg">
                          {typeof seeker.custom_user.status === "string"
                            ? t(seeker.custom_user.status)
                            : t(
                                seeker.custom_user.status
                                  ? "Active"
                                  : "Non-Active"
                              )}
                        </span>
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-600">
                          {seeker.user?.location || "Location not specified"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-sm">
                            +{skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {t("Salary")}:{" "}
                          <span className="font-medium">
                            {seeker.salary_range}
                          </span>
                        </span>
                        <button
                          className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors text-sm"
                          onClick={() => openModal(seeker)}
                        >
                          {t("View Profile")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedSeeker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-auto animate-fadeIn">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 flex flex-col items-center">
                  {/* Profile picture or initials in modal */}
                  <div className="w-32 h-32 rounded-full mb-4 overflow-hidden border-4 border-gray-100 shadow">
                    {selectedSeeker.custom_user?.profile_picture ? (
                      <img
                        src={selectedSeeker.custom_user.profile_picture}
                        alt={formatFullName(selectedSeeker)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 text-5xl font-medium">
                          {getInitials(selectedSeeker)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-blue-700 font-medium">
                        {t("Status")}:
                        <span className="text-gray-800 text-lg">
                          {typeof selectedSeeker.custom_user.status === "string"
                            ? t(selectedSeeker.custom_user.status)
                            : t(
                                selectedSeeker.custom_user.status
                                  ? "Active"
                                  : "Non-Active"
                              )}
                        </span>
                      </p>

                  <h2 className="text-xl text-gray-900 font-bold text-center">
                    {formatFullName(selectedSeeker)}
                  </h2>
                  <p className="text-gray-900 font-medium text-center">
                    <span className="text-blue-700">
                      {selectedSeeker.education_sector ||
                        selectedSeeker.education_level}
                    </span>
                  </p>

                  <div className="mt-6 w-full">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg text-blue-800 font-semibold mb-3">
                        {t("Contact Information")}
                      </h3>
                      <div className="space-y-3">
  

                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-700">
                            {selectedSeeker.district} -{" "}
                            {selectedSeeker.sector || "Location not specified"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        Experience
                      </h3>
                      <p className="text-gray-800 text-lg font-medium">
                        {selectedSeeker.experience} {t("years")}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        {t("Education")}
                      </h3>
                      <p className="text-gray-800 text-lg font-medium">
                        {selectedSeeker.education_level}
                      </p>
                      {selectedSeeker.education_sector && (
                        <p className="text-gray-600 mt-1">
                          {selectedSeeker.education_sector}
                        </p>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        {t("Gender")}
                      </h3>
                      <p className="text-gray-800 text-lg font-medium">
                        {selectedSeeker.gender}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <h3 className="font-semibold text-gray-700 mb-2">
                        {t("Salary Expectation")}
                      </h3>
                      <p className="text-gray-800 text-lg font-medium">
                        {selectedSeeker.salary_range}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-100 mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-blue-800">
                      {t("Key Skills")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {parseSkills(selectedSeeker.skills).map(
                        (skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-100">
              <div className="flex justify-between items-center">

                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  {t("Close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedSeekers;
