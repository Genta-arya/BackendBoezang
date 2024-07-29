import express from "express";
import { GetDataSearch } from "../../src/controllers/Search/SearchController.js";


const SearchRouters = express.Router();

SearchRouters.get("/data", GetDataSearch);

export default SearchRouters;
