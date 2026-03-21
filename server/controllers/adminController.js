const { clerkClient } = require("@clerk/clerk-sdk-node");

const createWorkerAccount = async (req, res) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ message: "CLERK_SECRET_KEY is missing" });
    }

    const { email, firstName, lastName, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const generatedPassword =
      password ||
      `CF-${Math.random().toString(36).slice(-8)}!`;

    const user = await clerkClient.users.createUser({
      emailAddress: [email],
      password: generatedPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      publicMetadata: { role: "worker" },
    });

    res.status(201).json({
      message: "Worker account created",
      data: {
        userId: user.id,
        email,
        password: generatedPassword,
      },
    });
  } catch (error) {
    console.error("Failed to create worker account", error);
    res.status(500).json({ message: "Failed to create worker account" });
  }
};

module.exports = { createWorkerAccount };
