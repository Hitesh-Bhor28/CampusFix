const Ticket = require("../models/Ticket");

const getUserRole = (req) =>
  req.auth?.sessionClaims?.publicMetadata?.role ||
  req.user?.role ||
  req.headers["x-user-role"];

// @desc    Get assigned tasks for a staff member
// @route   GET /api/issues/tasks
// @access  Private (expects userId)
const getAssignedTasks = async (req, res) => {
  try {
    const userId =
      req.auth?.userId ||
      req.user?.id ||
      req.query?.userId ||
      req.headers["x-user-id"];
    const role = getUserRole(req);

    if (!userId) {
      return res.status(401).json({ message: "User ID required" });
    }

    if (role !== "worker") {
      return res.status(403).json({ message: "Worker access only" });
    }

    const tasks = await Ticket.find({
      assignedTo: userId,
      status: { $ne: "Resolved" },
    }).sort({ createdAt: -1 });

    res.status(200).json({ data: tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assigned tasks" });
  }
};

// @desc    Update task status
// @route   PATCH /api/issues/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const role = getUserRole(req);
    const userId =
      req.auth?.userId ||
      req.user?.id ||
      req.headers["x-user-id"];

    if (role !== "worker") {
      return res.status(403).json({ message: "Worker access only" });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updated = await Ticket.findOneAndUpdate(
      { _id: id, assignedTo: userId },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ data: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};

module.exports = { getAssignedTasks, updateTaskStatus };
