import express from "express";
import {
  checkLogin,
  handleLogin,
  HandleRegister,
  Logout,
} from "../../src/controllers/Auth/Post/AuthPost.js";

const AuthRouters = express.Router();

AuthRouters.post("/register", HandleRegister);
AuthRouters.post("/login", handleLogin);
AuthRouters.post("/logout", Logout);
AuthRouters.post("/authentikasi", checkLogin);
// AuthRouters.get("/user", getUser);

export default AuthRouters;
