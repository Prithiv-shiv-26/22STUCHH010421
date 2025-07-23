const axios = require("axios");

// Token from your JSON
const ACCESS_TOKEN = "";

// Valid Values
const VALID_STACKS = ["backend", "frontend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = ["logging", "shortening", "redirect"];

const log = async ({ stack, level, message, packageName }) => {
  if (!VALID_STACKS.includes(stack)) {
    console.error(`Invalid stack: ${stack}`);
    return;
  }
  if (!VALID_LEVELS.includes(level)) {
    console.error(`Invalid level: ${level}`);
    return;
  }
  if (!VALID_PACKAGES.includes(packageName)) {
    console.error(`Invalid package: ${packageName}`);
    return;
  }

  try {
    const res = await axios.post(
      "http://20.244.56.144/evaluation-service/logs",
      {
        stack,
        level,
        message,
        package: packageName
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Log sent:", res.status);
  } catch (err) {
    // Just log the error but don't crash the app
    console.error("Log failed:", err.response?.status || err.message);
  }
};

module.exports = log;
