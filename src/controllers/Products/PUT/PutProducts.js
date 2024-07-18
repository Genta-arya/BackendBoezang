import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";
import { SchemaProduct } from "../../../../Types/Joi.js";

export const  EditSingleProduct = async (req, res) => {
    let imagePath = null;
  
    const { id } = req.params;
    console.log("ini id : ", id);
  
    try {
      // Cari produk yang ingin diupdate
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });
  
      if (!existingProduct) {
        return res.status(404).json({
          status: "error",
          message: "Produk tidak ditemukan",
        });
      }
  
      // Proses gambar jika ada
      if (req.file) {
        // Hapus gambar lama jika ada
        if (existingProduct.image) {
          const oldImagePath = path.join(
            "Images",
            path.basename(existingProduct.image)
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
  
        // Dapatkan nama file gambar baru
        const imageFileName = path.basename(req.file.path);
        // Tentukan path gambar lokal dan URL lengkap
        const localImagePath = path.join("Images", imageFileName);
        imagePath = `http://localhost:${process.env.PORT || 5001}/${localImagePath}`;
      } else {
        imagePath = existingProduct.image; // Jika tidak ada gambar baru, gunakan gambar lama
      }
  
      const productData = req.body;
  
      // Jika capacities atau colors adalah string JSON, parse menjadi array
      if (typeof productData.capacities === "string") {
        productData.capacities = JSON.parse(productData.capacities);
      }
  
      if (typeof productData.colors === "string") {
        productData.colors = JSON.parse(productData.colors);
      }
      console.log(productData.capacities)
  
      // Filter out any empty or undefined elements
      const sanitizedCapacities = productData.capacities
        .filter(capacity => capacity !== undefined && capacity !== null)
        .map(capacityObj => capacityObj.value); // Extract only the value
  
      const sanitizedColors = productData.colors
        .filter(color => color !== undefined && color !== null)
        .map(colorObj => colorObj); // Extract only the value
  
      // Validasi data produk
      const { error, value } = SchemaProduct.validate({
        ...productData,
 
        colors: sanitizedColors
      });
      if (error) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          details: error.details,
        });
      }
  
      // Perbarui data produk
      const updatedProduct = await prisma.product.update({
        where: { id: id },
        data: {
          name: value.name,
          price: value.price,
          category: value.category,
          description: value.description,
          image: imagePath, // Gunakan URL gambar lengkap
        },
      });
  
      // Hapus kapasitas lama
      await prisma.capacity.deleteMany({
        where: { productId: id },
      });
  
      // Tambahkan kapasitas baru
      if (productData.capacities && productData.capacities.length > 0) {
        await prisma.capacity.createMany({
          data: productData.capacities.map(capacity => ({
            value: capacity,
            productId: updatedProduct.id,
          })),
        });
      }
  
      // Hapus warna lama
      await prisma.color.deleteMany({
        where: { productId: id },
      });
  
      // Tambahkan warna baru
      if (sanitizedColors && sanitizedColors.length > 0) {
        await prisma.color.createMany({
          data: sanitizedColors.map(color => ({
            value: color,
            productId: updatedProduct.id,
          })),
        });
      }
  
      return res.status(200).json({
        status: "success",
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
  
      console.error("Error updating product:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  };
  