import Joi from "joi";

export const SchemaProduct = Joi.object({
  name: Joi.string().min(1).required(),
  price: Joi.number().min(1).required(),
  category: Joi.string().valid("iphone", "aksesoris").required(),
  description: Joi.string().min(1).required(),
  image: Joi.string().uri().optional(),
  capacities: Joi.array().items(Joi.string()).optional(),
  colors: Joi.array().items(Joi.string()).optional(),
});
