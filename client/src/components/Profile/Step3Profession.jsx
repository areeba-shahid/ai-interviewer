import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const professions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "Project Manager",
  "UI/UX Designer",
  "QA Engineer",
  "System Administrator",
  "Cloud Architect",
  "Security Engineer",
  "Mobile Developer",
  "Game Developer",
  "Embedded Systems Engineer",
  "Database Administrator",
  "Network Engineer",
  "Technical Lead",
  "Engineering Manager",
  "CTO",
  "Tech Consultant",
  "Scrum Master",
  "Business Analyst",
];

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Media & Entertainment",
  "Telecommunications",
  "Consulting",
  "Government",
  "Non-profit",
  "Manufacturing",
  "Retail",
  "Transportation",
  "Energy",
  "Real Estate",
  "Hospitality",
  "Aerospace",
  "Automotive",
  "Biotechnology",
  "Cybersecurity",
];

const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Airbnb",
  "Twitter",
  "LinkedIn",
  "Salesforce",
  "Adobe",
  "Oracle",
  "IBM",
  "Intel",
  "Cisco",
  "Spotify",
  "Slack",
  "Zoom",
  "Dropbox",
  "Others",
  "None",
];

const Step3Profession = ({ profileData, updateProfileData, errors }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tell us about your career</h2>

      <div className="space-y-6">
        {/* Current Profession - Autocomplete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Profession <span className="text-red-500">*</span>
          </label>
          <Autocomplete
            freeSolo
            options={professions}
            value={profileData.currentProfession}
            onChange={(event, newValue) => {
              updateProfileData({ currentProfession: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Start typing your profession..."
                error={!!errors.currentProfession}
                helperText={errors.currentProfession}
                variant="outlined"
              />
            )}
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={profileData.yearsOfExperience}
            onChange={(e) =>
              updateProfileData({ yearsOfExperience: e.target.value })
            }
            placeholder="e.g., 5"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          <select
            value={profileData.experienceLevel}
            onChange={(e) =>
              updateProfileData({ experienceLevel: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select level</option>
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="junior">Junior (2-3 years)</option>
            <option value="mid">Mid-Level (3-5 years)</option>
            <option value="senior">Senior (5-8 years)</option>
            <option value="lead">Lead (8+ years)</option>
            <option value="executive">Executive (10+ years)</option>
          </select>
        </div>

        {/* Employment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status
          </label>
          <select
            value={profileData.employmentStatus}
            onChange={(e) =>
              updateProfileData({ employmentStatus: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="employed">Employed Full-time</option>
            <option value="part-time">Employed Part-time</option>
            <option value="contract">Contract/Freelance</option>
            <option value="intern">Intern</option>
            <option value="student">Student</option>
            <option value="unemployed">Actively Looking</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <Autocomplete
            freeSolo
            options={industries}
            value={profileData.industry}
            onChange={(event, newValue) => {
              updateProfileData({ industry: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or type industry"
                variant="outlined"
              />
            )}
          />
        </div>

        {/* Current Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Company
          </label>
          <Autocomplete
            freeSolo
            options={companies}
            value={profileData.company}
            onChange={(event, newValue) => {
              updateProfileData({ company: newValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select or type company name"
                variant="outlined"
              />
            )}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional Links</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Profile
            </label>
            <input
              type="url"
              value={profileData.linkedin}
              onChange={(e) => updateProfileData({ linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Profile
            </label>
            <input
              type="url"
              value={profileData.github}
              onChange={(e) => updateProfileData({ github: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio Website
            </label>
            <input
              type="url"
              value={profileData.portfolio}
              onChange={(e) => updateProfileData({ portfolio: e.target.value })}
              placeholder="https://yourportfolio.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Profession;
