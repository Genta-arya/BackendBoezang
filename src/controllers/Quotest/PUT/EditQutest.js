import prisma from "../../../config/Prisma.js";
import Joi from "joi";

export const EditQuotes = async (req, res) => {
    const { id } = req.params;
    const { content, author, status } = req.body;

    // Validate request body
    const schema = Joi.object({
        content: Joi.string().required(),
        author: Joi.string().required(),
        status: Joi.boolean().required(),
    });

    const { error } = schema.validate({ content, author, status });
    if (error) {
        return res.status(400).json({ message: "Invalid data", details: error.details });
    }

    // Check if id is provided
    if (!id) {
        return res.status(400).json({ message: "ID is required" });
    }

    try {
        // Update the quote in the database
        const updatedQuote = await prisma.quotest.update({
            where: { id },
            data: {
                content,
                author,
                status,
                updatedAt: new Date(), // Ensure updatedAt is set
            },
        });

        // Return the updated quote
        return res.status(200).json({data: updatedQuote, message: "Quote updated successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
