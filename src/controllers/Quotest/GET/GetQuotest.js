import prisma from "../../../config/Prisma.js";

export const getQuotest = async (req, res) => {
  try {
    const findAll = await prisma.quotest.findMany({});

    res.status(200).json({ data: findAll, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
