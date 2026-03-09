import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { userAPI } from "../services/api";

let cachedProfile = null;
let cachedPhoto = null;
let fetchPromise = null;

export const useUserData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(cachedProfile);
  const [photo, setPhoto] = useState(cachedPhoto);
  const [loading, setLoading] = useState(!cachedProfile && !cachedPhoto);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setPhoto(null);
      cachedProfile = null;
      cachedPhoto = null;
      return;
    }

    const fetchData = async () => {
      // Use cached data if available
      if (cachedProfile && cachedPhoto) {
        setProfile(cachedProfile);
        setPhoto(cachedPhoto);
        setLoading(false);
        return;
      }

      // Prevent multiple simultaneous requests
      if (!fetchPromise) {
        fetchPromise = Promise.all([
          userAPI.getProfile().catch(() => ({ data: null })),
          userAPI.getPhoto().catch(() => ({ photoURL: null })),
        ]);
      }

      const [profileRes, photoRes] = await fetchPromise;

      cachedProfile = profileRes?.data || null;
      cachedPhoto = photoRes?.photoURL || null;

      setProfile(cachedProfile);
      setPhoto(cachedPhoto);
      setLoading(false);

      // Reset promise after completion
      fetchPromise = null;
    };

    setLoading(true);
    fetchData();

    // Cleanup
    return () => {
      // Don't clear cache on unmount
    };
  }, [user]);

  const refreshData = async () => {
    cachedProfile = null;
    cachedPhoto = null;
    fetchPromise = null;
    setLoading(true);

    const [profileRes, photoRes] = await Promise.all([
      userAPI.getProfile(),
      userAPI.getPhoto(),
    ]);

    cachedProfile = profileRes.data;
    cachedPhoto = photoRes.photoURL;

    setProfile(cachedProfile);
    setPhoto(cachedPhoto);
    setLoading(false);
  };

  return { profile, photo, loading, refreshData };
};
