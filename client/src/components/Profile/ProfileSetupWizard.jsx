import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { userAPI } from "../../services/api";
import Card from "../UI/Card";
import Button from "../UI/Button";
import Step1PersonalInfo from "./Step1PersonalInfo";
import Step2Location from "./Step2Location";
import Step3Profession from "./Step3Profession";
import Step4Skills from "./Step4Skills";
import Step5BioResume from "./Step5BioResume";
import Step6Review from "./Step6Review";
import toast from "react-hot-toast";
import { safeString, safeArray } from "../../utils/safeHelpers";
import { useUserData } from "../../hooks/useUserData";
const steps = [
  { id: 1, name: "Personal Info", component: Step1PersonalInfo },
  { id: 2, name: "Location", component: Step2Location },
  { id: 3, name: "Profession", component: Step3Profession },
  { id: 4, name: "Skills", component: Step4Skills },
  { id: 5, name: "Bio & Resume", component: Step5BioResume },
  { id: 6, name: "Review", component: Step6Review },
];

const ProfileSetupWizard = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Helper function to get the best available name
  const getUserName = () => {
    return (
      user?.displayName ||
      user?.reloadUserInfo?.screenName ||
      user?.email?.split("@")[0] ||
      ""
    );
  };

  // 🔥 Image compression function
  const compressImage = (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64String;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200; // Max width
        canvas.height = 200; // Max height
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, 200, 200);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressed);
      };
    });
  };

  const [profileData, setProfileData] = useState({
    // Step 1: Personal Info - with safe defaults
    name: getUserName(),
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    headline: "",
    hearAboutUs: "",

    // Step 2: Location - with safe defaults
    country: "",
    city: "",
    address: "",
    postalCode: "",
    timezone: "",

    // Step 3: Profession - with safe defaults
    currentProfession: "",
    yearsOfExperience: "",
    experienceLevel: "",
    employmentStatus: "",
    industry: "",
    company: "",
    linkedin: "",
    github: "",
    portfolio: "",

    // Step 4: Skills - ALWAYS arrays, never undefined
    technicalSkills: [],
    softSkills: [],
    languages: [],
    certifications: [],

    // Step 5: Bio & Resume - with safe defaults
    bio: "",
    resumeFile: null,
    resumeFileName: "",
    resumeText: "",
    profilePhoto: user?.photoURL || "",

    // Job Preferences - with safe defaults
    jobSearchStatus: "",
    preferredJobTypes: [],
    expectedSalary: "",
    remotePreference: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Load existing profile data when component mounts
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        setInitialLoading(true);
        const response = await userAPI.getProfile();
        const existingData = response.data;

        if (existingData) {
          console.log("📂 Loading existing profile data");

          // Parse location into country/city if needed
          let country = existingData.country || "";
          let city = existingData.city || "";

          // If location is combined but country/city are empty, try to parse
          if (existingData.location && !country && !city) {
            const locationParts = existingData.location
              .split(",")
              .map((part) => part.trim());
            if (locationParts.length >= 2) {
              city = locationParts[0];
              country = locationParts[1];
            }
          }

          // Update profileData with existing values
          setProfileData({
            // Personal Info
            name: existingData.name || getUserName(),
            email: existingData.email || user?.email || "",
            phone: existingData.phone || "",
            dateOfBirth: existingData.dateOfBirth || "",
            gender: existingData.gender || "",
            headline: existingData.headline || "",
            hearAboutUs: existingData.hearAboutUs || "",

            // Location
            country: country,
            city: city,
            address: existingData.address || "",
            postalCode: existingData.postalCode || "",
            timezone: existingData.timezone || "",

            // Profession
            currentProfession:
              existingData.currentProfession || existingData.profession || "",
            yearsOfExperience: existingData.yearsOfExperience || "",
            experienceLevel:
              existingData.experienceLevel || existingData.experience || "",
            employmentStatus: existingData.employmentStatus || "",
            industry: existingData.industry || "",
            company: existingData.company || "",
            linkedin: existingData.linkedin || "",
            github: existingData.github || "",
            portfolio: existingData.portfolio || "",

            // Skills
            technicalSkills:
              safeArray(existingData.technicalSkills).length > 0
                ? existingData.technicalSkills
                : (existingData.skills || []).filter(
                    (skill) =>
                      ![
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
                      ].includes(skill)
                  ),
            softSkills:
              safeArray(existingData.softSkills).length > 0
                ? existingData.softSkills
                : (existingData.skills || []).filter((skill) =>
                    [
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
                    ].includes(skill)
                  ),
            languages: existingData.languages || [],
            certifications: existingData.certifications || [],

            // Bio & Resume
            bio: existingData.bio || "",
            resumeFile: existingData.resumeFile
              ? { name: existingData.resumeFileName }
              : null,
            resumeFileName: existingData.resumeFileName || "",
            resumeText: existingData.resumeText || "",
            profilePhoto: existingData.photoURL || user?.photoURL || "",

            // Job Preferences
            jobSearchStatus: existingData.jobSearchStatus || "",
            preferredJobTypes: existingData.preferredJobTypes || [],
            expectedSalary: existingData.expectedSalary || "",
            remotePreference: existingData.remotePreference || "",
          });
        }
      } catch (error) {
        console.error("Failed to load existing profile:", error);
        // If no existing profile, continue with defaults
      } finally {
        setInitialLoading(false);
      }
    };

    loadExistingProfile();
  }, [user]);

  // Sync name from user whenever user object changes
  useEffect(() => {
    if (user && !profileData.name) {
      const userName = getUserName();
      if (userName) {
        setProfileData((prev) => ({
          ...prev,
          name: userName,
          email: user.email || prev.email,
        }));
      }
    }
  }, [user]);

  const updateProfileData = (newData) => {
    setProfileData((prev) => {
      const updated = { ...prev, ...newData };

      // Ensure arrays remain arrays
      if (newData.technicalSkills !== undefined) {
        updated.technicalSkills = safeArray(newData.technicalSkills);
      }
      if (newData.softSkills !== undefined) {
        updated.softSkills = safeArray(newData.softSkills);
      }
      if (newData.languages !== undefined) {
        updated.languages = safeArray(newData.languages);
      }
      if (newData.certifications !== undefined) {
        updated.certifications = safeArray(newData.certifications);
      }
      if (newData.preferredJobTypes !== undefined) {
        updated.preferredJobTypes = safeArray(newData.preferredJobTypes);
      }

      return updated;
    });
  };

  const handleNext = async () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get the best possible name
      const finalName =
        profileData.name ||
        user?.displayName ||
        user?.reloadUserInfo?.screenName ||
        user?.email?.split("@")[0] ||
        "User";

      const emailToSend = profileData.email || user?.email || "";

      // Safely prepare data
      const technicalSkills = safeArray(profileData.technicalSkills);
      const softSkills = safeArray(profileData.softSkills);
      const languages = safeArray(profileData.languages);
      const certifications = safeArray(profileData.certifications);
      const preferredJobTypes = safeArray(profileData.preferredJobTypes);

      const city = safeString(profileData.city);
      const country = safeString(profileData.country);
      const location = [city, country].filter(Boolean).join(", ");

      // Handle photo
      let photoURL = profileData.profilePhoto || user?.photoURL || "";

      const apiData = {
        // Personal Info
        name: finalName,
        email: emailToSend,
        phone: safeString(profileData.phone),
        dateOfBirth: safeString(profileData.dateOfBirth),
        gender: safeString(profileData.gender),
        headline: safeString(profileData.headline),
        hearAboutUs: safeString(profileData.hearAboutUs),
        photoURL: photoURL,

        // Location
        country: safeString(profileData.country),
        city: safeString(profileData.city),
        address: safeString(profileData.address),
        postalCode: safeString(profileData.postalCode),
        timezone: safeString(profileData.timezone),
        location: location || "Not specified",

        // Professional Info
        currentProfession: safeString(profileData.currentProfession),
        profession:
          safeString(profileData.currentProfession) || "Not specified",
        yearsOfExperience: safeString(profileData.yearsOfExperience),
        experienceLevel: safeString(profileData.experienceLevel),
        experience: safeString(profileData.experienceLevel) || "entry",
        employmentStatus: safeString(profileData.employmentStatus),
        industry: safeString(profileData.industry),
        company: safeString(profileData.company),

        // Professional Links
        linkedin: safeString(profileData.linkedin),
        github: safeString(profileData.github),
        portfolio: safeString(profileData.portfolio),

        // Skills
        skills: [...technicalSkills, ...softSkills],
        technicalSkills: technicalSkills,
        softSkills: softSkills,

        // Languages & Certifications
        languages: languages,
        certifications: certifications,

        // Bio & Resume
        bio: safeString(profileData.bio),
        resumeFileName: safeString(profileData.resumeFileName),
        resumeFile: profileData.resumeFile ? "uploaded" : "",

        // Job Preferences
        jobSearchStatus: safeString(profileData.jobSearchStatus),
        preferredJobTypes: preferredJobTypes,
        expectedSalary: safeString(profileData.expectedSalary),
        remotePreference: safeString(profileData.remotePreference),
      };

      const response = await userAPI.updateProfile(apiData);
      toast.success("Profile updated successfully!");
      navigate(`/user/${userId}/dashboard`);
    } catch (error) {
      console.error("❌ Failed to save profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const errors = {};
    // No validation needed - all fields optional
    return errors;
  };

  const StepComponent = steps[currentStep - 1].component;

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step) => (
            <div key={step.id} className="flex-1 text-center relative">
              <div
                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold z-10 relative ${
                  step.id < currentStep
                    ? "bg-green-600 text-white"
                    : step.id === currentStep
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.id < currentStep ? (
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
                ) : (
                  step.id
                )}
              </div>
              <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${((step.id - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600">
                {step.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step Component */}
      <Card className="p-8">
        <StepComponent
          profileData={profileData}
          updateProfileData={updateProfileData}
          errors={formErrors}
          compressImage={compressImage} // 👈 Pass compressImage to Step5BioResume
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep === steps.length ? (
            <Button onClick={handleSave} isLoading={loading}>
              Complete Profile
            </Button>
          ) : (
            <Button onClick={handleNext}>Next Step</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetupWizard;
