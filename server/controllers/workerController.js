const { clerkClient } = require("@clerk/clerk-sdk-node");

const getWorkers = async (req, res) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ message: "CLERK_SECRET_KEY is missing" });
    }

    const users = await clerkClient.users.getUserList({
      limit: 200,
    });

    const workers = users
      .filter((user) => user.publicMetadata?.role === "worker")
      .map((user) => {
        const fallback = `Worker (${user.id.slice(-6)})`;
        return {
          id: user.id,
          name:
            user.firstName ||
            user.fullName ||
            user.username ||
            user.primaryEmailAddress?.emailAddress ||
            fallback,
        };
      });

    res.status(200).json({ data: workers });
  } catch (error) {
    console.error("Failed to fetch workers", error);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};

module.exports = { getWorkers };
