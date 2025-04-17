import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import agentRoutes from "./routes/agent.routes.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"

dotenv.config()
const app = express()

app.use(cors({credentials:true,origin:true}))
app.use(cookieParser())

app.use("/api/v1/agent", agentRoutes)
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/user", userRoutes)

app.listen(4000,()=> console.log("Server Started At PORT:", 4000))