/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

const PasswordInput = ({ 
  value, 
  onChange, 
  name = "password", 
  placeholder = "Enter your password",
  id = "password",
  label = "Password",
  required = true 
}) => {
  const { t } = useTranslation();
  const finalLabel = label || t("Password");
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });


  // Validate password on every change
  useEffect(() => {
    setValidations({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      special: /[^A-Za-z0-9]/.test(value)
    });
  }, [value]);

  const isValid = Object.values(validations).every(valid => valid);

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      </div>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`block w-full px-4 py-3 rounded-lg border ${
            value && !isValid ? "border-red-300" : value && isValid ? "border-green-300" : "border-gray-300"
          } focus:ring-blue-500 focus:border-blue-500 shadow-sm sm:text-sm text-gray-700`}
          placeholder={placeholder}
          required={required}
        />
        <span
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <EyeIcon className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </div>

      {/* Password requirements checklist */}
      <div className="mt-2 space-y-1">
        <h4 className="text-xs font-medium text-gray-500">{t("Password requirements:")}</h4>
        <ul className="text-xs space-y-1">
          <li className="flex items-center">
            {validations.length ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={validations.length ? "text-green-600" : "text-red-600"}>
              {t("At least 8 characters")}
            </span>
          </li>
          <li className="flex items-center">
            {validations.uppercase ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={validations.uppercase ? "text-green-600" : "text-red-600"}>
              {t("At least one uppercase letter (A-Z)")}
            </span>
          </li>
          <li className="flex items-center">
            {validations.lowercase ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={validations.lowercase ? "text-green-600" : "text-red-600"}>
              {t("At least one lowercase letter (a-z)")}
            </span>
          </li>
          <li className="flex items-center">
            {validations.number ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={validations.number ? "text-green-600" : "text-red-600"}>
              {t("At least one number (0-9)")}
            </span>
          </li>
          <li className="flex items-center">
            {validations.special ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={validations.special ? "text-green-600" : "text-red-600"}>
              {t("At least one special character (#, !, @, etc.)")}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordInput;