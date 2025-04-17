import {
  AreaChart as Chart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


const data = Array.from({ length: 15 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (14 - i)); // from 30 days ago to today
  
    return {
      name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), // e.g. "Apr 16"
      uv: Math.floor(Math.random() * 300) + 100,  // Unique visitors (mock)
      pv: Math.floor(Math.random() * 1000) + 500, // API requests (page views)
      amt: Math.floor(Math.random() * 3000) + 1000, // Total credits consumed
    };
  });
  

const AreaChart = () => {
  return (
    <div style={{ height: "350px", width: "100%", marginTop:"40px"}}>
    <h4 style={{fontSize:"0.7rem"}}>API Usage This Week</h4>
    <ResponsiveContainer width="100%" height="100%" style={{marginLeft:"-30px",marginTop:"20px"}}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <XAxis tick={{ style: { fontSize: 12 } }} dataKey="name" />
        <YAxis domain={[0, 500]} tick={{ style: { fontSize: 12 } }} />
        <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="#8884d8" />
      </Chart>
    </ResponsiveContainer>
  </div>
  
  );
};

export default AreaChart;
