import { useState, useEffect } from "react";
import Select from "react-select";
import countries from "../../data/countries";
import citiesByCountry from "../../data/cities";

const Step2Location = ({ profileData, updateProfileData, errors }) => {
  const [cityOptions, setCityOptions] = useState([]);

  // Format countries for react-select
  const countryOptions = countries.map((country) => ({
    value: country.code,
    label: country.name,
  }));

  // Update cities when country changes
  useEffect(() => {
    if (profileData.country) {
      const cities = citiesByCountry[profileData.country] || [];
      setCityOptions(
        cities.map((city) => ({
          value: city,
          label: city,
        }))
      );
    } else {
      setCityOptions([]);
    }
  }, [profileData.country]);

  const timezones = Intl.supportedValuesOf("timeZone").map((tz) => ({
    value: tz,
    label: tz,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Where are you located?</h2>

      <div className="space-y-6">
        {/* Country Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <Select
            options={countryOptions}
            value={countryOptions.find((c) => c.value === profileData.country)}
            onChange={(option) =>
              updateProfileData({
                country: option?.value || "",
                city: "", // Reset city when country changes
              })
            }
            placeholder="Select your country"
            className="react-select"
            classNamePrefix="select"
            isClearable
          />
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* City Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <Select
            options={cityOptions}
            value={cityOptions.find((c) => c.value === profileData.city)}
            onChange={(option) =>
              updateProfileData({ city: option?.value || "" })
            }
            placeholder={
              profileData.country
                ? "Select your city"
                : "Select a country first"
            }
            isDisabled={!profileData.country}
            className="react-select"
            classNamePrefix="select"
            isClearable
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={profileData.address || ""}
            onChange={(e) => updateProfileData({ address: e.target.value })}
            placeholder="e.g., 123 Main Street, Apt 4B"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            value={profileData.postalCode || ""}
            onChange={(e) => updateProfileData({ postalCode: e.target.value })}
            placeholder="e.g., 10001"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <Select
            options={timezones}
            value={timezones.find((tz) => tz.value === profileData.timezone)}
            onChange={(option) =>
              updateProfileData({ timezone: option?.value || "" })
            }
            placeholder="Select your timezone"
            className="react-select"
            classNamePrefix="select"
            isClearable
          />
        </div>
      </div>
    </div>
  );
};

export default Step2Location;
