import prisma from "../../config/Prisma.js";
import fs from "fs";
import path from "path";

export const addBrowsur = async (req, res) => {
  try {
    const { title, status } = req.body;
    const files = req.files;
    const imageBaseUrl = process.env.IMAGE_BASE_URL;

    // Check for existing active browsurs
    if (status === "true") {
      const activeBrowsurs = await prisma.browsur.findMany({
        where: {
          status: true,
        },
      });

      if (activeBrowsurs.length > 0) {
        return res
          .status(400)
          .json({ message: "Hanya 1 Poup yang boleh aktif" });
      }
    }

    // Create a new Browsur entry
    const newBrowsur = await prisma.browsur.create({
      data: {
        title: title,
        status: status === "true", // Convert string to boolean
      },
    });

    if (files && files.length > 0) {
      const imagePromises = files.map((file) => {
        const imageFileName = path.basename(file.path);
        const localImagePath = path.join("Images", imageFileName);
        const imagePath = `${imageBaseUrl}/${localImagePath}`;

        return prisma.imageBrowsur.create({
          data: {
            url: imagePath,
            browsurId: newBrowsur.id,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    res
      .status(201)
      .json({ message: "Browsur and images uploaded successfully." });
  } catch (error) {
    console.error(error);

    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error("Error unlinking file:", err);
          } else {
            console.log("File unlinked successfully:", file.path);
          }
        });
      });
    }

    res.status(500).json({ message: "Internal server error." });
  }
};

export const getBrowsur = async (req, res) => {
  try {
    const browsur = await prisma.browsur.findMany({
  
      include: {
        images: true,
      },
    });
    if (!browsur) {
      return res.status(404).json({ message: "Browsur not found." });
    }
    res.status(200).json({ data: browsur, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editBrowsur = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const existingBrowsur = await prisma.browsur.findUnique({
      where: { id },
    });

    if (!existingBrowsur) {
      return res.status(404).json({ message: "Browsur not found." });
    }

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }
    const updatedBrowsur = await prisma.browsur.update({
      where: { id },
      data: {
        title: title,
      },
    });

    res
      .status(200)
      .json({ message: "Browsur updated successfully.", updatedBrowsur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const editSingleImage = async (req, res) => {
  const { id } = req.params;
  const { imageId } = req.params;
  const newFile = req.file;

  if (!imageId || !id) {
    return res.status(400).json({ message: "ID is required." });
  }
  try {
    const existingImage = await prisma.imageBrowsur.findFirst({
      where: { id: imageId },
    });

    if (!existingImage) {
      return res.status(404).json({ message: "Image not found." });
    }

    const localFilePath = path.join("Images", path.basename(existingImage.url));

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    } else {
      console.error("File not found:", localFilePath);
      return res.status(404).json({ message: "File not found." });
    }

    const imageBaseUrl = process.env.IMAGE_BASE_URL;
    const newImageFileName = path.basename(newFile.path);
    const localImagePath = path.join("Images", newImageFileName);
    const imagePath = `${imageBaseUrl}/${localImagePath}`;

    const updatedImage = await prisma.imageBrowsur.update({
      where: { id: imageId },
      data: {
        url: imagePath,
        browsurId: id,
      },
    });

    res
      .status(200)
      .json({ message: "Image updated successfully.", updatedImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteBrowsur = async (req, res) => {
  const { id } = req.params;
  try {
    const browsur = await prisma.browsur.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!browsur) {
      return res.status(404).json({ message: "Browsur not found." });
    }

    if (browsur.images && browsur.images.length > 0) {
      for (const image of browsur.images) {
        const localFilePath = path.join("Images", path.basename(image.url));

        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        } else {
          console.error("File not found:", localFilePath);
        }

        await prisma.imageBrowsur.delete({
          where: { id: image.id },
        });
      }
    }

    await prisma.browsur.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: "Browsur and related images deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ message: "ID and status are required." });
    }
  
    try {
 
      if (status === true) {
        const activeBrowsur = await prisma.browsur.findFirst({
          where: {
            status: true,
          },
        });
  
        if (activeBrowsur) {
        
          return res.status(400).json({ message: "Popup aktif tidak boleh lebih dari 1" });
        }
      }
  
    
      const browsur = await prisma.browsur.update({
        where: { id },
        data: { status },
      });
  
      res.status(200).json({ data: browsur, message: "Success" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  