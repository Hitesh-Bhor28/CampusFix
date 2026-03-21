const express = require("express");
const { createWorkerAccount } = require("../controllers/adminController");
const { adminOnly } = require("../middlewares/authMiddleware");

const adminRouter = express.Router();

adminRouter.post("/workers", adminOnly, createWorkerAccount);

module.exports = adminRouter;
