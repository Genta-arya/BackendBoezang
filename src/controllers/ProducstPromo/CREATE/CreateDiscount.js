import prisma from "../../../config/Prisma.js";

export const CreateDiscount = async (req, res) => {
  try {
    const { variantId, discount,  expiryDate } = req.body;

  
    if (!variantId || !discount  || !expiryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    if (discount < 0) {
      return res.status(400).json({ message: "Discount must be a positive value" });
    }

   
    if (isNaN(Date.parse(expiryDate))) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }

    // Check if the variant already has an active promo
    const existingPromo = await prisma.promoVariant.findFirst({
      where: {
        variantId,
        status: true, 
      
      },
    });

    if (existingPromo) {
      return res.status(400).json({
        message: "Variant Init sudah memiliki Promo aktif. Silahkan mengedit promo yang ada.",
      });
    }

    // Create a new PromoVariant
    const newPromoVariant = await prisma.promoVariant.create({
      data: {
        variantId,
        discount,
        status : true,
        expiryDate: new Date(expiryDate),
      },
    });

    res.status(201).json({
      data: newPromoVariant,
      message: "Discount created successfully",
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
