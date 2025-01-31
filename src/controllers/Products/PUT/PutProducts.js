import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";
import { SchemaProduct } from "../../../../Types/Joi.js";
import { v4 as uuidv4 } from "uuid";
import { json } from "express";

export const EditProduks = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    variants,
    desc,
    status,
    externalIds,
    spesifikasi,
    img_url,
  } = req.body;

  console.log("Request body:", req.body); // Debugging input data

  try {
    // Pastikan `variants` sudah berbentuk array, tidak perlu di-parse jika sudah dalam format yang benar
    let parsedVariants = Array.isArray(variants) ? variants : [];

    if (typeof variants === "string") {
      try {
        parsedVariants = JSON.parse(variants);
      } catch (error) {
        return res.status(400).json({
          status: "error",
          message: "Invalid variants data format (JSON parsing failed)",
        });
      }
    }

    // Pastikan `externalIds` adalah array
    let externalIdsArray = [];
    if (typeof externalIds === "string") {
      externalIdsArray = externalIds.split(",");
    } else if (Array.isArray(externalIds)) {
      externalIdsArray = externalIds;
    }

    console.log("=== Debugging Input Data ===");
    console.log("name:", name);
    console.log("category:", category);
    console.log("parsedVariants:", parsedVariants);
    console.log("parsedVariants.length:", parsedVariants.length);
    console.log("desc:", desc);
    console.log("status:", status);
    console.log("spesifikasi:", spesifikasi);
    console.log("img_url:", img_url);
    console.log("=============================");
    if (
      !name ||
      !category ||
      !Array.isArray(parsedVariants) ||
      parsedVariants.length === 0 ||
      !desc ||
      typeof status === "undefined" ||
      !spesifikasi ||
      !img_url
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid data provided",
      });
    }

    // Cari produk berdasarkan ID
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
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    // Mulai transaksi database
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Hapus colorVariants lama
      await prisma.warna.deleteMany({
        where: {
          variantId: {
            in: existingProduct.variants.map((variant) => variant.id),
          },
        },
      });

      // Hapus variants lama
      await prisma.variant.deleteMany({
        where: {
          id: {
            in: existingProduct.variants.map((variant) => variant.id),
          },
        },
      });

      // Tambahkan variants baru
      await Promise.all(
        parsedVariants.map(async (variant, index) => {
          const externalId = externalIdsArray[index] || uuidv4(); // Gunakan ID lama atau generate baru jika tidak ada

          console.log("Processing variant:", variant); // Debugging

          await prisma.variant.create({
            data: {
              externalId,
              name: variant.name || "produk",
              quality: true,
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
        })
      );

      // Update produk utama
      const productUpdate = await prisma.produk.update({
        where: { id },
        data: {
          name,
          deskripsi: desc,
          spesifikasi,
          
          category,
          status: status === "true" || status === true, // Pastikan status boolean
          imageUrl: img_url || existingProduct.imageUrl,
        },
        include: {
          variants: {
            include: {
              colorVariants: true,
            },
          },
        },
      });

      return productUpdate;
    });

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
