import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
const port = process.env.PORT || 5001; // Use port 5001 if not specified

export const CreateProduk = async (req, res) => {
  let imagePath = null;

  try {
    // Process image if provided
    if (req.file) {
      const imageFileName = path.basename(req.file.path);
      const localImagePath = path.join("Images", imageFileName);
      const imageBaseUrl = process.env.IMAGE_BASE_URL;

      imagePath = `${imageBaseUrl}/${localImagePath}`;
    }

    // Get data from request body
    const { name, category, variants, desc, spesifikasi } = req.body;

    // Parse the variants JSON string
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "Invalid variants data format",
      });
    }

    // Validate data
    if (!name || !category || !Array.isArray(parsedVariants) || !desc) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "Invalid data provided",
      });
    }

    // Create product
    const randomId = uuidv4();
    const formattedDate = new Date().toISOString().split('T')[0]; 
    const customId = `${name.toLowerCase().replace(/\s+/g, '-')}-${formattedDate}-${randomId}`; 

    const newProduct = await prisma.produk.create({
      data: {
        id: customId,
        name,
        category,
        spesifikasi: spesifikasi,
        deskripsi: desc,
        imageUrl: imagePath, // Use full image URL
        variants: {
          create: parsedVariants.map((variant) => ({
            name: "produk",
            externalId: uuidv4(),
            kapasitas:
              category.toLowerCase() === "iphone"
                ? parseInt(variant.kapasitas, 10)
                : 0, 
            price:
              category.toLowerCase() === "iphone"
                ? parseInt(variant.price, 10)
                : parseInt(variant.price, 10), // Set price only for non-iPhone products
            colorVariants: {
              create: variant.colorVariants.map((color) => ({
                value: color,
              })),
            },
          })),
        },
      },
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

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
