import prisma from "../../../config/Prisma.js";
import fs from "fs";
import path from "path";

export const DeleteProducts = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the product to get the image URL and variants
    const product = await prisma.produk.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated images
    if (product.imageUrl) {
      const oldImagePath = product.imageUrl.split(
        process.env.IMAGE_BASE_URL
      )[1];
      if (oldImagePath && fs.existsSync(path.join("Images", oldImagePath))) {
        fs.unlinkSync(path.join("Images", oldImagePath));
      }
    }

    // Delete product
    await prisma.produk.delete({
      where: {
        id: id,
      },
    });

    res
      .status(200)
      .json({ message: "Product and associated data deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
