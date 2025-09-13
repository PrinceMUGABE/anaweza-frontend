/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import districtsData from "../../job seeker/rwanda_districts.json";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  Calendar,
  Camera,
  Upload,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Star,
  Award,
  Clock,
  Building,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ChevronRight,
} from "lucide-react";

function Job_seeker_Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [jobSeekerData, setJobSeekerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUserInfoEditing, setIsUserInfoEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [additionalFees, setAdditionalFees] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Skills management state
  const [skillsData, setSkillsData] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", experience: "" });
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [skillErrors, setSkillErrors] = useState({});

  const { t } = useTranslation();

  // Form data for CustomUser
  const [userFormData, setUserFormData] = useState({
    phone_number: "",
    email: "",
    role: "",
    profile_picture: null,
    status: true,
  });

  // Form data for JobSeeker
  const [jobSeekerFormData, setJobSeekerFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    experience: 0,
    education_level: "",
    education_sector: "",
    salary_range: "",
    status: true,
    district: "",
    sector: "",
  });

  // For image preview
  const [previewImage, setPreviewImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageOption, setImageOption] = useState("upload");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Original salary range to compare for fee calculation
  const [originalSalaryRange, setOriginalSalaryRange] = useState("");

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = JSON.parse(
        localStorage.getItem("userData")
      )?.access_token;

      if (!accessToken) {
        throw new Error("Access token is missing!");
      }

      const response = await fetch(
        "https://anaweza-backend.up.railway.app/job_seeker/user/details/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching user details: ${response.status}`);
      }

      const data = await response.json();
      console.log("Retrieved user data:", data);

      setUserData(data.custom_user);
      setJobSeekerData(data.job_seeker);

      // Set skills data from the enhanced backend response
      setSkillsData(data.job_seeker.skills_with_experience || []);

      setUserFormData({
        phone_number: data.custom_user.phone_number || "",
        email: data.custom_user.email || "",
        role: data.custom_user.role || "",
        profile_picture: null,
        status:
          typeof data.custom_user.status === "boolean"
            ? data.custom_user.status
            : data.custom_user.status === "Active" ||
              data.custom_user.status === "true",
      });

      setJobSeekerFormData({
        first_name: data.job_seeker.first_name || "",
        middle_name: data.job_seeker.middle_name || "",
        last_name: data.job_seeker.last_name || "",
        gender: data.job_seeker.gender || "",
        experience:
          data.job_seeker.calculated_experience ||
          data.job_seeker.experience ||
          0,
        education_level: data.job_seeker.education_level || "",
        education_sector: data.job_seeker.education_sector || "",
        salary_range: data.job_seeker.salary_range || "",
        status:
          typeof data.job_seeker.status === "boolean"
            ? data.job_seeker.status
            : data.job_seeker.status === "Active" ||
              data.job_seeker.status === "true",
        district: data.job_seeker.district || "",
        sector: data.job_seeker.sector || "",
      });

      setOriginalSalaryRange(data.job_seeker.salary_range || "");

      if (data.custom_user.profile_picture) {
        setPreviewImage(data.custom_user.profile_picture);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Skills Management Functions
  const validateSkill = (skillName, experience) => {
    const errors = {};

    if (!skillName || !skillName.trim()) {
      errors.name = "Skill name is required";
    }

    if (experience && !/^(\d+(-\d+)?|\d+\+)$/.test(experience.trim())) {
      errors.experience = 'Experience must be in format "1-3", "5+", or "2"';
    }

    // Check for duplicate skills
    if (
      skillsData.some(
        (skill) => skill.name.toLowerCase() === skillName.toLowerCase()
      )
    ) {
      errors.name = "This skill already exists";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleAddSkill = () => {
    const { isValid, errors } = validateSkill(
      newSkill.name,
      newSkill.experience
    );

    if (!isValid) {
      setSkillErrors(errors);
      return;
    }

    const updatedSkills = [...skillsData, { ...newSkill }];
    setSkillsData(updatedSkills);
    setNewSkill({ name: "", experience: "" });
    setIsAddingSkill(false);
    setSkillErrors({});
  };

  const handleRemoveSkill = (index) => {
    const updatedSkills = skillsData.filter((_, i) => i !== index);
    setSkillsData(updatedSkills);
  };

  const handleEditSkill = (index, updatedSkill) => {
    const { isValid, errors } = validateSkill(
      updatedSkill.name,
      updatedSkill.experience
    );

    if (!isValid) {
      setSkillErrors({ [`edit_${index}`]: errors });
      return;
    }

    const updatedSkills = [...skillsData];
    updatedSkills[index] = updatedSkill;
    setSkillsData(updatedSkills);
    setSkillErrors({});
  };

  // Calculate registration and renewal fees based on salary range
  const calculateFees = (salaryRange) => {
    const salary = parseInt(salaryRange.replace(/,/g, "")) || 0;

    if (salary < 100000) {
      return { registrationFee: 2000, renewalFee: 1000 };
    } else if (salary >= 100000 && salary < 200000) {
      return { registrationFee: 5000, renewalFee: 2500 };
    } else if (salary >= 200000 && salary < 500000) {
      return { registrationFee: 10000, renewalFee: 5000 };
    } else {
      return { registrationFee: 20000, renewalFee: 10000 };
    }
  };

  const calculateAdditionalFees = (newSalaryRange) => {
    if (!jobSeekerData || !originalSalaryRange) return null;

    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    if (newFees.registrationFee > originalFees.registrationFee) {
      return {
        additionalRegistrationFee:
          newFees.registrationFee - originalFees.registrationFee,
        additionalRenewalFee: newFees.renewalFee - originalFees.renewalFee,
        totalAdditional:
          newFees.registrationFee -
          originalFees.registrationFee +
          (newFees.renewalFee - originalFees.renewalFee),
      };
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "experience") {
      if (value < 0) {
        setErrors((prev) => ({
          ...prev,
          experience: t("Experience cannot be negative"),
        }));
      } else {
        setErrors((prev) => ({ ...prev, experience: "" }));
      }
    }

    if (name === "salary_range") {
      const salaryRangeRegex = /^\d+(\s*-\s*\d+)?$/;
      if (value && !salaryRangeRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          salary_range:
            'Salary range must be in format "1000" or "1000 - 2000"',
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.salary_range;
          return newErrors;
        });
      }
    }

    if (name === "district") {
      setJobSeekerFormData((prevState) => ({
        ...prevState,
        district: value,
        sector: "",
      }));
    } else {
      setJobSeekerFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (imageOption === "webcam") {
      startCapture();
    } else {
      stopCapture();
    }
  }, [imageOption]);

  useEffect(() => {
    if (jobSeekerFormData.district) {
      setSectors(
        districtsData.districts[jobSeekerFormData.district]?.sectors || []
      );
    } else {
      setSectors([]);
    }
  }, [jobSeekerFormData.district]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);

    if (!isEditing) {
      stopCapture();
      setImageOption("upload");

      if (userData && jobSeekerData) {
        setUserFormData({
          phone_number: userData.phone_number || "",
          email: userData.email || "",
          role: userData.role || "",
          profile_picture: null,
          status:
            typeof userData.status === "boolean"
              ? userData.status
              : userData.status === "Active" || userData.status === "true",
        });

        setJobSeekerFormData({
          first_name: jobSeekerData.first_name || "",
          middle_name: jobSeekerData.middle_name || "",
          last_name: jobSeekerData.last_name || "",
          gender: jobSeekerData.gender || "",
          experience:
            jobSeekerData.calculated_experience ||
            jobSeekerData.experience ||
            0,
          education_level: jobSeekerData.education_level || "",
          education_sector: jobSeekerData.education_sector || "",
          salary_range: jobSeekerData.salary_range || "",
          status:
            typeof jobSeekerData.status === "boolean"
              ? jobSeekerData.status
              : jobSeekerData.status === "Active" ||
                jobSeekerData.status === "true",
          district: jobSeekerData.district || "",
          sector: jobSeekerData.sector || "",
        });

        // Reset skills to current state
        setSkillsData(jobSeekerData.skills_with_experience || []);
      }

      setAdditionalFees(null);
      setIsAddingSkill(false);
      setNewSkill({ name: "", experience: "" });
      setSkillErrors({});
    }
  };

  const handleUserChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleJobSeekerChange = (e) => {
    const { name, value } = e.target;

    setJobSeekerFormData({
      ...jobSeekerFormData,
      [name]: value,
    });

    if (name === "salary_range") {
      const fees = calculateAdditionalFees(value);
      setAdditionalFees(fees);
    }
  };

  const handleImageOptionChange = (e) => {
    setImageOption(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setUserFormData({
        ...userFormData,
        profile_picture: reader.result,
      });
    };
    reader.readAsDataURL(file);

    stopCapture();
    setImageOption("upload");
  };

  const startCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setIsCapturing(false);
      setImageOption("upload");
    }
  };

  const stopCapture = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/jpeg");
    setPreviewImage(imageData);
    setUserFormData({
      ...userFormData,
      profile_picture: imageData,
    });

    setImageOption("upload");
    stopCapture();
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setUserFormData({
      ...userFormData,
      profile_picture: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const accessToken = JSON.parse(
      localStorage.getItem("userData")
    )?.access_token;

    if (!accessToken) {
      console.error("Access token is missing!");
      setSaveLoading(false);
      return;
    }

    // Prepare the updated data with enhanced skills structure
    const updatedData = {
      custom_user: {
        phone_number: userFormData.phone_number,
        email: userFormData.email,
        role: userFormData.role,
        profile_picture: userFormData.profile_picture,
        status: userFormData.status,
      },
      job_seeker: {
        first_name: jobSeekerFormData.first_name,
        middle_name: jobSeekerFormData.middle_name,
        last_name: jobSeekerFormData.last_name,
        gender: jobSeekerFormData.gender,
        skills: JSON.stringify(skillsData), // Send skills as JSON string
        education_level: jobSeekerFormData.education_level,
        education_sector: jobSeekerFormData.education_sector,
        salary_range: jobSeekerFormData.salary_range,
        status: jobSeekerFormData.status,
        district: jobSeekerFormData.district,
        sector: jobSeekerFormData.sector,
      },
    };

    const newSalaryRange = jobSeekerFormData.salary_range;
    const originalFees = calculateFees(originalSalaryRange);
    const newFees = calculateFees(newSalaryRange);

    if (newFees.registrationFee > originalFees.registrationFee) {
      updatedData.job_seeker.registration_fee = newFees.registrationFee;
      updatedData.job_seeker.renewal_fee = newFees.renewalFee;
    } else {
      updatedData.job_seeker.registration_fee = jobSeekerData.registration_fee;
      updatedData.job_seeker.renewal_fee = jobSeekerData.renewal_fee;
    }

    try {
      const response = await fetch(
        "https://anaweza-backend.up.railway.app/job_seeker/user/update/",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data.custom_user);
        setJobSeekerData(data.job_seeker);
        setSkillsData(data.job_seeker.skills_with_experience || []);
        setOriginalSalaryRange(data.job_seeker.salary_range);
        setIsEditing(false);
        setAdditionalFees(null);
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          "Failed to update user data:",
          response.status,
          errorData
        );
        setMessage(
          `Update failed: ${
            errorData.detail || errorData.message || "Unknown error"
          }`
        );
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setMessage("Network or server error occurred");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper component for skills display
  const SkillsDisplay = ({ skills, isEditable = false }) => {
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editingSkill, setEditingSkill] = useState({
      name: "",
      experience: "",
    });

    const handleStartEdit = (index, skill) => {
      setEditingIndex(index);
      setEditingSkill({ ...skill });
    };

    const handleSaveEdit = (index) => {
      handleEditSkill(index, editingSkill);
      setEditingIndex(-1);
      setEditingSkill({ name: "", experience: "" });
    };

    const handleCancelEdit = () => {
      setEditingIndex(-1);
      setEditingSkill({ name: "", experience: "" });
    };

    if (!skills || skills.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Star className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-lg font-medium">{t("No skills added yet")}</p>
          <p className="text-sm">{t("Add your first skill to get started")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            {editingIndex === index ? (
              <div className="flex-1 flex items-center space-x-3">
                <input
                  type="text"
                  value={editingSkill.name}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, name: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Skill name"
                />
                <input
                  type="text"
                  value={editingSkill.experience}
                  onChange={(e) =>
                    setEditingSkill({
                      ...editingSkill,
                      experience: e.target.value,
                    })
                  }
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-3"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition duration-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-800">
                      {skill.name}
                    </span>
                    {skill.experience && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill.experience} {t("years")}
                      </span>
                    )}
                  </div>
                </div>
                {isEditable && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartEdit(index, skill)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {skillErrors[`edit_${editingIndex}`] && (
          <div className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {Object.values(skillErrors[`edit_${editingIndex}`]).join(", ")}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-lg text-gray-600 font-medium">
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Error Loading Profile</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserDetails}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !jobSeekerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-lg text-gray-600">{t("No user data found.")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      {/* Success/Error Messages */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.includes("successfully")
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          } animate-slide-in-right`}
        >
          <div className="flex items-center space-x-2">
            {message.includes("successfully") ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-end space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {previewImage || userData.profile_picture ? (
                    <img
                      src={previewImage || userData.profile_picture}
                      alt="Profile"
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-white bg-opacity-90 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {isEditing && (
                    <button
                      onClick={() =>
                        document.getElementById("profile-upload").click()
                      }
                      className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition duration-200"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="text-white pb-4">
                  <h1 className="text-3xl font-bold mb-2">
                    {jobSeekerData.first_name} {jobSeekerData.middle_name}{" "}
                    {jobSeekerData.last_name}
                  </h1>
                  <p className="text-blue-100 text-lg mb-1">
                    {t(userData.role)}
                  </p>
                  <div className="flex items-center space-x-4 text-blue-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {jobSeekerData.district}, {jobSeekerData.sector}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {jobSeekerData.calculated_experience ||
                          jobSeekerData.experience}{" "}
                        years exp.
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>{skillsData?.length || 0} skills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={handleEditClick}
              className={`absolute top-6 right-6 px-6 py-3 rounded-xl font-semibold transition duration-200 shadow-lg ${
                isEditing
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white hover:bg-gray-50 text-gray-700"
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  {t("Cancel")}
                </>
              ) : (
                <>
                  <Edit3 className="w-5 h-5 mr-2" />
                  {t("Edit Profile")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hidden File Input for Profile Picture */}
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  {t("Personal Information")}
                </h2>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* User Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Email")}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={userFormData.email}
                            onChange={handleUserChange}
                            className="w-full pl-10 text-gray-500 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Phone Number")}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="phone_number"
                            value={userFormData.phone_number}
                            onChange={handleUserChange}
                            className="w-full pl-10 text-gray-500 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* JobSeeker Information Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("First Name")}
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={jobSeekerFormData.first_name}
                          onChange={handleJobSeekerChange}
                          className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Middle Name")}
                        </label>
                        <input
                          type="text"
                          name="middle_name"
                          value={jobSeekerFormData.middle_name}
                          onChange={handleJobSeekerChange}
                          className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter middle name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Last Name")}
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={jobSeekerFormData.last_name}
                          onChange={handleJobSeekerChange}
                          className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Gender")}
                        </label>
                        <select
                          name="gender"
                          value={jobSeekerFormData.gender}
                          onChange={handleJobSeekerChange}
                          className="w-full px-4 text-gray-500 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">{t("Select Gender")}</option>
                          <option value="Male">{t("Male")}</option>
                          <option value="Female">{t("Female")}</option>
                          <option value="Other">{t("Other")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Experience (Years)")}
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            name="experience"
                            value={jobSeekerFormData.experience}
                            onChange={handleJobSeekerChange}
                            min="0"
                            className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Years of experience"
                          />
                        </div>
                        {errors.experience && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.experience}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("District")}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            name="district"
                            value={jobSeekerFormData.district}
                            onChange={handleJobSeekerChange}
                            className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">{t("Select District")}</option>
                            {Object.keys(districtsData.districts).map(
                              (district) => (
                                <option key={district} value={district}>
                                  {district}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Sector")}
                        </label>
                        <select
                          name="sector"
                          value={jobSeekerFormData.sector}
                          onChange={handleJobSeekerChange}
                          disabled={!jobSeekerFormData.district}
                          className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">{t("Select Sector")}</option>
                          {sectors.map((sector) => (
                            <option key={sector} value={sector}>
                              {sector}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Education and Salary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Education Level")}
                        </label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            name="education_level"
                            value={jobSeekerFormData.education_level}
                            onChange={handleJobSeekerChange}
                            className="w-full text-gray-500 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">
                              {t("Select Education Level")}
                            </option>
                            <option value="none">
                              {t("No Formal Education")}
                            </option>
                            <option value="primary">
                              {t("Primary Education")}
                            </option>
                            <option value="ordinary_level">
                              {t("Ordinary Level")}
                            </option>
                            <option value="secondary">
                              {t("Secondary Education")}
                            </option>
                            <option value="vocational">
                              {t("Vocational Training")}
                            </option>
                            <option value="advanced_diploma">
                              {t("Advanced Diploma")}
                            </option>
                            <option value="bachelor">
                              {t("Bachelor's Degree")}
                            </option>
                            <option value="master">
                              {t("Master's Degree")}
                            </option>
                            <option value="phd">{t("PhD")}</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t("Education Sector")}
                        </label>
                        <input
                          type="text"
                          name="education_sector"
                          value={jobSeekerFormData.education_sector}
                          onChange={handleJobSeekerChange}
                          className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Computer Science, Engineering"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t("Salary Range (RWF)")}
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="salary_range"
                          value={jobSeekerFormData.salary_range}
                          onChange={handleJobSeekerChange}
                          className="w-full pl-10 text-gray-500 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 100000 or 100000 - 200000"
                        />
                      </div>
                      {errors.salary_range && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.salary_range}
                        </p>
                      )}
                      {additionalFees && (
                        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <h4 className="font-semibold text-yellow-800">
                              {t("Additional Fees Required")}
                            </h4>
                          </div>
                          <div className="text-sm text-yellow-700 space-y-1">
                            <p>
                              {t("Registration Fee")}: +
                              {additionalFees.additionalRegistrationFee.toLocaleString()}{" "}
                              RWF
                            </p>
                            <p>
                              {t("Renewal Fee")}: +
                              {additionalFees.additionalRenewalFee.toLocaleString()}{" "}
                              RWF
                            </p>
                            <p className="font-semibold text-gray-500 border-t border-yellow-300 pt-2">
                              {t("Total Additional")}:{" "}
                              {additionalFees.totalAdditional.toLocaleString()}{" "}
                              RWF
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save/Cancel Buttons */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleEditClick}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-200"
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={saveLoading || Object.keys(errors).length > 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
                      >
                        {saveLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {t("Saving...")}
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            {t("Save Changes")}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Email")}
                          </p>
                          <p className="text-gray-900">
                            {userData.email || t("Not provided")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Phone")}
                          </p>
                          <p className="text-gray-900">
                            {userData.phone_number || t("Not provided")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Gender")}
                          </p>
                          <p className="text-gray-900">
                            {t(jobSeekerData.gender) || t("Not specified")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Experience")}
                          </p>
                          <p className="text-gray-900">
                            {jobSeekerData.calculated_experience ||
                              jobSeekerData.experience}{" "}
                            {t("years")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Education")}
                          </p>
                          <p className="text-gray-900">
                            {t(jobSeekerData.education_level)}
                            {jobSeekerData.education_sector &&
                              ` in ${jobSeekerData.education_sector}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t("Location")}
                          </p>
                          <p className="text-gray-900">
                            {jobSeekerData.district}, {jobSeekerData.sector}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t("Salary Range")}
                        </p>
                        <p className="text-gray-900">
                          {jobSeekerData.salary_range
                            ? `${jobSeekerData.salary_range} RWF`
                            : t("Not specified")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-blue-600" />
                    {t("Skills & Experience")}
                  </h2>
                  {isEditing && (
                    <button
                      onClick={() => setIsAddingSkill(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("Add Skill")}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Add Skill Form */}
                {isEditing && isAddingSkill && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {t("Add New Skill")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Skill Name")}
                        </label>
                        <input
                          type="text"
                          value={newSkill.name}
                          onChange={(e) =>
                            setNewSkill({ ...newSkill, name: e.target.value })
                          }
                          className="w-fulltext-gray-500 text-gray-500 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., JavaScript, Project Management"
                        />
                        {skillErrors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {skillErrors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Experience")}
                        </label>
                        <input
                          type="text"
                          value={newSkill.experience}
                          onChange={(e) =>
                            setNewSkill({
                              ...newSkill,
                              experience: e.target.value,
                            })
                          }
                          className="w-full text-gray-500 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 1-3, 5+"
                        />
                        {skillErrors.experience && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {skillErrors.experience}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-3 mt-4">
                      <button
                        onClick={() => {
                          setIsAddingSkill(false);
                          setNewSkill({ name: "", experience: "" });
                          setSkillErrors({});
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition duration-200"
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                      >
                        {t("Add Skill")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Skills Display */}
                <SkillsDisplay skills={skillsData} isEditable={isEditing} />
              </div>
            </div>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  {t("Account Status")}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("Profile Status")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (
                          typeof userData.status === "boolean"
                            ? userData.status
                            : userData.status === "Active"
                        )
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(
                        typeof userData.status === "boolean"
                          ? userData.status
                          : userData.status === "Active"
                      )
                        ? t("Active")
                        : t("Inactive")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("Job Seeker Status")}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (
                          typeof jobSeekerData.status === "boolean"
                            ? jobSeekerData.status
                            : jobSeekerData.status === "Active"
                        )
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(
                        typeof jobSeekerData.status === "boolean"
                          ? jobSeekerData.status
                          : jobSeekerData.status === "Active"
                      )
                        ? t("Active")
                        : t("Inactive")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Fees Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  {t("Registration Fees")}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("Registration Fee")}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {jobSeekerData.registration_fee
                        ? `${jobSeekerData.registration_fee.toLocaleString()} RWF`
                        : t("Not set")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t("Renewal Fee")}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {jobSeekerData.renewal_fee
                        ? `${jobSeekerData.renewal_fee.toLocaleString()} RWF`
                        : t("Not set")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-blue-500" />
                  {t("Quick Actions")}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("View Applications")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {t("Browse Jobs")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* <button className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg transition duration-200">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{t("Certificates")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Webcam Modal (if using webcam capture) */}
        {isEditing && imageOption === "webcam" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {t("Capture Photo")}
                </h3>
                <button
                  onClick={() => setImageOption("upload")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full rounded-lg bg-gray-100"
                    style={{ maxHeight: "300px" }}
                  />
                  {!isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">
                          {t("Starting camera...")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setImageOption("upload")}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={captureImage}
                    disabled={!isCapturing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {t("Capture")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {isEditing && previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {t("Profile Picture Preview")}
                </h3>
                <button
                  onClick={handleRemoveImage}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-48 h-48 object-cover rounded-2xl border-4 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Image Source")}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageSource"
                          value="upload"
                          checked={imageOption === "upload"}
                          onChange={handleImageOptionChange}
                          className="mr-2"
                        />
                        <Upload className="w-4 h-4 mr-1" />
                        {t("Upload")}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="imageSource"
                          value="webcam"
                          checked={imageOption === "webcam"}
                          onChange={handleImageOptionChange}
                          className="mr-2"
                        />
                        <Camera className="w-4 h-4 mr-1" />
                        {t("Camera")}
                      </label>
                    </div>
                  </div>

                  <div>
                    {imageOption === "upload" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Upload New")}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={handleRemoveImage}
                    className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-200"
                  >
                    {t("Remove")}
                  </button>
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {t("Keep")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        /* Custom scrollbar for skill containers */
        .skills-container::-webkit-scrollbar {
          width: 6px;
        }

        .skills-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .skills-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .skills-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Smooth transitions for form elements */
        input[type="text"],
        input[type="email"],
        input[type="number"],
        select,
        textarea {
          transition: all 0.2s ease-in-out;
        }

        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="number"]:focus,
        select:focus,
        textarea:focus {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        /* Button hover effects */
        .btn-hover-effect {
          transition: all 0.2s ease-in-out;
        }

        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        /* Card hover effects */
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease-in-out;
        }

        /* Profile picture hover effect */
        .profile-picture-container {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease-in-out;
        }

        .profile-picture-container:hover {
          transform: scale(1.05);
        }

        /* Skills tag animation */
        .skill-tag {
          transition: all 0.2s ease-in-out;
        }

        .skill-tag:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Loading animation enhancement */
        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Form validation styling */
        .form-error {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .form-success {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Modal backdrop blur effect */
        .modal-backdrop {
          backdrop-filter: blur(8px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }

          .profile-picture-container {
            margin-bottom: 1rem;
          }

          .grid-responsive {
            grid-template-columns: 1fr;
          }
        }

        /* Dark mode support (if needed in future) */
        @media (prefers-color-scheme: dark) {
          .dark-mode-card {
            background-color: #1f2937;
            border-color: #374151;
          }

          .dark-mode-text {
            color: #f9fafb;
          }

          .dark-mode-text-secondary {
            color: #d1d5db;
          }
        }
      `}</style>
    </div>
  );
}

export default Job_seeker_Profile;
