import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface DataContextType {
  data: any;
  setData: (data: any) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<any>(null);

  const refreshData = () => {
    // Implementar lógica de refresh quando necessário
    console.log('Refreshing data...');
  };

  const value: DataContextType = {
    data,
    setData,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
