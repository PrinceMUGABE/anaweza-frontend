/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  AiOutlineCloudUpload,
  AiOutlineInfoCircle,
  AiOutlinePlus,
  AiOutlineDelete,
} from "react-icons/ai";
import { FiCheck, FiX, FiEdit3 } from "react-icons/fi";
import { BsPersonCheck, BsShield, BsAward } from "react-icons/bs";
import { pdfjs } from "react-pdf";
import districtsData from "./rwanda_districts.json";
import { useTranslation } from "react-i18next";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// Constants - moved outside component
const TOTAL_STEPS = 4;

const EXPERIENCE_LEVELS = [
  { value: "0-1", label: "0-1 years (Beginner)" },
  { value: "1-3", label: "1-3 years (Junior)" },
  { value: "3-5", label: "3-5 years (Intermediate)" },
  { value: "5-8", label: "5-8 years (Senior)" },
  { value: "8+", label: "8+ years (Expert)" },
];

const SKILL_SUGGESTIONS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "Project Management",
  "Digital Marketing",
  "Data Analysis",
  "Communication",
  "Leadership",
  "Microsoft Office",
  "Customer Service",
  "Sales",
  "Accounting",
  "Graphic Design",
  "Photography",
  "Writing",
  "Translation",
];

const PRICING_TIERS = [
  {
    range: "Below 100,000 RWF",
    min: 0,
    max: 99999,
    paymentFee: "2,000 RWF",
    renewalFee: "1,000 RWF/year",
  },
  {
    range: "100,000 - 199,000 RWF",
    min: 100000,
    max: 199000,
    paymentFee: "5,000 RWF",
    renewalFee: "2,500 RWF/year",
  },
  {
    range: "200,000 - 499,000 RWF",
    min: 199000,
    max: 499000,
    paymentFee: "10,000 RWF",
    renewalFee: "5,000 RWF/year",
  },
  {
    range: "500,000 RWF and Above",
    min: 500000,
    max: Number.MAX_SAFE_INTEGER,
    paymentFee: "20,000 RWF",
    renewalFee: "10,000 RWF/year",
  },
];

