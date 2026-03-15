const Complaint = require("../models/Complaint");

// @desc    Get all complaints (feed)
// @route   GET /api/complaints/all
// @access  Public
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({}).sort({ createdAt: -1 });
        res.status(200).json({ data: complaints });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch complaints" });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res, next) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: complaints.length, data: complaints });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
const getComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
    try {
        const { title, description, aiIssueType, reporterId, category, isAnonymous, reportedByDisplay } = req.body;
        let { imageUrls } = req.body;
        let { location } = req.body;

        if (typeof location === "string") {
            try {
                location = JSON.parse(location);
            } catch (error) {
                location = null;
            }
        }

        if (typeof imageUrls === "string") {
            try {
                imageUrls = JSON.parse(imageUrls);
            } catch (error) {
                imageUrls = [];
            }
        }

        if (!title || !description) {
            return res.status(400).json({ message: "Title and description are required" });
        }

        if (!reporterId) {
            return res.status(400).json({ message: "Reporter ID is required" });
        }

        if (!Array.isArray(location) || location.length !== 2) {
            return res.status(400).json({ message: "Location coordinates are required" });
        }

        const complaintPayload = {
            title,
            description,
            location: {
                type: "Point",
                coordinates: location,
            },
            aiDetectedIssueType: aiIssueType || null,
            category: category || aiIssueType || "Other",
            reportedBy: reporterId,
            reportedByDisplay: isAnonymous ? "Anonymous" : reportedByDisplay || null,
            imageUrls: req.file?.path
                ? [req.file.path]
                : Array.isArray(imageUrls)
                  ? imageUrls
                  : [],
        };

        const complaint = await Complaint.create(complaintPayload);
        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        next(error);
    }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res, next) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, message: "Complaint not found" });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Upvote a complaint
// @route   POST /api/complaints/:id/upvote
// @access  Public
const upvoteComplaint = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required to upvote" });
        }

        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint.upvotedBy.includes(userId)) {
            return res.status(400).json({ message: "You have already upvoted this complaint" });
        }

        complaint.upvotedBy.push(userId);
        complaint.upvotes = (complaint.upvotes || 0) + 1;
        await complaint.save();

        res.status(200).json({ data: complaint });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign worker to complaint
// @route   PATCH /api/complaints/assign/:id
// @access  Public
const assignWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerId } = req.body;

        if (!workerId) {
            return res.status(400).json({ message: "Worker ID is required" });
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id,
            { assignedTo: workerId },
            { new: true }
        );

        if (!updatedComplaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.status(200).json({ message: "Worker assigned", data: updatedComplaint });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign worker" });
    }
};

module.exports = {
    getAllComplaints,
    getComplaints,
    getComplaint,
    createComplaint,
    updateComplaint,
    deleteComplaint,
    upvoteComplaint,
    assignWorker,
};
