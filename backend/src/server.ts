import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import prisma from "./config/db";
import routes from "./routes";
import errorHandler from "./utils/errorHandler";
import setupSocket from "./socket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = setupSocket(server);

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(errorHandler);

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log("Database connected!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
});

export { app, server, io };
