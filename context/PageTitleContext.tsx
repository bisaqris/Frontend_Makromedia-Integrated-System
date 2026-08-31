'use client';

import React, { createContext, useContext, useState } from 'react';

interface PageTitleContextType {
  customTitle: string | null;
  customSubtitle: string | null;
  setPageTitle: (title: string | null, subtitle: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextType>({
  customTitle: null,
  customSubtitle: null,
  setPageTitle: () => {},
});

export const PageTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customSubtitle, setCustomSubtitle] = useState<string | null>(null);

  const setPageTitle = (title: string | null, subtitle: string | null) => {
    setCustomTitle(title);
    setCustomSubtitle(subtitle);
  };

  return (
    <PageTitleContext.Provider value={{ customTitle, customSubtitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = () => useContext(PageTitleContext);
