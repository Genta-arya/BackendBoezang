import prisma from "../../../config/Prisma.js";

export const DeleteSingleProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ message: "Product id is required" });
  }

  try {
    // Start a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete related capacities
      await prisma.capacity.deleteMany({
        where: {
          productId: id,
        },
      });

      // Delete related colors
      await prisma.color.deleteMany({
        where: {
          productId: id,
        },
      });

      // Delete related promos
      await prisma.promo.deleteMany({
        where: {
          products: {
            some: {
              id: id,
            },
          },
        },
      });

      // Delete the product
      await prisma.product.delete({
        where: {
          id: id,
        },
      });
    });

    res.status(200).send({
      message: "Product and its relations deleted successfully.",
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).send({ error: "Product not found." });
    }
    console.error("Error deleting product:", error);
    res
      .status(500)
      .send({ error: "An error occurred while deleting the product." });
  }
};
