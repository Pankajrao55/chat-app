import User from "../models/User.js";
import Message from "../models/Message.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ isOnline: -1, fullName: 1 });

    res.status(200).json({ users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ users: [] });

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: query, $options: "i" } },
        { fullName: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.status(200).json({ users: users.map((u) => u.toSafeObject()) });
  } catch (error) {
    res.status(500).json({ message: "Server error during search" });
  }
};

// Resume feature: Chat Analytics — per-user messaging stats
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalSent = await Message.countDocuments({ sender: userId });
    const totalReceived = await Message.countDocuments({ receiver: userId });
    const totalImages = await Message.countDocuments({ sender: userId, image: { $ne: "" } });

    const conversationCounts = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const populatedTopContacts = await User.populate(conversationCounts, {
      path: "_id",
      select: "fullName username avatar",
    });

    const hourlyActivity = await Message.aggregate([
      { $match: { sender: userId } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      totalSent,
      totalReceived,
      totalImages,
      topContacts: populatedTopContacts.map((c) => ({
        user: c._id,
        messageCount: c.count,
      })),
      hourlyActivity,
    });
  } catch (error) {
    console.error("Stats error:", error.message);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};
