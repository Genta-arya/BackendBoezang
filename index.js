import express from "express";
import { createServer } from "http";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import ProductsRouters from "./Routes/Products/ProductsRoute.js";
import PromosRouters from "./Routes/Promos/PromosRoute.js";

const app = express();
const port = 5001;
const httpServer = createServer(app);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(limiter);
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use("/Images", express.static(path.resolve("Images")));

app.get("/", (req, res) => {
  res.send("API BOEZANG APPLE");
});

app.use("/api/v1/product", ProductsRouters);
app.use("/api/v1/promo", PromosRouters);

httpServer.listen(port, () => {
  console.log("Server running on port " + port);
});
