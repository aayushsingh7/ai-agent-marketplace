import { FC, ReactNode } from "react";

interface PageProps { 
    children:ReactNode;
    width?:string;
}

const Page: FC<PageProps> = ({width="100%",children,...props}) => {
  return (
    <div style={{padding:"26px 20px",width:width}} {...props} className="page">
      {children}
    </div>
  );
};

export default Page;