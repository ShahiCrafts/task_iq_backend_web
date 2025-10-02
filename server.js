require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const csurf = require("csurf");

const connectDb = require("./config/database");

connectDb();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
} else {
  app.use(csurf({ cookie: true }));
}

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SecureDoc API running",
  });
});

app.use("/api/auth", require("./routes/auth.routes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
});
