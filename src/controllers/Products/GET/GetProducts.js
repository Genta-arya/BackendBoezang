import prisma from "../../../config/Prisma.js";

export const GetTypeProduct = async (req, res) => {
  try {
    // Ambil kategori dari query parameter
    let { kategori } = req.query;

    let products;

    if (kategori) {
      // Bersihkan kategori dari karakter kutip ganda
      kategori = kategori.replace(/"/g, "");

      // Ambil produk berdasarkan kategori dari database
      products = await prisma.product.findMany({
        where: {
          category: {
            equals: kategori, // Pencarian sensitif huruf besar/kecil
          },
        },
        include: {
          capacities: true, // Include related capacities
          colors: true, // Include related colors
          promos: true, // Include related promos
        },
      });

      // Periksa apakah produk ditemukan
      if (products.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Produk tidak ditemukan untuk kategori yang diberikan",
        });
      }
    } else {
      // Ambil semua produk dari database
      products = await prisma.product.findMany({
        include: {
          capacities: true, // Include related capacities
          colors: true, // Include related colors
          promos: true, // Include related promos
        },
      });

      // Periksa apakah ada produk
      if (products.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Tidak ada produk yang tersedia",
        });
      }
    }

    // Kirimkan respons dengan data produk
    return res.status(200).json({
      status: "success",
      data: products,
    });
  } catch (error) {
    // Menangani kesalahan dan mengirimkan respons error
    console.error("Error fetching products:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
