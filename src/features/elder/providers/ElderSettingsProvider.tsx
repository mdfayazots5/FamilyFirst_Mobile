import React, { createContext, useContext, useState, useEffect } from 'react';

interface ElderSettingsContextType {
  fontSize: string;
  language: string;
  setFontSize: (size: string) => void;
  setLanguage: (lang: string) => void;
  scale: number;
}

const ElderSettingsContext = createContext<ElderSettingsContextType | undefined>(undefined);

export const ElderSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState(localStorage.getItem('elderFontSize') || '1.3');
  const [language, setLanguageState] = useState(localStorage.getItem('elderLanguage') || 'English');

  const setFontSize = (size: string) => {
    setFontSizeState(size);
    localStorage.setItem('elderFontSize', size);
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('elderLanguage', lang);
  };

  const scale = parseFloat(fontSize);

  return (
    <ElderSettingsContext.Provider value={{ fontSize, language, setFontSize, setLanguage, scale }}>
      <div style={{ fontSize: `${16 * scale}px` }} className="min-h-screen">
        {children}
      </div>
    </ElderSettingsContext.Provider>
  );
};

export const useElderSettings = () => {
  const context = useContext(ElderSettingsContext);
  if (context === undefined) {
    throw new Error('useElderSettings must be used within an ElderSettingsProvider');
  }
  return context;
};
