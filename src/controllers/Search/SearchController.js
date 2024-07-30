import prisma from "../../config/Prisma.js";

export const GetDataSearch = async (req, res) => {
  const { q } = req.query; 
  console.log(q);

  if (!q) {
    return res.status(400).json({ error: "Query is required" }); // Menangani kasus tanpa query
  }


  const sanitizedQuery = q.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();

  try {
    // Mencari produk berdasarkan nama
    const products = await prisma.produk.findMany({
      where: {
        name: {
          contains: sanitizedQuery, 
        
        },
        
        
      },
      include: {
          variants: true,
      }
    });

    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ data: products }); 
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" }); 
  }
};
