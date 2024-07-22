import prisma from "../../../config/Prisma.js";
import Joi from "joi";

export const CreateQuotest = async (req, res) => {
  const { content, author, status } = req.body;
  console.log(req.body)

  const schema = Joi.object({
    content: Joi.string().required(),
    author: Joi.string().required(),
    status: Joi.boolean().required(),
  });

  const { error } = schema.validate({ content, author, status });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const newQuote = await prisma.quotest.create({
      data: {
        content,
        author,
        status,
      },
    });
    return res
      .status(201)
      .json({ data: newQuote, message: "Quote created successfully" });
  } catch (error) {
    console.error("Error creating quote:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
