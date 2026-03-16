const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Ticket title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
        },
        description: {
            type: String,
            required: [true, "Ticket description is required"],
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
                type: [Number], // [longitude, latitude]
                required: [true, "Location coordinates are required"],
            },
            address: {
                type: String,
                trim: true,
            },
        },
        imageUrls: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ["Pending", "Assigned", "In Progress", "Resolved"],
            default: "Pending",
        },
        upvotes: {
            type: Number,
            default: 0,
        },
        upvotedBy: {
            type: [String], // Array of user IDs who upvoted
            default: [],
        },
        aiDetectedIssueType: {
            type: String,
            default: null,
        },
        category: {
            type: String,
            enum: [
                "IT/Network",
                "Electrical",
                "Plumbing",
                "Furniture/Structural",
                "AC/HVAC",
                "Other",
            ],
            default: "Other",
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
        },
        reportedBy: {
            type: String, // Clerk user ID
            required: [true, "Reporter ID is required"],
        },
        reportedByDisplay: {
            type: String,
            default: null,
        },
        assignedTo: {
            type: String, // Clerk user ID of maintenance staff
            default: null,
        },
        assignedToName: {
            type: String,
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        resolutionImageUrls: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Create 2dsphere index for geospatial queries
ticketSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Ticket", ticketSchema);
