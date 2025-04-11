import { FC, ReactNode } from "react";

interface PageProps { 
    children:ReactNode;
}

const Page: FC<PageProps> = ({children}) => {
  return (
    <div style={{padding:"26px 20px",width:"100%"}}>
      {children}
    </div>
  );
};

export default Page;