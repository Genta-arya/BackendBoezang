import prisma from "../../../config/Prisma.js";

export const DeleteQuotest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const deleteQuotest = await prisma.quotest.delete({
      where: {
        id: id,
      },
    });
    res.status(200).json({ data: deleteQuotest, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
