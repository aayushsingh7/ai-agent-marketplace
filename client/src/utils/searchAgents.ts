const searchAgents = async (
    type: string,
    navigate:any,
    e: any
  ): Promise<any[] | null> => {
    if (type === "input" && e.key !== "Enter") return null;
    try {
      navigate(`/marketplace?search=${e.target.value}`)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/agents?query=${e.target.value}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  };
  

export default searchAgents;