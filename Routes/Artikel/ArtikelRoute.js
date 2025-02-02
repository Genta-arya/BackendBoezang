import express from "express";
import { CreateArtikel } from "../../src/controllers/ARTIKEL/CREATE/CreateArtikel.js";

import { getArtikel } from "../../src/controllers/ARTIKEL/GET/GetArtikel.js";
import {
  EditArtikel,
  EditSingleStatus,
} from "../../src/controllers/ARTIKEL/PUT/EditArtikel.js";

const ArtikelRouters = express.Router();

ArtikelRouters.post("/data",  CreateArtikel);
ArtikelRouters.get("/data", getArtikel);
ArtikelRouters.put("/data/:id", EditArtikel);
ArtikelRouters.put("/data/status/:id", EditSingleStatus);
export default ArtikelRouters;
