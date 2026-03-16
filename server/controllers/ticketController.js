const Ticket = require("../models/Ticket");

// @desc    Get all tickets (feed)
// @route   GET /api/tickets/all
// @access  Public
const getAllTickets = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store");
        const tickets = await Ticket.find({}).sort({ createdAt: -1 });
        res.status(200).json({ data: tickets });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tickets" });
    }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Public
const getTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Public
const getTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
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

        const ticketPayload = {
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

        const ticket = await Ticket.create(ticketPayload);
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
const updateTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        res.status(200).json({ success: true, data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
const deleteTicket = async (req, res, next) => {
    try {
        const ticket = await Ticket.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        next(error);
    }
};

// @desc    Upvote a ticket
// @route   POST /api/tickets/:id/upvote
// @access  Public
const upvoteTicket = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required to upvote" });
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        if (ticket.status === "Resolved") {
            return res.status(400).json({ message: "Resolved tickets cannot be upvoted" });
        }

        if (ticket.upvotedBy.includes(userId)) {
            return res.status(400).json({ message: "You have already upvoted this ticket" });
        }

        ticket.upvotedBy.push(userId);
        ticket.upvotes = (ticket.upvotes || 0) + 1;
        await ticket.save();

        res.status(200).json({ data: ticket });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign worker to ticket
// @route   PATCH /api/tickets/assign/:id
// @access  Public
const assignWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const { workerId, workerName } = req.body;

        if (!workerId) {
            const updatedTicket = await Ticket.findByIdAndUpdate(
                id,
                { assignedTo: null, assignedToName: null, status: "Pending" },
                { new: true }
            );

            if (!updatedTicket) {
                return res.status(404).json({ message: "Ticket not found" });
            }

            return res.status(200).json({ message: "Worker unassigned", data: updatedTicket });
        }

        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { assignedTo: workerId, assignedToName: workerName || null, status: "Assigned" },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Worker assigned", data: updatedTicket });
    } catch (error) {
        res.status(500).json({ message: "Failed to assign worker" });
    }
};

module.exports = {
    getAllTickets,
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    upvoteTicket,
    assignWorker,
};
