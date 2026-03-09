import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { safeString } from "../../utils/safeHelpers";

const Step1PersonalInfo = ({ profileData, updateProfileData, errors }) => {
  // Safely access all values with safeString
  const name = safeString(profileData?.name);
  const email = safeString(profileData?.email);
  const phone = safeString(profileData?.phone);
  const gender = safeString(profileData?.gender);
  const headline = safeString(profileData?.headline);
  const hearAboutUs = safeString(profileData?.hearAboutUs);

  const [startDate, setStartDate] = useState(
    profileData?.dateOfBirth ? new Date(profileData.dateOfBirth) : null
  );

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  const handleDateChange = (date) => {
    setStartDate(date);
    updateProfileData({
      dateOfBirth: date ? date.toISOString().split("T")[0] : "",
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
      <p className="text-gray-600 mb-8">
        Tell us a bit about yourself. This helps us personalize your interview
        experience.
      </p>

      <div className="space-y-6">
        {/* Full Name - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              readOnly
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your name from Google account (cannot be changed)
          </p>
          {/* Debug: Remove this after confirming it works */}
          {/* <p className="text-xs text-blue-600">Debug - Name value: "{name}"</p> */}
        </div>

        {/* Email Address - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your email from Google account (cannot be changed)
          </p>
          {/* Debug: Remove this after confirming it works */}
          {/* <p className="text-xs text-blue-600">Debug - Email value: "{email}"</p> */}
        </div>

        {/* Phone Number - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => updateProfileData({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank if you prefer not to share
          </p>
        </div>

        {/* Date of Birth - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth (Optional)
          </label>
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select your date of birth"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Gender - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {genders.map((genderOption) => (
              <label
                key={genderOption.value}
                className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  gender === genderOption.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={genderOption.value}
                  checked={gender === genderOption.value}
                  onChange={(e) =>
                    updateProfileData({ gender: e.target.value })
                  }
                  className="hidden"
                />
                <span className="text-sm font-medium">
                  {genderOption.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Professional Headline - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Headline (Optional)
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => updateProfileData({ headline: e.target.value })}
            placeholder="e.g., Senior Frontend Developer with 5 years of experience"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            A brief headline that appears below your name
          </p>
        </div>

        {/* How did you hear about us? - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How did you hear about us? (Optional)
          </label>
          <select
            value={hearAboutUs}
            onChange={(e) => updateProfileData({ hearAboutUs: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select an option</option>
            <option value="linkedin">LinkedIn</option>
            <option value="google">Google Search</option>
            <option value="friend">Friend/Colleague</option>
            <option value="social">Social Media</option>
            <option value="blog">Blog/Article</option>
            <option value="ad">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
