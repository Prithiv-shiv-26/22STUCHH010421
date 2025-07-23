const axios = require("axios");

// Token from your JSON
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwcml0aGl2c2hpdjIyQGlmaGVpbmRpYS5vcmciLCJleHAiOjE3NTMyNTIwNTAsImlhdCI6MTc1MzI1MTE1MCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjUwYTJhNmI0LWE2MDctNGRlOS04YzAyLTY3ZGNjMmY3ZTcxNCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByaXRoaXYgc2hpdiBtIHYiLCJzdWIiOiI5MDIxZjMyOS1lYjI4LTQyOTMtYTQxNi03YWIxOGM2ZmQxMDEifSwiZW1haWwiOiJwcml0aGl2c2hpdjIyQGlmaGVpbmRpYS5vcmciLCJuYW1lIjoicHJpdGhpdiBzaGl2IG0gdiIsInJvbGxObyI6IjIyc3R1Y2hoMDEwNDIxIiwiYWNjZXNzQ29kZSI6ImJDdUNGVCIsImNsaWVudElEIjoiOTAyMWYzMjktZWIyOC00MjkzLWE0MTYtN2FiMThjNmZkMTAxIiwiY2xpZW50U2VjcmV0IjoiWXZCVVlZUmNDVXhSa01IVyJ9.XYKid7XOur7IRwPQ31x7nfI_YwJ-AXr2OeNbAEFFW7U";

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
