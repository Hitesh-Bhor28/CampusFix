const express = require("express");
const router = express.Router();
const {
    getAllComplaints,
    getComplaints,
    getComplaint,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    upvoteComplaint,
    assignWorker,
} = require("../controllers/complaintController");
const upload = require("../middlewares/upload");

// TODO: Add auth middleware to protected routes
// const { protect } = require("../middlewares/authMiddleware");

router.route("/").get(getComplaints).post(createComplaint);
router.route("/create").post(upload.single("image"), createComplaint);
router.route("/all").get(getAllComplaints);
router.route("/assign/:id").patch(assignWorker);
router.route("/:id/upvote").post(upvoteComplaint);
router.route("/:id").get(getComplaint).put(updateComplaint).delete(deleteComplaint);

module.exports = router;
