import prisma from "../../../config/Prisma.js";

export const createPromo = async (req, res) => {
  const { discount, productIds, expiresAt } = req.body;

  console.log(discount);
  console.log(productIds);
  console.log(expiresAt);

  // Validate input
  if (!discount || !productIds || !expiresAt) {
    return res.status(400).json({
      status: "error",
      message: "Discount, product ID, and expiration date are required.",
    });
  }

  try {
    // Check if any of the products already have a promo
    const existingPromo = await prisma.promo.findMany({
        where: {
          products: {
            some: {
              id: {
                in: productIds,
              },
            },
          },
          expired: false, // Only check active promos
        },
        include: {
          products: true,
        },
      });
  

    if (existingPromo) {
      // Ensure existingPromo.products is defined before mapping
      const productsWithPromo = existingPromo.map(promo =>
        promo.products.map(product => product.name).join(', ')
      );

      console.log(productsWithPromo)
      return res.status(400).json({
        status: "error",
        message: productsWithPromo.length > 0 ? ` ${productsWithPromo.join(', ')} Sudah Memiliki Promo ,  Hanya boleh 1 promo aktif untuk setiap produk` : "Hanya boleh 1 promo aktif untuk setiap produk",
      });
    }

    // Create the promo
    const newPromo = await prisma.promo.create({
      data: {
        discount: discount,
        products: {
          connect: productIds.map((id) => ({ id })),
        },
        expiresAt: new Date(expiresAt), // Convert expiresAt to Date object
      },
      include: {
        products: true,
      },
    });

    // Respond with success
    res.status(201).json({
      status: "success",
      data: newPromo,
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating promo:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
