const express = require("express");
const { staffLogin } = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/staff-login", staffLogin);

module.exports = authRouter;
