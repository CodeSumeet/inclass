import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import prisma from "./config/db";
import routes from "./routes";
import errorHandler from "./utils/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await prisma.$connect();
  console.log("Database connected!");
});

app.use(errorHandler);
