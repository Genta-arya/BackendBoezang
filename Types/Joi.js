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

export const stopPromoSchema = Joi.object({
  status: Joi.boolean().required(),
});

export const updatePromoSchema = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        discount: Joi.number().required(),
        expiresAt: Joi.date().iso().required(),
      })
    )
    .required(),
}).options({ allowUnknown: true });

export const schemaAuth = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
