import express from "express";
import { createPromo } from "../../src/controllers/ProducstPromo/CREATE/CreatePromo.js";

const PromosRouters = express.Router();

PromosRouters.post("/data", createPromo);
export default PromosRouters;
