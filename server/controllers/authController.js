const { clerkClient } = require("@clerk/clerk-sdk-node");

const findUserByIdentifier = async (identifier) => {
  if (!identifier) return null;

  try {
    const user = await clerkClient.users.getUser(identifier);
    if (user) return user;
  } catch (error) {
    // ignore if not a user id
  }

  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [identifier],
      limit: 1,
    });
    return users?.[0] || null;
  } catch (error) {
    return null;
  }
};

const staffLogin = async (req, res) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ message: "CLERK_SECRET_KEY is missing" });
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    const user = await findUserByIdentifier(identifier);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.publicMetadata?.role;
    if (role !== "worker" && role !== "admin") {
      return res.status(403).json({ message: "Staff or admin access only" });
    }

    let passwordVerified = false;
    try {
      const result = await clerkClient.users.verifyPassword({
        userId: user.id,
        password,
      });
      passwordVerified = result?.verified || result === true;
    } catch (error) {
      passwordVerified = false;
    }

    if (!passwordVerified) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      role,
      name:
        user.firstName ||
        user.fullName ||
        user.username ||
        user.primaryEmailAddress?.emailAddress ||
        "Worker",
    });
  } catch (error) {
    console.error("Staff login failed", error);
    res.status(500).json({ message: "Staff login failed" });
  }
};

module.exports = { staffLogin };
