import express from "express";
import { CreateProducts } from "../../src/controllers/Products/CREATE/CreateProducts.js";
import { upload } from "../../src/config/Multer.js";
import { GetTypeProduct } from "../../src/controllers/Products/GET/GetProducts.js";
import { EditSingleProduct } from "../../src/controllers/Products/PUT/PutProducts.js";

const ProductsRouters = express.Router();

ProductsRouters.post("/upload", upload.single("image"), CreateProducts);
ProductsRouters.get("/data", GetTypeProduct);
ProductsRouters.put("/data/:id", upload.single("image"), EditSingleProduct);
export default ProductsRouters;
