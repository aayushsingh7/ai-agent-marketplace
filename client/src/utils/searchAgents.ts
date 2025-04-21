const searchAgents = async (
    query:string,
    navigate:any
  ): Promise<any[] | null> => {
    try {
      if(query === "") navigate("/marketplace")
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agents/search?query=${query}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  

export default searchAgents;