// Profile Context: Manages personal dietary restrictions, allergies, and health goals offline
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@labellens_user_profile_v1';
const HISTORY_KEY = '@labellens_scan_history_v1';

const DEFAULT_PROFILE = {
  diabetic: false,
  glutenSensitive: false,
  lactoseIntolerant: false,
  peanutAllergy: false,
  nutAllergy: false,
  vegan: false,
  heartHealthy: true,
  palmOilFree: false,
  childSafe: false,
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved profile & history on app startup
  useEffect(() => {
    async function loadData() {
      try {
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
        const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.warn('Failed to load profile data from local storage:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update a single profile toggle
  const toggleRestriction = async (key) => {
    try {
      const updated = { ...profile, [key]: !profile[key] };
      setProfile(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving profile toggle:', err);
    }
  };

  // Add scan report to history
  const addScanToHistory = async (productTitle, rawText, analysis) => {
    try {
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        title: productTitle || 'Ingredient Scan',
        score: analysis.score,
        grade: analysis.grade,
        verdictTitle: analysis.verdictTitle,
        verdictColor: analysis.verdictColor,
        stats: analysis.stats,
        rawText,
      };
      const updatedHistory = [newEntry, ...history.slice(0, 49)]; // Keep last 50
      setHistory(updatedHistory);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Error saving scan to history:', err);
    }
  };

  // Clear history
  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (err) {
      console.warn('Error clearing history:', err);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        toggleRestriction,
        history,
        addScanToHistory,
        clearHistory,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
