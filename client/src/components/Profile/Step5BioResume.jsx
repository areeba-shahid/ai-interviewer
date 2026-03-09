import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseResume, parseResumeLocally } from "../../utils/Parser_resume";
import Button from "../UI/Button";
import toast from "react-hot-toast";

const Step5BioResume = ({ profileData, updateProfileData, errors }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(
    profileData.profilePhoto || ""
  );

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max 5MB");
        return;
      }

      updateProfileData({
        resumeFile: file,
        resumeFileName: file.name,
        resumeFileType: file.type,
      });
      setIsParsing(true);

      try {
        let parsedData;

        // Try backend parsing first
        try {
          parsedData = await parseResume(file);
          toast.success("Resume parsed successfully using AI!");
        } catch (backendError) {
          console.log("Backend parsing failed, trying local fallback...");

          // Fallback to local parsing for text files
          if (file.type === "text/plain") {
            parsedData = await parseResumeLocally(file);
            toast.success("Resume parsed locally");
          } else {
            toast.success("Resume uploaded. You can fill details manually.");
            return;
          }
        }

        // Auto-fill profile with parsed data
        const updates = {};

        if (parsedData.summary && !profileData.bio) {
          updates.bio = parsedData.summary;
        }

        if (parsedData.skills?.length > 0) {
          updates.technicalSkills = parsedData.skills;
        }

        if (parsedData.name && !profileData.name) {
          updates.name = parsedData.name;
        }

        if (parsedData.email && !profileData.email) {
          updates.email = parsedData.email;
        }

        if (Object.keys(updates).length > 0) {
          updateProfileData(updates);
          toast.success("Profile auto-filled from resume!");
        }
      } catch (error) {
        console.error("Resume parsing failed:", error);
        toast.success("Resume uploaded. You can fill manually.");
      } finally {
        setIsParsing(false);
      }
    },
    [profileData, updateProfileData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large. Max 2MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Create preview and base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPhotoPreview(base64String);
      updateProfileData({
        profilePhoto: base64String,
        profilePhotoFile: file,
        profilePhotoName: file.name,
      });
      toast.success("Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bio & Resume</h2>

      <div className="space-y-6">
        {/* Profile Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Photo
          </label>
          <div className="flex items-center gap-6">
            {/* Photo Preview */}
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                />
              ) : profileData.profilePhoto ? (
                <img
                  src={profileData.profilePhoto}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profileData.name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("photo-upload").click()}
                type="button"
              >
                {photoPreview ? "Change Photo" : "Upload Photo"}
              </Button>
              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, GIF (Max 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume (PDF, DOC, DOCX, TXT)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 hover:border-blue-600 hover:bg-gray-50"
            } ${isParsing ? "opacity-50 cursor-wait" : ""}`}
          >
            <input {...getInputProps()} disabled={isParsing} />

            {isParsing ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-600">Parsing your resume...</p>
              </div>
            ) : profileData.resumeFile ? (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-green-600"
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
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {profileData.resumeFileName || "Resume uploaded"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Drag & drop your resume here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supported: PDF, DOC, DOCX, TXT (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            value={profileData.bio || ""}
            onChange={(e) => updateProfileData({ bio: e.target.value })}
            rows="6"
            placeholder="Tell us about yourself, your experience, and what you're looking for..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            maxLength="500"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              Briefly describe your professional background
            </p>
            <p className="text-xs text-gray-500">
              {profileData.bio?.length || 0}/500
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5BioResume;
