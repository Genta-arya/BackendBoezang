import express from "express";
import {
  addBrowsur,
  deleteBrowsur,
  editBrowsur,
  editSingleImage,
  getBrowsur,
  updateStatus,
} from "../../src/controllers/Browsur/BrowsurController.js";

const BrowsurRouters = express.Router();

BrowsurRouters.post("/data/upload", addBrowsur);
BrowsurRouters.get("/data", getBrowsur);

BrowsurRouters.put("/data/edit/:id", editBrowsur);
BrowsurRouters.put(
  "/data/edit/:id/image/:imageId",

  editSingleImage
);
BrowsurRouters.delete("/data/:id", deleteBrowsur);
BrowsurRouters.put("/data/status/:id", updateStatus);
export default BrowsurRouters;
