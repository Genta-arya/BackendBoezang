import { stopPromoSchema, updatePromoSchema } from "../../../../Types/Joi.js";
import prisma from "../../../config/Prisma.js";

export const deletePromo = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari parameter permintaan

  try {
    // Cek apakah promo dengan ID yang diberikan ada
    const promo = await prisma.promoVariant.findUnique({
      where: { id },
    });

    if (!promo) {
      return res.status(404).json({
        status: "error",
        message: "Promo not found",
      });
    }

    // Hapus promo dari database
    await prisma.promoVariant.delete({
      where: { id },
    });

    return res.status(200).json({
      status: "success",
      message: "Promo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promo:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};