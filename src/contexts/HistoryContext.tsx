import { createContext, useContext, useState, ReactNode } from 'react';

interface HistoryContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <HistoryContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistoryRefresh = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistoryRefresh must be used within a HistoryProvider');
  }
  return context;
};
