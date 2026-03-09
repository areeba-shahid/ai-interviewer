import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { userAPI } from "../../services/api";
import Button from "../UI/Button";
import toast from "react-hot-toast";
import { safeString, safeArray } from "../../utils/safeHelpers";

const Step6Review = ({ profileData, updateProfileData, errors }) => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Safely access all data with helpers
  const technicalSkills = safeArray(profileData?.technicalSkills);
  const softSkills = safeArray(profileData?.softSkills);
  const languages = safeArray(profileData?.languages);
  const certifications = safeArray(profileData?.certifications);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // Prepare data for API with safe access
      const apiData = {
        name: safeString(profileData?.name),
        email: safeString(profileData?.email),
        phone: safeString(profileData?.phone),
        bio: safeString(profileData?.bio),
        location: `${safeString(profileData?.city)}, ${safeString(
          profileData?.country
        )}`.replace(/^, |, $/g, ""),
        profession: safeString(profileData?.currentProfession),
        experience: safeString(profileData?.experienceLevel),
        skills: [...technicalSkills, ...softSkills],
        linkedin: safeString(profileData?.linkedin),
        github: safeString(profileData?.github),
        portfolio: safeString(profileData?.portfolio),
        headline: safeString(profileData?.headline),
        dateOfBirth: safeString(profileData?.dateOfBirth),
        gender: safeString(profileData?.gender),
        hearAboutUs: safeString(profileData?.hearAboutUs),
      };

      await userAPI.updateProfile(apiData);

      toast.success("Profile completed successfully!");
      navigate(`/user/${userId}/dashboard`);
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (step) => {
    // This will be handled by the wizard's step navigation
    window.scrollTo(0, 0);
  };

  // Update the displayValue function to handle empty strings better
  const displayValue = (value, placeholder = "Not provided") => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400 italic">{placeholder}</span>;
    }
    return <span className="text-gray-900">{value}</span>;
  };

  // Helper to display array as tags
  const displayTags = (items) => {
    const safeItems = safeArray(items);
    if (safeItems.length === 0) {
      return <span className="text-gray-400 italic">None added</span>;
    }
    return (
      <div className="flex flex-wrap gap-2">
        {safeItems.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  // Helper to display languages
  const displayLanguages = () => {
    if (languages.length === 0) {
      return <span className="text-gray-400 italic">None added</span>;
    }
    return (
      <div className="space-y-2">
        {languages.map((lang, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="font-medium">{safeString(lang?.name)}:</span>
            <span className="text-gray-600">
              {safeString(lang?.proficiency)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Helper to display certifications
  const displayCertifications = () => {
    if (certifications.length === 0) {
      return <span className="text-gray-400 italic">None added</span>;
    }
    return (
      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium">
              {safeString(cert?.name) || "Unnamed certification"}
            </p>
            <p className="text-sm text-gray-600">
              {safeString(cert?.issuer)} {cert?.year && `• ${cert.year}`}
            </p>
            {cert?.link && (
              <a
                href={safeString(cert.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-1 inline-block"
              >
                View Credential
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Profile</h2>
      <p className="text-gray-600 mb-8">
        Please review your information before completing your profile setup.
      </p>

      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <button
              onClick={() => handleEdit(1)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {profileData?.name ? (
                  profileData.name
                ) : (
                  <span className="text-gray-400 italic">Loading name...</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">
                {profileData?.email ? (
                  profileData.email
                ) : (
                  <span className="text-gray-400 italic">Loading email...</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">
                {displayValue(profileData?.phone, "Not provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {displayValue(profileData?.dateOfBirth, "Not provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium capitalize">
                {displayValue(profileData?.gender, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Professional Headline</p>
              <p className="font-medium">
                {displayValue(profileData?.headline, "Not added")}
              </p>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Location</h3>
            <button
              onClick={() => handleEdit(2)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <p className="font-medium">
                {displayValue(profileData?.country, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">
                {displayValue(profileData?.city, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {displayValue(profileData?.address, "Not provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Postal Code</p>
              <p className="font-medium">
                {displayValue(profileData?.postalCode, "Not provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timezone</p>
              <p className="font-medium">
                {displayValue(profileData?.timezone, "Not specified")}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            <button
              onClick={() => handleEdit(3)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Current Profession</p>
              <p className="font-medium">
                {displayValue(profileData?.currentProfession, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-medium">
                {displayValue(profileData?.yearsOfExperience, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Experience Level</p>
              <p className="font-medium capitalize">
                {displayValue(profileData?.experienceLevel, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employment Status</p>
              <p className="font-medium capitalize">
                {displayValue(profileData?.employmentStatus, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <p className="font-medium">
                {displayValue(profileData?.industry, "Not specified")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Company</p>
              <p className="font-medium">
                {displayValue(profileData?.company, "Not specified")}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="px-6 pb-6">
            <p className="text-sm text-gray-500 mb-3">Professional Links</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">LinkedIn</p>
                <p className="text-sm truncate">
                  {displayValue(profileData?.linkedin, "Not added")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">GitHub</p>
                <p className="text-sm truncate">
                  {displayValue(profileData?.github, "Not added")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Portfolio</p>
                <p className="text-sm truncate">
                  {displayValue(profileData?.portfolio, "Not added")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Skills & Expertise</h3>
            <button
              onClick={() => handleEdit(4)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Technical Skills</p>
              {displayTags(technicalSkills)}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Soft Skills</p>
              {displayTags(softSkills)}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Languages</p>
              {displayLanguages()}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Certifications</p>
              {displayCertifications()}
            </div>
          </div>
        </div>

        {/* Bio & Resume Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bio & Resume</h3>
            <button
              onClick={() => handleEdit(5)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Professional Bio</p>
              <p className="text-gray-700 whitespace-pre-wrap">
                {displayValue(profileData?.bio, "No bio provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Resume</p>
              {profileData?.resumeFile ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{safeString(profileData?.resumeFileName)}</span>
                </div>
              ) : (
                <span className="text-gray-400 italic">No resume uploaded</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Profile Photo</p>
              {profileData?.profilePhoto ? (
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                />
              ) : (
                <span className="text-gray-400 italic">No photo uploaded</span>
              )}
            </div>
          </div>
        </div>

        {/* How did you hear about us */}
        {safeString(profileData?.hearAboutUs) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500">How did you hear about us?</p>
            <p className="font-medium">
              {safeString(profileData?.hearAboutUs)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step6Review;
