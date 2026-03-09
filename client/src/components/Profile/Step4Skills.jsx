import { useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Button from "../UI/Button";
import { safeString, safeArray } from "../../utils/safeHelpers";

const Step4Skills = ({ profileData, updateProfileData, errors }) => {
  // Safely access arrays with safeArray
  const technicalSkills = safeArray(profileData?.technicalSkills);
  const softSkills = safeArray(profileData?.softSkills);
  const languages = safeArray(profileData?.languages);
  const certifications = safeArray(profileData?.certifications);

  // Common technical skills for suggestions
  const technicalSkillOptions = [
    // Frontend
    { value: "JavaScript", label: "JavaScript", category: "Frontend" },
    { value: "TypeScript", label: "TypeScript", category: "Frontend" },
    { value: "React", label: "React", category: "Frontend" },
    { value: "Vue.js", label: "Vue.js", category: "Frontend" },
    { value: "Angular", label: "Angular", category: "Frontend" },
    { value: "Next.js", label: "Next.js", category: "Frontend" },
    { value: "HTML5", label: "HTML5", category: "Frontend" },
    { value: "CSS3", label: "CSS3", category: "Frontend" },
    { value: "SASS/SCSS", label: "SASS/SCSS", category: "Frontend" },
    { value: "Tailwind CSS", label: "Tailwind CSS", category: "Frontend" },

    // Backend
    { value: "Node.js", label: "Node.js", category: "Backend" },
    { value: "Python", label: "Python", category: "Backend" },
    { value: "Java", label: "Java", category: "Backend" },
    { value: "C#", label: "C#", category: "Backend" },
    { value: "PHP", label: "PHP", category: "Backend" },
    { value: "Ruby", label: "Ruby", category: "Backend" },
    { value: "Go", label: "Go", category: "Backend" },
    { value: "Rust", label: "Rust", category: "Backend" },
    { value: "Express.js", label: "Express.js", category: "Backend" },
    { value: "Django", label: "Django", category: "Backend" },
    { value: "Flask", label: "Flask", category: "Backend" },
    { value: "Spring Boot", label: "Spring Boot", category: "Backend" },
    { value: "Laravel", label: "Laravel", category: "Backend" },
    { value: "Rails", label: "Rails", category: "Backend" },

    // Database
    { value: "MongoDB", label: "MongoDB", category: "Database" },
    { value: "PostgreSQL", label: "PostgreSQL", category: "Database" },
    { value: "MySQL", label: "MySQL", category: "Database" },
    { value: "Redis", label: "Redis", category: "Database" },
    { value: "Elasticsearch", label: "Elasticsearch", category: "Database" },
    { value: "Firebase", label: "Firebase", category: "Database" },
    { value: "DynamoDB", label: "DynamoDB", category: "Database" },
    { value: "Cassandra", label: "Cassandra", category: "Database" },

    // DevOps & Cloud
    { value: "AWS", label: "AWS", category: "DevOps" },
    { value: "Azure", label: "Azure", category: "DevOps" },
    { value: "Google Cloud", label: "Google Cloud", category: "DevOps" },
    { value: "Docker", label: "Docker", category: "DevOps" },
    { value: "Kubernetes", label: "Kubernetes", category: "DevOps" },
    { value: "Jenkins", label: "Jenkins", category: "DevOps" },
    { value: "GitHub Actions", label: "GitHub Actions", category: "DevOps" },
    { value: "Terraform", label: "Terraform", category: "DevOps" },
    { value: "Ansible", label: "Ansible", category: "DevOps" },

    // Testing
    { value: "Jest", label: "Jest", category: "Testing" },
    { value: "Mocha", label: "Mocha", category: "Testing" },
    { value: "Cypress", label: "Cypress", category: "Testing" },
    { value: "Selenium", label: "Selenium", category: "Testing" },
    { value: "JUnit", label: "JUnit", category: "Testing" },
    { value: "PyTest", label: "PyTest", category: "Testing" },

    // Mobile
    { value: "React Native", label: "React Native", category: "Mobile" },
    { value: "Flutter", label: "Flutter", category: "Mobile" },
    { value: "Swift", label: "Swift", category: "Mobile" },
    { value: "Kotlin", label: "Kotlin", category: "Mobile" },
    { value: "Android", label: "Android", category: "Mobile" },
    { value: "iOS", label: "iOS", category: "Mobile" },

    // AI/ML
    { value: "TensorFlow", label: "TensorFlow", category: "AI/ML" },
    { value: "PyTorch", label: "PyTorch", category: "AI/ML" },
    { value: "Scikit-learn", label: "Scikit-learn", category: "AI/ML" },
    { value: "Pandas", label: "Pandas", category: "AI/ML" },
    { value: "NumPy", label: "NumPy", category: "AI/ML" },
    { value: "OpenAI", label: "OpenAI", category: "AI/ML" },
    { value: "LangChain", label: "LangChain", category: "AI/ML" },
  ];

  // Soft skills options
  const softSkillOptions = [
    { value: "Communication", label: "Communication", category: "Soft Skills" },
    { value: "Teamwork", label: "Teamwork", category: "Soft Skills" },
    { value: "Leadership", label: "Leadership", category: "Soft Skills" },
    {
      value: "Problem Solving",
      label: "Problem Solving",
      category: "Soft Skills",
    },
    {
      value: "Critical Thinking",
      label: "Critical Thinking",
      category: "Soft Skills",
    },
    {
      value: "Time Management",
      label: "Time Management",
      category: "Soft Skills",
    },
    { value: "Adaptability", label: "Adaptability", category: "Soft Skills" },
    { value: "Creativity", label: "Creativity", category: "Soft Skills" },
    {
      value: "Emotional Intelligence",
      label: "Emotional Intelligence",
      category: "Soft Skills",
    },
    {
      value: "Conflict Resolution",
      label: "Conflict Resolution",
      category: "Soft Skills",
    },
    { value: "Mentoring", label: "Mentoring", category: "Soft Skills" },
    { value: "Presentation", label: "Presentation", category: "Soft Skills" },
    { value: "Writing", label: "Writing", category: "Soft Skills" },
  ];

  // Languages options
  const languageOptions = [
    { value: "English", label: "English" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Arabic", label: "Arabic" },
    { value: "Hindi", label: "Hindi" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
    { value: "Korean", label: "Korean" },
    { value: "Italian", label: "Italian" },
  ];

  // Handle adding technical skill
  const handleAddTechnicalSkill = (newSkill) => {
    if (!newSkill) return;

    const skillValue =
      typeof newSkill === "string" ? newSkill : newSkill?.value;
    if (!skillValue) return;

    if (!technicalSkills.includes(skillValue)) {
      updateProfileData({
        technicalSkills: [...technicalSkills, skillValue],
      });
    }
  };

  // Handle removing technical skill
  const handleRemoveTechnicalSkill = (skillToRemove) => {
    updateProfileData({
      technicalSkills: technicalSkills.filter((s) => s !== skillToRemove),
    });
  };

  // Handle adding soft skill
  const handleAddSoftSkill = (newSkill) => {
    if (!newSkill) return;

    const skillValue =
      typeof newSkill === "string" ? newSkill : newSkill?.value;
    if (!skillValue) return;

    if (!softSkills.includes(skillValue)) {
      updateProfileData({
        softSkills: [...softSkills, skillValue],
      });
    }
  };

  // Handle removing soft skill
  const handleRemoveSoftSkill = (skillToRemove) => {
    updateProfileData({
      softSkills: softSkills.filter((s) => s !== skillToRemove),
    });
  };

  // Handle adding language
  const handleAddLanguage = (newLanguage) => {
    if (!newLanguage) return;

    const languageValue =
      typeof newLanguage === "string" ? newLanguage : newLanguage?.value;
    if (!languageValue) return;

    if (!languages.some((l) => l.name === languageValue)) {
      updateProfileData({
        languages: [
          ...languages,
          {
            name: languageValue,
            proficiency: "Beginner",
          },
        ],
      });
    }
  };

  // Handle language proficiency change
  const handleLanguageProficiencyChange = (languageName, proficiency) => {
    updateProfileData({
      languages: languages.map((lang) =>
        lang.name === languageName ? { ...lang, proficiency } : lang
      ),
    });
  };

  // Handle removing language
  const handleRemoveLanguage = (languageName) => {
    updateProfileData({
      languages: languages.filter((l) => l.name !== languageName),
    });
  };

  // Handle adding certification
  const handleAddCertification = () => {
    const newCert = {
      name: "",
      issuer: "",
      year: "",
      link: "",
    };
    updateProfileData({
      certifications: [...certifications, newCert],
    });
  };

  // Handle certification field change
  const handleCertificationChange = (index, field, value) => {
    const updatedCerts = [...certifications];
    updatedCerts[index] = {
      ...updatedCerts[index],
      [field]: safeString(value),
    };
    updateProfileData({ certifications: updatedCerts });
  };

  // Handle removing certification
  const handleRemoveCertification = (index) => {
    updateProfileData({
      certifications: certifications.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Skills & Expertise</h2>
      <p className="text-gray-600 mb-8">
        Add your technical skills, soft skills, languages, and certifications.
        (All optional)
      </p>

      <div className="space-y-8">
        {/* Technical Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technical Skills (Optional)
          </label>

          <CreatableSelect
            isMulti
            options={technicalSkillOptions}
            value={technicalSkills.map((skill) => ({
              value: skill,
              label: skill,
            }))}
            onChange={(newValue) => {
              updateProfileData({
                technicalSkills: newValue ? newValue.map((v) => v.value) : [],
              });
            }}
            onCreateOption={handleAddTechnicalSkill}
            placeholder="Type or select technical skills..."
            className="react-select"
            classNamePrefix="select"
            formatGroupLabel={(data) => (
              <div className="flex items-center py-1">
                <span className="font-semibold text-gray-700">
                  {data.label}
                </span>
              </div>
            )}
          />

          <div className="mt-2 flex flex-wrap gap-2 min-h-[40px]">
            {technicalSkills.length > 0 ? (
              technicalSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnicalSkill(skill)}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No technical skills added</p>
            )}
          </div>
        </div>

        {/* Soft Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Soft Skills (Optional)
          </label>
          <CreatableSelect
            isMulti
            options={softSkillOptions}
            value={softSkills.map((skill) => ({
              value: skill,
              label: skill,
            }))}
            onChange={(newValue) => {
              updateProfileData({
                softSkills: newValue ? newValue.map((v) => v.value) : [],
              });
            }}
            onCreateOption={handleAddSoftSkill}
            placeholder="Type or select soft skills..."
            className="react-select"
            classNamePrefix="select"
          />

          <div className="mt-2 flex flex-wrap gap-2 min-h-[40px]">
            {softSkills.length > 0 ? (
              softSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSoftSkill(skill)}
                    className="ml-1 text-green-700 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No soft skills added</p>
            )}
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages (Optional)
          </label>
          <CreatableSelect
            options={languageOptions}
            value={null}
            onChange={(option) => handleAddLanguage(option)}
            onCreateOption={handleAddLanguage}
            placeholder="Add languages you speak..."
            className="react-select mb-3"
            classNamePrefix="select"
          />

          <div className="space-y-3">
            {languages.length > 0 ? (
              languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium min-w-[100px]">
                    {safeString(lang?.name)}
                  </span>
                  <select
                    value={lang?.proficiency || "Beginner"}
                    onChange={(e) =>
                      handleLanguageProficiencyChange(
                        lang?.name,
                        e.target.value
                      )
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Native">Native</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang?.name)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No languages added</p>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Certifications (Optional)
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCertification}
            >
              + Add Certification
            </Button>
          </div>

          <div className="space-y-4">
            {certifications.length > 0 ? (
              certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={safeString(cert?.name)}
                      onChange={(e) =>
                        handleCertificationChange(index, "name", e.target.value)
                      }
                      placeholder="Certification Name"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={safeString(cert?.issuer)}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "issuer",
                          e.target.value
                        )
                      }
                      placeholder="Issuing Organization"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={safeString(cert?.year)}
                      onChange={(e) =>
                        handleCertificationChange(index, "year", e.target.value)
                      }
                      placeholder="Year"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={safeString(cert?.link)}
                      onChange={(e) =>
                        handleCertificationChange(index, "link", e.target.value)
                      }
                      placeholder="Credential URL (optional)"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No certifications added</p>
            )}
          </div>
        </div>

        {/* Additional Skills Note */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-800">
                About Skills
              </h4>
              <p className="text-sm text-blue-700">
                Don't worry if you don't know all the skills. The AI will adapt
                questions based on the skills you add here. You can always
                update them later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Skills;
