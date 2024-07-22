import prisma from "../../../config/Prisma.js";
import path from "path";
import fs from "fs";
export const EditSingleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status);
    const update = await prisma.artikel.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
    res.status(200).json({ data: update, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const EditArtikel = async (req, res) => {
  try {
    const { id } = req.params;
    const { file } = req;
    const { content, author, title, status } = req.body;

 
    const artikel = await prisma.artikel.findUnique({
      where: { id },
    });

    if (!artikel) {
      return res.status(404).json({ error: "Article not found" });
    }

    let imagePath = artikel.thumbnail;

    if (artikel.thumbnail) {
      const oldImagePath = path.basename(artikel.thumbnail);
      const oldImageFullPath = path.join("Images", oldImagePath);
      if (fs.existsSync(oldImageFullPath)) {
        fs.unlink(oldImageFullPath, (err) => {
          if (err) {
            console.error("Error removing old image:", err);
          }
        });
      }
    }

    if (file) {
      // Tentukan nama file gambar baru
      const imageFileName = path.basename(file.path);
      // Tentukan path gambar lokal dan URL lengkap
      const localImagePath = path.join("Images", imageFileName);
      const imageBaseUrl = process.env.IMAGE_BASE_URL;
      imagePath = `${imageBaseUrl}/${localImagePath}`;
    }

    const dataToUpdate = {
      content,
      author,
      title,
      status: status === "true" ? true : false,
      thumbnail: imagePath,
    };

    const updatedArtikel = await prisma.artikel.update({
      where: { id },
      data: dataToUpdate,
    });

    res.status(200).json({ data: updatedArtikel, message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
