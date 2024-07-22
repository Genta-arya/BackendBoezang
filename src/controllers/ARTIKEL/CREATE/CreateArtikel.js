import prisma from "../../../config/Prisma.js";
import path from "path";
export const CreateArtikel = async (req, res) => {
  const { content, author, status, title } = req.body;
  const { file } = req;
  let imagePath;

  if (!file) {
    return res.status(400).json({ error: "Thumbnail is required" });
  }

  if (!content || !author || !status || !title) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (req.file) {
    // Dapatkan nama file gambar

    const imageFileName = path.basename(req.file.path);
    // Tentukan path gambar lokal dan URL lengkap
    const localImagePath = path.join("Images", imageFileName);
    const imageBaseUrl = process.env.IMAGE_BASE_URL;
    imagePath = `${imageBaseUrl}/${localImagePath}`;
  }

  try {
    const newArtikel = await prisma.artikel.create({
      data: {
        content,
        author,
        status: status === "true" ? true : false,
        title,
        thumbnail: imagePath, // Store the file path in the database
      },
    });

    return res.status(201).json(newArtikel);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the article" });
  }
};
