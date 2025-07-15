const Log = require("../models/Log");

const logAction = async (userId, username, action) => {
  try {
    const log = new Log({ userId, username, action });
    await log.save();
  } catch (err) {
    console.error("Log save failed:", err);
  }
};

module.exports = logAction;
