// Safe array access - never returns undefined
export const safeArray = (arr) => {
  return Array.isArray(arr) ? arr : [];
};

// Safe string - never returns undefined/null
export const safeString = (str) => {
  if (str === null || str === undefined) return "";
  return String(str);
};

// Safe object - never returns undefined
export const safeObject = (obj) => {
  return obj && typeof obj === "object" ? obj : {};
};

// Safe number - returns 0 if invalid
export const safeNumber = (num) => {
  const parsed = Number(num);
  return isNaN(parsed) ? 0 : parsed;
};

// Safe boolean - returns false if invalid
export const safeBoolean = (bool) => {
  return Boolean(bool);
};

// Safe display - shows placeholder if empty
export const safeDisplay = (value, placeholder = "Not provided") => {
  if (value === null || value === undefined || value === "") {
    return placeholder;
  }
  return value;
};
