import express from "express";
import {
  addBrowsur,
  deleteBrowsur,
  editBrowsur,
  editSingleImage,
  getBrowsur,
  updateStatus,
} from "../../src/controllers/Browsur/BrowsurController.js";
import { upload } from "../../src/config/Multer.js";

const BrowsurRouters = express.Router();

BrowsurRouters.post("/data/upload", upload.array("image", 2), addBrowsur);
BrowsurRouters.get("/data", getBrowsur);

BrowsurRouters.put("/data/edit/:id", editBrowsur);
BrowsurRouters.put(
  "/data/edit/:id/image/:imageId",
  upload.single("image"),
  editSingleImage
);
BrowsurRouters.delete("/data/:id", deleteBrowsur);
BrowsurRouters.put("/data/status/:id", updateStatus);
export default BrowsurRouters;
