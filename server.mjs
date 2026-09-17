import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

console.log("Starting FastAPI backend...");

const backend = spawn(
  "python",
  ["backend/run.py"],
  {
    cwd: __dirname,
    stdio: "inherit"
  }
);

backend.on("error", (error) => {
  console.error("Backend failed to start:", error);
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8000",
    changeOrigin: true,
    pathRewrite: {
      "^/api": ""
    }
  })
);

app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MehraruBirthday gateway running on port ${PORT}`);
});
