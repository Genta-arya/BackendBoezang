import express from "express";
import { sendEmail } from "../../src/controllers/EmailController/EmailController.js";



const EmailRouters = express.Router();

EmailRouters.post("/send", sendEmail);

export default EmailRouters;
