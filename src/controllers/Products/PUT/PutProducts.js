import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";
import { SchemaProduct } from "../../../../Types/Joi.js";
import { v4 as uuidv4 } from "uuid";
import { json } from "express";
export const EditProduks = async (req, res) => {
  let imagePath = null;
  const { id } = req.params;

  const { name, category, variants, desc, status, externalIds, spesifikasi } =
    req.body;

  console.log("data externalId", externalIds);

  try {
    // Process image if provided
    if (req.file) {
      const imageFileName = path.basename(req.file.path);
      const localImagePath = path.join("Images", imageFileName);
      const imageBaseUrl = process.env.IMAGE_BASE_URL;
      if (process.env.NODE_ENV === "production") {
        imagePath = `${imageBaseUrl}/${localImagePath}`;
      } else {
        imagePath = `${imageBaseUrl}:${port}/${localImagePath}`;
      }
      
    }

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
    if (
      !name ||
      !category ||
      !Array.isArray(parsedVariants) ||
      !desc ||
      !status ||
      !spesifikasi
    ) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        status: "error",
        message: "Invalid data provided",
      });
    }

    // Find the product
    const existingProduct = await prisma.produk.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

    if (!existingProduct) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }
    if (req.file && existingProduct.imageUrl) {
      // Delete old image
      let oldImagePath;
      
      if (process.env.NODE_ENV === "dev") {
        oldImagePath = existingProduct.imageUrl.split(`http://localhost:${5001}/`)[1];
        if (oldImagePath && fs.existsSync(path.join(__dirname, oldImagePath))) {
          fs.unlinkSync(path.join(__dirname, oldImagePath));
        }
      } else {
       
        oldImagePath = existingProduct.imageUrl.split(process.env.IMAGE_BASE_URL)[1];
        if (oldImagePath) {
        
          if (fs.existsSync(path.join(__dirname, oldImagePath))) {
            fs.unlinkSync(path.join(__dirname, oldImagePath));
          }
        }
      }
    }

    const externalIdsArray = externalIds.split(",");

    // Begin transaction
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Delete existing color variants
      await prisma.warna.deleteMany({
        where: {
          variantId: {
            in: existingProduct.variants.map((variant) => variant.id),
          },
        },
      });

      // Delete existing variants
      await prisma.variant.deleteMany({
        where: {
          id: {
            in: existingProduct.variants.map((variant) => variant.id),
          },
        },
      });

      // Create new variants and map old to new IDs
      const newVariants = await Promise.all(
        parsedVariants.map(async (variant, index) => {
          // Generate a new UUID for new variants if not provided
          const externalId = externalIdsArray[index] || uuidv4();

          console.log("test", externalIdsArray[index]);

          // Create new variant
          const newVariant = await prisma.variant.create({
            data: {
              externalId, // Save the external ID
              name: "produk",
              kapasitas:
                category.toLowerCase() === "iphone"
                  ? parseInt(variant.kapasitas, 10)
                  : 0,
              price: parseInt(variant.price, 10),
              product: {
                connect: { id },
              },
              colorVariants: {
                create: variant.colorVariants.map((color) => ({
                  value: color,
                })),
              },
            },
          });

          return newVariant;
        })
      );

      // Update product
      const productUpdate = await prisma.produk.update({
        where: { id },
        data: {
          name,
          deskripsi: desc,
          spesifikasi: spesifikasi,
          category,
          status: status === "true" ? true : false,
          imageUrl: imagePath || existingProduct.imageUrl,
        },
        include: {
          variants: {
            include: {
              colorVariants: true,
            },
          },
        },
      });

      console.log("Parsed Variants:", parsedVariants); // Debugging

      return productUpdate;
    });

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
