import { createContext, ReactNode, useContext, useState } from "react";

// Define a type for your context value
type AppContextType = {
  loggedInUser: any | null;
  verifyUser:boolean;
  setVerifyUser:any;
  setLoggedInUser:any;
};

// Create context with undefined default
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [verifyUser,setVerifyUser] = useState<boolean>(true)

 

  const value: AppContextType = {
   loggedInUser,
   verifyUser,
   setVerifyUser,
   setLoggedInUser
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to consume the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
