import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";
import { SchemaProduct } from "../../../../Types/Joi.js";

// Tentukan port dari variabel lingkungan atau konfigurasi
const port = process.env.PORT || 5001; // Gunakan port 5001 jika tidak ada port yang ditentukan

export const CreateProducts = async (req, res) => {
  let imagePath = null;

  try {
    if (req.file) {
      // Dapatkan nama file gambar
      const imageFileName = path.basename(req.file.path);
      // Tentukan path gambar lokal dan URL lengkap
      const localImagePath = path.join("Images", imageFileName);
      imagePath = `http://localhost:${port}/${localImagePath}`;
    }

    const productData = req.body;

    // Jika capacities atau colors adalah string JSON, parse menjadi array
    if (typeof productData.capacities === "string") {
      productData.capacities = JSON.parse(productData.capacities);
    }

    if (typeof productData.colors === "string") {
      productData.colors = JSON.parse(productData.colors);
    }

    // Validasi data produk
    const { error, value } = SchemaProduct.validate(productData);
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

    // Periksa apakah produk sudah ada
    const existingProduct = await prisma.product.findFirst({
      where: { name: value.name },
    });

    if (existingProduct) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "Nama produk sudah ada",
      });
    }

    // Buat produk baru
    const newProduct = await prisma.product.create({
      data: {
        name: value.name,
        price: value.price,
        category: value.category,
        description: value.description,
        image: imagePath, // Gunakan URL gambar lengkap
      },
    });

    // Buat kapasitas baru
    if (value.capacities && value.capacities.length > 0) {
      await prisma.capacity.createMany({
        data: value.capacities.map((capacity) => ({
          value: capacity,
          productId: newProduct.id,
        })),
      });
    }

    // Buat warna baru
    if (value.colors && value.colors.length > 0) {
      await prisma.color.createMany({
        data: value.colors.map((color) => ({
          value: color,
          productId: newProduct.id,
        })),
      });
    }

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error creating product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
