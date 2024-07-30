import express from "express";
import {
  checkLogin,
  handleLogin,
  HandleRegister,
  Logout,
} from "../../src/controllers/Auth/Post/AuthPost.js";
import { CreateOtp, ResetPassword, verifyOtp } from "../../src/controllers/Auth/ResetPassword/ResetPasswordController.js";

const AuthRouters = express.Router();

AuthRouters.post("/register", HandleRegister);
AuthRouters.post("/login", handleLogin);
AuthRouters.post("/logout", Logout);
AuthRouters.post("/authentikasi", checkLogin);
AuthRouters.post("/send-otp", CreateOtp);
AuthRouters.post("/verify-otp", verifyOtp);
AuthRouters.post("/change-password", ResetPassword);
// AuthRouters.get("/user", getUser);

export default AuthRouters;
