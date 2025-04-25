import { createContext, ReactNode, useContext, useState } from "react";

// Define a type for your context value
type AppContextType = {
  loggedInUser: any | null;
  verifyUser: boolean;
  selectedAgent: any;
  showBuyAgent: any;
  processingText: string;
  isProcessing: boolean;
  editNFT:boolean;
  agentUsage:boolean;
  processingDescription: string;
  showSideNav:boolean; 
  setShowSideNav:any;
  setAgentUsage:any;
  setEditNFT:any;
  setShowBuyAgent: any;
  setIsProcessing: any;
  setSelectedAgent: any;
  setVerifyUser: any;
  setLoggedInUser: any;
  setProcessingText: any;
  setProcessingDescription: any;
};

// Create context with undefined default
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [verifyUser, setVerifyUser] = useState<boolean>(true);
  const [selectedAgent, setSelectedAgent] = useState<any>({});
  const [showBuyAgent, setShowBuyAgent] = useState<boolean>(false);
  const [processingText, setProcessingText] = useState<string>("");
  const [processingDescription, setProcessingDescription] =
    useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [editNFT, setEditNFT] = useState<boolean>(false);
  const [agentUsage,setAgentUsage] = useState<boolean>(false);
  const [showSideNav, setShowSideNav] = useState<boolean>(false)
  
  const value: AppContextType = {
    loggedInUser,
    verifyUser,
    selectedAgent,
    showBuyAgent,
    processingDescription,
    processingText,
    isProcessing,
    editNFT,
    agentUsage,
    showSideNav, 
    setShowSideNav,
    setAgentUsage,
    setEditNFT,
    setIsProcessing,
    setProcessingDescription,
    setProcessingText,
    setShowBuyAgent,
    setSelectedAgent,
    setVerifyUser,
    setLoggedInUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to consume the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
