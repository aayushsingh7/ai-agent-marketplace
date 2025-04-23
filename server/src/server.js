import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import agentRoutes from "./routes/agent.routes.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import walletRoutes from "./routes/wallet.routes.js"
import connectDB from "./database/connection.js"

dotenv.config()
const app = express()
connectDB()

app.use(cookieParser())
app.use(cors({credentials:true,origin:true}))
app.use(express.json())


// Just for Simulating Agents (not server code) -------------------------------------------
app.post("/api/v1/trading-agent", async(req,res)=> {
    res.status(200).json({
       data:"This will be the response from AI Agents hosted on your's sever or cloud service",
       success:true,
    })
})

app.post("/api/v1/booking-agent", async(req,res)=> {
    res.status(200).json({
       data:"This will be the response from AI Agents hosted on your's sever or cloud service",
       success:true,
    })
})
// --------------------------------------------------------------------------


app.use("/api/v1/agents", agentRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/wallets", walletRoutes)

app.listen(4000,()=> console.log("Server Started At PORT:", 4000))