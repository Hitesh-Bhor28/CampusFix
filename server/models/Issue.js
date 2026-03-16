const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [],
      },
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
    },
    assignedTo: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

issueSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Issue", issueSchema);
