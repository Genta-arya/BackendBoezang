import express from "express";



import { EditProduks} from "../../src/controllers/Products/PUT/PutProducts.js";
import { DeleteProducts } from "../../src/controllers/Products/DELETE/DeleteProducts.js";
import { CreateProduk  } from "../../src/controllers/Products/CREATE/CreateProduk.js";
import {
  getProduk,
  getProdukByCategory,
  getSingleProduk,
} from "../../src/controllers/Products/GET/GetProduk.js";

const ProductsRouters = express.Router();

ProductsRouters.post("/upload", CreateProduk);
ProductsRouters.get("/data", getProduk);
ProductsRouters.delete("/data/:id", DeleteProducts);
ProductsRouters.put("/data/:id",  EditProduks);
ProductsRouters.get("/data/:id", getSingleProduk);
ProductsRouters.get("/data/category/:category" , getProdukByCategory)
export default ProductsRouters;
