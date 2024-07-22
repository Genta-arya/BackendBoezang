import express from "express";

import { upload } from "../../src/config/Multer.js";

import { EditProduks} from "../../src/controllers/Products/PUT/PutProducts.js";
import { DeleteSingleProduct } from "../../src/controllers/Products/DELETE/DeleteProducts.js";
import { CreateProduk } from "../../src/controllers/Products/CREATE/CreateProduk.js";
import {
  getProduk,
  getProdukByCategory,
  getSingleProduk,
} from "../../src/controllers/Products/GET/GetProduk.js";

const ProductsRouters = express.Router();

ProductsRouters.post("/upload", upload.single("image"), CreateProduk);
ProductsRouters.get("/data", getProduk);
ProductsRouters.delete("/data/:id", DeleteSingleProduct);
ProductsRouters.put("/data/:id", upload.single("image"), EditProduks);
ProductsRouters.get("/data/:id", getSingleProduk);
ProductsRouters.get("/data/category/:category" , getProdukByCategory)
export default ProductsRouters;
