import { FC, ReactNode } from "react";

interface PageProps { 
    children:ReactNode;
}

const Page: FC<PageProps> = ({children,...props}) => {
  return (
    <div style={{padding:"26px 20px",width:"100%"}} {...props} className="page">
      {children}
    </div>
  );
};

export default Page;