// Utility functions - moved outside component
const calculatePaymentFee = (salaryRange) => {
  if (!salaryRange) return null;

  try {
    const cleanRange = salaryRange.replace(/[^\d-]/g, "");
    const parts = cleanRange.split("-");
    const lowerValue = parseInt(parts[0]);

    if (isNaN(lowerValue)) return null;

    for (const tier of PRICING_TIERS) {
      if (lowerValue >= tier.min && lowerValue <= tier.max) {
        return tier;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};

const extractNumericValue = (feeString) => {
  return feeString.replace(/[^\d,.]/g, "").replace(/,/g, "");
};

// Validation functions - moved outside component
const validateStep1 = (formData, t) => {
  const errors = {};
  if (!formData.first_name.trim())
    errors.first_name = t("First name is required");
  if (!formData.last_name.trim())
    errors.last_name = t("Last name is required");
  if (!formData.gender) errors.gender = t("Gender is required");
  if (!formData.district) errors.district = t("District is required");
  if (!formData.sector) errors.sector = t("Sector is required");
  return errors;
};

const validateStep3 = (skillsWithExperience, t) => {
  const errors = {};
  if (skillsWithExperience.length === 0) {
    errors.skills = t("Please add at least one skill");
  }
  return errors;
};

const validateStep4 = (formData, acceptTerms, t) => {
  const errors = {};
  if (!formData.salary_range.trim()) {
    errors.salary_range = t("Salary range is required");
  }
  return { errors, termsError: !acceptTerms ? t("You must accept the terms and conditions to proceed") : "" };
};

// Step validation dispatcher
const validateCurrentStep = (currentStep, formData, skillsWithExperience, acceptTerms, t) => {
  switch (currentStep) {
    case 1:
      return { errors: validateStep1(formData, t), termsError: "" };
    case 2:
      return { errors: {}, termsError: "" }; // Education validation (optional fields)
    case 3:
      return { errors: validateStep3(skillsWithExperience, t), termsError: "" };
    case 4:
      return validateStep4(formData, acceptTerms, t);
    default:
      return { errors: {}, termsError: "" };
  }
};

// Component definitions moved outside
const ProgressIndicator = ({ currentStep, t }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
              step <= currentStep
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {step < currentStep ? <FiCheck /> : step}
          </div>
          {step < 4 && (
            <div
              className={`h-1 w-16 mx-2 ${
                step < currentStep ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
    <div className="mt-4 flex justify-between text-sm text-gray-600">
      <span>{t("Personal Info")}</span>
      <span>{t("Education")}</span>
      <span>{t("Skills")}</span>
      <span>{t("Final Details")}</span>
    </div>
  </div>
);

const PersonalInfoStep = ({ formData, errors, handleChange, sectors, t }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <BsPersonCheck className="mx-auto h-12 w-12 text-blue-600 mb-2" />
      <h3 className="text-xl font-semibold text-gray-800">
        {t("Personal Information")}
      </h3>
      <p className="text-gray-600">{t("Tell us about yourself")}</p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("First Name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={`w-full text-gray-700 px-4 py-3 border ${
            errors.first_name ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          placeholder={t("Enter your first name")}
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Middle Name")}{" "}
          <span className="text-gray-400">({t("Optional")})</span>
        </label>
        <input
          type="text"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          placeholder={t("Enter your middle name")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Last Name")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={`w-full px-4 text-gray-700 py-3 border ${
            errors.last_name ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          placeholder={t("Enter your last name")}
        />
        {errors.last_name && (
          <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Gender")} <span className="text-red-500">*</span>
        </label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className={`w-full px-4 text-gray-700 py-3 border ${
            errors.gender ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          <option value="">{t("Select gender")}</option>
          <option value="male">{t("Male")}</option>
          <option value="female">{t("Female")}</option>
          <option value="other">{t("Other")}</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("District")} <span className="text-red-500">*</span>
        </label>
        <select
          name="district"
          value={formData.district}
          onChange={handleChange}
          className={`w-full text-gray-700 px-4 py-3 border ${
            errors.district ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
        >
          <option value="">{t("Select District")}</option>
          {Object.keys(districtsData.districts).map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
        {errors.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Sector")} <span className="text-red-500">*</span>
        </label>
        <select
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          className={`w-full text-gray-700 px-4 py-3 border ${
            errors.sector ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          disabled={!formData.district}
        >
          <option value="">{t("Select Sector")}</option>
          {sectors.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {errors.sector && (
          <p className="text-red-500 text-sm mt-1">{errors.sector}</p>
        )}
      </div>
    </div>
  </div>
);

const EducationStep = ({ formData, errors, handleChange, handleFileUpload, fileName, fileInputRef, t }) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <BsAward className="mx-auto h-12 w-12 text-blue-600 mb-2" />
      <h3 className="text-xl font-semibold text-gray-800">
        {t("Education Background")}
      </h3>
      <p className="text-gray-600">
        {t("Share your educational qualifications")}
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Education Level")}
        </label>
        <select
          name="education_level"
          value={formData.education_level}
          onChange={handleChange}
          className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="none">{t("No Formal Education")}</option>
          <option value="primary">{t("Primary Education")}</option>
          <option value="ordinary_level">{t("Ordinary Level")}</option>
          <option value="secondary">{t("Secondary Level")}</option>
          <option value="advanced_diploma">{t("Advanced Diploma")}</option>
          <option value="vocational">{t("Vocational Training")}</option>
          <option value="bachelor">{t("Bachelor's Degree")}</option>
          <option value="master">{t("Master's Degree")}</option>
          <option value="phd">{t("PhD")}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("Field of Study")}
        </label>
        <input
          type="text"
          name="education_sector"
          value={formData.education_sector}
          onChange={handleChange}
          placeholder={t("e.g., Computer Science, Business Administration")}
          className="w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("Resume Upload")}
      </label>
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
          errors.resume ? "border-red-500" : "border-gray-300"
        } border-dashed rounded-lg hover:border-blue-400 transition-colors`}
      >
        <div className="space-y-1 text-center">
          <AiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>{t("Upload a file")}</span>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>
            <p className="pl-1">{t("or drag and drop")}</p>
          </div>
          <p className="text-xs text-gray-500">
            {t("PDF, DOC, or DOCX up to 10MB")}
          </p>
          {fileName && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600 flex items-center">
                <FiCheck className="mr-1" /> {fileName}
              </p>
            </div>
          )}
        </div>
      </div>
      {errors.resume && (
        <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
      )}
    </div>
  </div>
);

const SkillsStep = ({ 
  skillsWithExperience, 
  showAddSkill, 
  setShowAddSkill, 
  newSkill, 
  setNewSkill, 
  addSkill, 
  removeSkill, 
  errors, 
  setErrors, 
  t 
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <FiEdit3 className="mx-auto h-12 w-12 text-blue-600 mb-2" />
      <h3 className="text-xl font-semibold text-gray-800">
        {t("Skills & Experience")}
      </h3>
      <p className="text-gray-600">
        {t("Add your skills with experience levels")}
      </p>
    </div>

    {/* Skills List */}
    <div className="space-y-4">
      {skillsWithExperience.map((skill) => (
        <div
          key={skill.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
        >
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div>
              <span className="font-medium text-gray-800">{skill.name}</span>
              <span className="ml-2 text-sm text-gray-600">
                ({skill.experience})
              </span>
            </div>
          </div>
          <button
            onClick={() => removeSkill(skill.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded"
          >
            <AiOutlineDelete size={18} />
          </button>
        </div>
      ))}
    </div>

    {/* Add Skill Section */}
    {showAddSkill ? (
      <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Skill Name")}
            </label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              placeholder={t("Enter skill name")}
              className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Skill Suggestions */}
            <div className="mt-2 flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.slice(0, 8).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() =>
                    setNewSkill({ ...newSkill, name: suggestion })
                  }
                  className="px-3 py-1 text-xs text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("Experience Level")}
            </label>
            <select
              value={newSkill.experience}
              onChange={(e) =>
                setNewSkill({ ...newSkill, experience: e.target.value })
              }
              className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t("Select experience level")}</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {t(level.label)}
                </option>
              ))}
            </select>
          </div>

          {errors.newSkill && (
            <p className="text-red-500 text-sm">{errors.newSkill}</p>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("Add Skill")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddSkill(false);
                setNewSkill({ name: "", experience: "" });
                setErrors(prev => ({ ...prev, newSkill: "" }));
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setShowAddSkill(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
      >
        <AiOutlinePlus size={20} />
        <span>{t("Add New Skill")}</span>
      </button>
    )}

    {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
  </div>
);

const FinalDetailsStep = ({ 
  formData, 
  errors, 
  handleChange, 
  paymentFee, 
  acceptTerms, 
  setAcceptTerms, 
  termsError, 
  setShowTermsModal, 
  setShowPolicyModal, 
  skillsWithExperience, 
  fileName, 
  t 
}) => (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <BsShield className="mx-auto h-12 w-12 text-blue-600 mb-2" />
      <h3 className="text-xl font-semibold text-gray-800">
        {t("Final Details")}
      </h3>
      <p className="text-gray-600">{t("Complete your profile setup")}</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("Expected Salary Range")} <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="salary_range"
        value={formData.salary_range}
        onChange={handleChange}
        placeholder={t("e.g., 100000 - 500000")}
        className={`w-full px-4 text-gray-700 py-3 border ${
          errors.salary_range ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
      />
      <p className="mt-1 text-sm text-gray-500">
        {t("Enter your expected salary range in RWF")}
      </p>
      {errors.salary_range && (
        <p className="text-red-500 text-sm mt-1">{errors.salary_range}</p>
      )}

      {/* Payment Fee Information */}
      {paymentFee && (
        <div className="mt-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-start">
            <AiOutlineInfoCircle
              className="text-blue-500 mt-1 mr-3 flex-shrink-0"
              size={24}
            />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-800 mb-2">
                {t("Registration Fee")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="font-medium text-gray-700">
                    {t("One-time Registration")}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {paymentFee.paymentFee}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <p className="font-medium text-gray-700">
                    {t("Annual Renewal")}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {paymentFee.renewalFee}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t("Payment Information:")}
                </p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">MTN MOMO PAY:</span>{" "}
                    <span className="text-red-600 font-bold">1592374</span>
                  </p>
                  <p>
                    <span className="font-medium">{t("Account Name")}:</span>{" "}
                    Anaweza App LTD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Terms and Conditions */}
    <div className="mt-8">
      <div className="flex items-start space-x-3">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          checked={acceptTerms}
          onChange={() => setAcceptTerms(!acceptTerms)}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700">
            {t("I accept the")}{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-blue-600 hover:text-blue-500 underline font-semibold"
            >
              {t("Terms and Conditions")}
            </button>{" "}
            {t("and")}{" "}
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="text-blue-600 hover:text-blue-500 underline font-semibold"
            >
              {t("Pricing Policy")}
            </button>
          </label>
          {termsError && <p className="text-red-500 mt-1">{termsError}</p>}
        </div>
      </div>
    </div>

    {/* Summary Card */}
    <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="font-semibold text-gray-800 mb-4">
        {t("Profile Summary")}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-blue-700">
            <span className=" text-gray-700 font-medium">{t("Name")}:</span>{" "}
            {formData.first_name} {formData.middle_name} {formData.last_name}
          </p>
          <p className="text-blue-700">
            <span className="text-gray-700 font-medium">
              {t("Location")}:
            </span>{" "}
            {formData.sector}, {formData.district}
          </p>
          <p className="text-blue-700">
            <span className=" text-gray-700 font-medium">
              {t("Education")}:
            </span>{" "}
            {formData.education_level}
          </p>
        </div>
        <div>
          <p className="text-blue-700">
            <span className="text-gray-700 font-medium">{t("Skills")}:</span>{" "}
            {skillsWithExperience.length} {t("skills added")}
          </p>
          <p className="text-blue-700">
            <span className="text-gray-700 font-medium">{t("Resume")}:</span>{" "}
            {fileName ? t("Uploaded") : t("Not uploaded")}
          </p>
          <p className="text-blue-700">
            <span className="text-gray-700 font-medium">
              {t("Salary Range")}:
            </span>{" "}
            {formData.salary_range} RWF
          </p>
        </div>
      </div>
    </div>
  </div>
);

const TermsModal = ({ showTermsModal, setShowTermsModal, t }) => (
  showTermsModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {t("Terms and Conditions")}
            </h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
            <p>
              <strong>{t("Introduction")}:</strong>{" "}
              {t(
                "Welcome to Anaweza. These Terms and Conditions govern your use of our platform and services. By accessing or using Anaweza, you agree to be bound by these Terms."
              )}
            </p>

            <p>
              <strong>{t("User Accounts")}:</strong>{" "}
              {t(
                "When you create an account with us, you must provide accurate, complete, and up-to-date information. You are responsible for safeguarding your password and for all activities that occur under your account."
              )}
            </p>

            <p>
              <strong>{t("User Conduct")}:</strong>{" "}
              {t(
                "You agree not to provide false information, use the service for illegal purposes, harass others, post discriminatory job listings, or create multiple accounts for deceptive purposes."
              )}
            </p>

            <p>
              <strong>{t("Job Seeker Specific Terms")}:</strong>{" "}
              {t(
                "You must provide accurate information about your qualifications, experience, and desired salary range. Your salary range determines your registration fee."
              )}
            </p>

            <p>
              <strong>{t("Payment Terms:")}</strong>{" "}
              {t(
                "You agree to pay all fees associated with your selected tier. All payments are due in advance and are non-refundable except as specified in our Refund Policy."
              )}
            </p>

            <p>
              <strong>{t("Intellectual Property:")}</strong>{" "}
              {t(
                "The service and its content remain the exclusive property of Anaweza. You retain rights to content you post, but grant us a license to use it in connection with the service."
              )}
            </p>

            <p>
              <strong>{t("Termination:")}</strong>{" "}
              {t(
                "We may terminate your account without prior notice if you breach the Terms."
              )}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

const PolicyModal = ({ showPolicyModal, setShowPolicyModal, t }) => (
  showPolicyModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {t("Pricing Policy")}
            </h2>
            <button
              onClick={() => setShowPolicyModal(false)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="text-gray-700 space-y-4 text-sm leading-relaxed">
            <p>
              <strong>{t("Overview")}:</strong>{" "}
              {t(
                "At Anaweza, we provide fair and transparent pricing that aligns with our users' career levels. Our pricing structure is designed to be accessible to job seekers at all income levels."
              )}
            </p>

            <p>
              <strong>{t("Job Seeker Registration Pricing:")}:</strong>{" "}
              {t(
                "Our registration fees are scaled according to your target salary range:"
              )}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="space-y-3">
                {PRICING_TIERS.map((tier, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded border"
                  >
                    <div>
                      <span className="font-medium">{tier.range}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-semibold">
                        {tier.paymentFee}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tier.renewalFee}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p>
              <strong>{t("Payment Methods")}:</strong>{" "}
              {t("We accept various payment methods including")}:
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <ul className="space-y-2">
                <li>
                  <strong>MTN MOMO PAY:</strong> 1592374
                </li>
                <li>
                  <strong>{t("Account Name")}:</strong> Anaweza App Ltd
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-yellow-800">
                <strong>{t("Note")}:</strong>{" "}
                {t(
                  "This payment is made after the job seeker finds a job as part of their support to qualify."
                )}
              </p>
            </div>

            <p>
              {t(
                "For any questions regarding our pricing, please contact our support team at ltdanaweza@gmail.com"
              )}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowPolicyModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

// Main component
const RegisterAsJobSeeker = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    education_level: "none",
    education_sector: "",
    skills: [],
    resume: null,
    salary_range: "",
    district: "",
    sector: "",
  });

  // Skills state
  const [skillsWithExperience, setSkillsWithExperience] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: "", experience: "" });
  const [showAddSkill, setShowAddSkill] = useState(false);

  // UI state
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [paymentFee, setPaymentFee] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Location state
  const [sectors, setSectors] = useState([]);

  const token = localStorage.getItem("token");

  // Effects
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const accessToken = storedUserData
      ? JSON.parse(storedUserData).access_token
      : null;
    if (!accessToken && !token) {
      navigate("/login");
    }
  }, [navigate, token]);

  useEffect(() => {
    if (formData.district) {
      setSectors(districtsData.districts[formData.district]?.sectors || []);
    } else {
      setSectors([]);
    }
  }, [formData.district]);

  useEffect(() => {
    const fee = calculatePaymentFee(formData.salary_range);
    setPaymentFee(fee);
  }, [formData.salary_range]);

  // Fixed handleChange function - removed errors dependency to prevent re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value
    }));

    // Clear error for this field if it exists
    setErrors(prevErrors => {
      if (prevErrors[name]) {
        const { [name]: removedError, ...remainingErrors } = prevErrors;
        return remainingErrors;
      }
      return prevErrors;
    });
  }, []); // Empty dependency array to prevent unnecessary re-renders

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, resume: t("File size cannot exceed 10MB") }));
        return;
      }

      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!["pdf", "doc", "docx"].includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          resume: t("Only PDF, DOC, or DOCX files are allowed"),
        }));
        return;
      }

      setFileName(file.name);
      setFormData(prev => ({ ...prev, resume: file }));
      setErrors(prev => ({ ...prev, resume: "" }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setMessage(t("Logging out..."));
    setTimeout(() => navigate("/login"), 1000);
  };

  // Skills management
  const addSkill = () => {
    if (!newSkill.name.trim() || !newSkill.experience) {
      setErrors(prev => ({
        ...prev,
        newSkill: t("Please enter both skill name and experience level"),
      }));
      return;
    }

    if (
      skillsWithExperience.some(
        (skill) => skill.name.toLowerCase() === newSkill.name.toLowerCase()
      )
    ) {
      setErrors(prev => ({ ...prev, newSkill: t("This skill is already added") }));
      return;
    }

    setSkillsWithExperience(prev => [
      ...prev,
      { ...newSkill, id: Date.now() },
    ]);
    setNewSkill({ name: "", experience: "" });
    setShowAddSkill(false);
    setErrors(prev => ({ ...prev, newSkill: "" }));
  };

  const removeSkill = (id) => {
    setSkillsWithExperience(prev =>
      prev.filter((skill) => skill.id !== id)
    );
  };

  // Step navigation
  const nextStep = () => {
    const validation = validateCurrentStep(currentStep, formData, skillsWithExperience, acceptTerms, t);
    
    if (Object.keys(validation.errors).length === 0 && !validation.termsError) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      setErrors(validation.errors);
      setTermsError(validation.termsError);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const validation = validateCurrentStep(currentStep, formData, skillsWithExperience, acceptTerms, t);
    
    if (Object.keys(validation.errors).length > 0 || validation.termsError) {
      setErrors(validation.errors);
      setTermsError(validation.termsError);
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();

    // Prepare skills data
    const skillsString = skillsWithExperience
      .map((skill) => `${skill.name} (${skill.experience} years)`)
      .join(", ");

    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (
        key !== "resume" &&
        key !== "skills" &&
        value !== null &&
        value !== ""
      ) {
        formDataToSend.append(key, value);
      }
    });

    formDataToSend.append("skills", skillsString);

    if (formData.resume) {
      formDataToSend.append("resume", formData.resume);
    }

    if (paymentFee) {
      const paymentFeeValue = extractNumericValue(paymentFee.paymentFee);
      const renewalFeeValue = extractNumericValue(paymentFee.renewalFee);

      formDataToSend.append("registration_fee", paymentFeeValue);
      formDataToSend.append("renewal_fee", renewalFeeValue);
    }

    try {
      const response = await axios.post(
        "https://anaweza-backend.up.railway.app/job_seeker/create/",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setMessage(
          t(
            "Registration successful! Your account will be activated after payment confirmation."
          )
        );
        setTimeout(() => navigate("/job_seeker"), 2000);
      }
    } catch (error) {
      if (error.response?.data) {
        if (typeof error.response.data === "object") {
          setErrors(error.response.data);
        } else {
          setErrors({
            form: error.response.data || "An unexpected error occurred.",
          });
        }
      } else {
        setErrors({ form: "Network error. Please check your connection." });
      }
    } finally {
      setLoading(false);
    }
  };

  // Step content renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            sectors={sectors}
            t={t}
          />
        );
      case 2:
        return (
          <EducationStep 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleFileUpload={handleFileUpload}
            fileName={fileName}
            fileInputRef={fileInputRef}
            t={t}
          />
        );
      case 3:
        return (
          <SkillsStep 
            skillsWithExperience={skillsWithExperience}
            showAddSkill={showAddSkill}
            setShowAddSkill={setShowAddSkill}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            errors={errors}
            setErrors={setErrors}
            t={t}
          />
        );
      case 4:
        return (
          <FinalDetailsStep 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            paymentFee={paymentFee}
            acceptTerms={acceptTerms}
            setAcceptTerms={setAcceptTerms}
            termsError={termsError}
            setShowTermsModal={setShowTermsModal}
            setShowPolicyModal={setShowPolicyModal}
            skillsWithExperience={skillsWithExperience}
            fileName={fileName}
            t={t}
          />
        );
      default:
        return (
          <PersonalInfoStep 
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            sectors={sectors}
            t={t}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <TermsModal 
        showTermsModal={showTermsModal}
        setShowTermsModal={setShowTermsModal}
        t={t}
      />
      <PolicyModal 
        showPolicyModal={showPolicyModal}
        setShowPolicyModal={setShowPolicyModal}
        t={t}
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold">
                {t("Create Your Professional Profile")}
              </h1>
              <p className="mt-2 text-blue-100">
                {t("Join thousands of job seekers finding their dream careers")}
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} t={t} />

            {/* Messages */}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
                <FiCheck className="mr-2 flex-shrink-0" />
                {message}
              </div>
            )}

            {(errors.form || errors.error) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                <FiX className="mr-2 flex-shrink-0" />
                {errors.form || errors.error}
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[400px]">{renderStepContent()}</div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t("Previous")}
              </button>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t("Exit")}
                </button>

                {currentStep < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t("Next")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {t("Creating Profile...")}
                      </span>
                    ) : (
                      t("Create Profile")
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterAsJobSeeker