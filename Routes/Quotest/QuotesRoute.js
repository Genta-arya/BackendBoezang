import express from "express";
import { CreateQuotest } from "../../src/controllers/Quotest/CREATE/CreateQuotest.js";
import { getQuotest } from "../../src/controllers/Quotest/GET/GetQuotest.js";
import { EditQuotes } from "../../src/controllers/Quotest/PUT/EditQutest.js";
import { DeleteQuotest } from "../../src/controllers/Quotest/DELETE/DeleteQuotest.js";

const QuotesRouters = express.Router();
QuotesRouters.post("/data", CreateQuotest);
QuotesRouters.get("/data", getQuotest);
QuotesRouters.put("/data/:id", EditQuotes);
QuotesRouters.delete("/data/:id", DeleteQuotest);
export default QuotesRouters;
