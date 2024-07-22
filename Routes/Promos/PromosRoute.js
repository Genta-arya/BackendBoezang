import express from "express";
import {
  deletePromo,

} from "../../src/controllers/ProducstPromo/PUT/EditPromo.js";
import { CreateDiscount } from "../../src/controllers/ProducstPromo/CREATE/CreateDiscount.js";

const PromosRouters = express.Router();

PromosRouters.post("/data", CreateDiscount);

PromosRouters.delete("/data/:id", deletePromo);
export default PromosRouters;
