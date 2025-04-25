import { FC, ReactNode } from "react";

interface PageProps { 
    children:ReactNode;
    width:"full" | "fit" | "half";
}

const Page: FC<PageProps> = ({width,children,...props}) => {
  return (
    <div {...props} className={`${width} page`}>
      {children}
    </div>
  );
};

export default Page;