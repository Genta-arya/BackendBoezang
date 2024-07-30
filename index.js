import express from "express";
import { createServer } from "http";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import ProductsRouters from "./Routes/Products/ProductsRoute.js";
import PromosRouters from "./Routes/Promos/PromosRoute.js";
import AuthRouters from "./Routes/Auth/AuthRoute.js";
import QuotesRouters from "./Routes/Quotest/QuotesRoute.js";

import ArtikelRouters from "./Routes/Artikel/ArtikelRoute.js";
import SearchRouters from "./Routes/Search/SearchRoute.js";
import BrowsurRouters from "./Routes/Browsur/BrowsurRoute.js";
import EmailRouters from "./Routes/EmailSending/EmailRoute.js";
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

app.use("/api/v1/user", AuthRouters);
app.use("/api/v1/product", ProductsRouters);
app.use("/api/v1/promo", PromosRouters);
app.use("/api/v1/quotest", QuotesRouters);
app.use("/api/v1/artikel", ArtikelRouters);	
app.use("/api/v1/search", SearchRouters);	
app.use("/api/v1/popup", BrowsurRouters);	
app.use("/api/v1/email", EmailRouters);	
httpServer.listen(port, () => {
  console.log("Server running on port " + port);
});
