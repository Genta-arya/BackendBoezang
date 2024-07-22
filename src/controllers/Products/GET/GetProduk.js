import prisma from "../../../config/Prisma.js";
export const getProduk = async (req, res) => {
  try {
    // Ambil semua produk dan variannya
    const findAll = await prisma.produk.findMany({
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

    // Ambil semua PromoVariant untuk semua variants
    const variantIds = findAll.flatMap((product) =>
      product.variants.map((variant) => variant.externalId)
    );
    const promoVariants = await prisma.promoVariant.findMany({
      where: {
        variantId: {
          in: variantIds,
        },
      },
    });

    // Periksa dan hapus promo jika tanggal kedaluwarsa sudah lewat
    const now = new Date();
    await Promise.all(
      promoVariants.map(async (promo) => {
        const expiredDate = new Date(promo.expiryDate);
        if (expiredDate <= now) {
          console.log(
            `Promo ${promo.id} dengan expiredAt ${expiredDate} sudah lewat. Menghapus promo.`
          );
          await prisma.promoVariant.delete({
            where: { id: promo.id },
          });
        } else {
          console.log(
            `Promo ${promo.id} dengan expiredAt ${expiredDate} belum lewat.`
          );
        }
      })
    );

    // Ambil kembali promoVariants setelah penghapusan
    const updatedPromoVariants = await prisma.promoVariant.findMany({
      where: {
        variantId: {
          in: variantIds,
        },
      },
    });

    // Gabungkan promoVariants ke dalam variants yang sesuai
    const findAllWithPromo = findAll.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        promo:
          updatedPromoVariants.find(
            (promo) => promo.variantId === variant.externalId
          ) || null,
      })),
    }));

    res.status(200).json({ data: findAllWithPromo, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
export const getSingleProduk = async (req, res) => {
  try {
    const { id } = req.params;

    const findOne = await prisma.produk.findUnique({
      where: {
        id: id,
      },
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

    if (!findOne) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ambil semua PromoVariant untuk variants dari produk ini
    const variantIds = findOne.variants.map((variant) => variant.externalId);
    const promoVariants = await prisma.promoVariant.findMany({
      where: {
        variantId: {
          in: variantIds,
        },
      },
    });

    // Gabungkan promoVariants ke dalam variants yang sesuai
    const findOneWithPromo = {
      ...findOne,
      variants: findOne.variants.map((variant) => ({
        ...variant,
        promo:
          promoVariants.find(
            (promo) => promo.variantId === variant.externalId
          ) || null,
      })),
    };

    res.status(200).json({ data: findOneWithPromo, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getProdukByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log(category)
    const findByCategory = await prisma.produk.findMany({
      where: {
        category: category,
        status: true,
      },
      include: {
        variants: {
          include: {
            colorVariants: true,
          },
        },
      },
    });

    const variantIds = findByCategory.flatMap((product) =>
      product.variants.map((variant) => variant.externalId)
    );
    const promoVariants = await prisma.promoVariant.findMany({
      where: {
        variantId: {
          in: variantIds,
        },
      },
    });

    const now = new Date();
    await Promise.all(
      promoVariants.map(async (promo) => {
        const expiredDate = new Date(promo.expiryDate);
        if (expiredDate <= now) {
          console.log(
            `Promo ${promo.id} dengan expiredAt ${expiredDate} sudah lewat. Menghapus promo.`
          );
          await prisma.promoVariant.delete({
            where: { id: promo.id },
          });
        } else {
          console.log(
            `Promo ${promo.id} dengan expiredAt ${expiredDate} belum lewat.`
          );
        }
      })
    );

    const updatedPromoVariants = await prisma.promoVariant.findMany({
      where: {
        variantId: {
          in: variantIds,
        },
      },
    });

    const findByCategoryWithPromo = findByCategory.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        promo:
          updatedPromoVariants.find(
            (promo) => promo.variantId === variant.externalId
          ) || null,
      })),
    }));

    res.status(200).json({ data: findByCategoryWithPromo, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
