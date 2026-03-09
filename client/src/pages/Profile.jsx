import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/UI/Card";
import toast from "react-hot-toast";
import { safeString, safeArray } from "../utils/safeHelpers";
import { useUserData } from "../hooks/useUserData";

// Pre-define soft skills list (constant - won't change)
const SOFT_SKILLS = new Set([
  "Communication",
  "Teamwork",
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Time Management",
  "Adaptability",
  "Creativity",
  "Emotional Intelligence",
  "Conflict Resolution",
  "Mentoring",
  "Presentation",
  "Writing",
]);

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  // 👇 Use the custom hook - it already handles all the data fetching!
  const { profile, photo, loading, error } = useUserData();

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error("Failed to load profile");
    }
  }, [error]);

  // Memoize computed values to prevent recalculation on every render
  const { technicalSkills, softSkills } = useMemo(() => {
    const skills = safeArray(profile?.skills);
    return {
      technicalSkills: skills.filter((skill) => !SOFT_SKILLS.has(skill)),
      softSkills: skills.filter((skill) => SOFT_SKILLS.has(skill)),
    };
  }, [profile?.skills]);

  // Memoize display helpers
  const displayValue = useMemo(
    () =>
      (value, placeholder = "Not provided") => {
        const strValue = safeString(value);
        return strValue ? (
          strValue
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        );
      },
    []
  );

  const displayTags = useMemo(
    () => (items) => {
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
    },
    []
  );

  const displayLanguages = useMemo(
    () => (languages) => {
      const safeLanguages = safeArray(languages);
      if (safeLanguages.length === 0) {
        return <span className="text-gray-400 italic">None added</span>;
      }
      return (
        <div className="space-y-2">
          {safeLanguages.map((lang, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="font-medium">{safeString(lang?.name)}:</span>
              <span className="text-gray-600">
                {safeString(lang?.proficiency)}
              </span>
            </div>
          ))}
        </div>
      );
    },
    []
  );

  const displayCertifications = useMemo(
    () => (certifications) => {
      const safeCerts = safeArray(certifications);
      if (safeCerts.length === 0) {
        return <span className="text-gray-400 italic">None added</span>;
      }
      return (
        <div className="space-y-3">
          {safeCerts.map((cert, index) => (
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
    },
    []
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayPhoto = photo || profile?.photoURL || user?.photoURL;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      {/* Profile Header - Simplified */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={profile?.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-600"
              loading="lazy"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile?.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {displayValue(profile?.name)}
            </h2>
            <p className="text-gray-600">{displayValue(profile?.email)}</p>
            {profile?.headline && (
              <p className="text-blue-600 mt-1">{profile.headline}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Only show sections that have data */}
      {(profile?.phone ||
        profile?.dateOfBirth ||
        profile?.gender ||
        profile?.hearAboutUs) && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {profile?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
            {profile?.dateOfBirth && (
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{profile.dateOfBirth}</p>
              </div>
            )}
            {profile?.gender && (
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{profile.gender}</p>
              </div>
            )}
            {profile?.hearAboutUs && (
              <div>
                <p className="text-sm text-gray-500">
                  How did you hear about us?
                </p>
                <p className="font-medium">{profile.hearAboutUs}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Location */}
      {(profile?.country || profile?.city) && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Location</h3>
          <p className="font-medium">
            {[profile?.city, profile?.country].filter(Boolean).join(", ")}
          </p>
        </Card>
      )}

      {/* Professional Info */}
      {profile?.profession && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
            Professional Information
          </h3>
          <p className="font-medium">{profile.profession}</p>
          {profile?.experience && (
            <p className="text-sm text-gray-600 mt-1 capitalize">
              {profile.experience} level
            </p>
          )}
        </Card>
      )}

      {/* Skills */}
      {(technicalSkills.length > 0 || softSkills.length > 0) && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Skills</h3>
          <div className="space-y-4">
            {technicalSkills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Technical</p>
                {displayTags(technicalSkills)}
              </div>
            )}
            {softSkills.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Soft Skills</p>
                {displayTags(softSkills)}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bio */}
      {profile?.bio && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Bio</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
        </Card>
      )}

      {/* Languages */}
      {profile?.languages?.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
            Languages
          </h3>
          {displayLanguages(profile.languages)}
        </Card>
      )}

      {/* Certifications */}
      {profile?.certifications?.length > 0 && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
            Certifications
          </h3>
          {displayCertifications(profile.certifications)}
        </Card>
      )}

      {/* Professional Links */}
      {(profile?.linkedin || profile?.github || profile?.portfolio) && (
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Links</h3>
          <div className="space-y-2">
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block truncate"
              >
                LinkedIn
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block truncate"
              >
                GitHub
              </a>
            )}
            {profile.portfolio && (
              <a
                href={profile.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block truncate"
              >
                Portfolio
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Profile;
