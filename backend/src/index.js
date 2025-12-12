const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { log, errLog } = require("./utils");
const router = require("./routes");

const app = express();
app.use(express.json());
app.use(cors());

// Swagger setup
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "MIP Project Notes API",
    description: "Simple CRUD API express server for notes keeping in MongoDB",
    version: "1.0.0",
  },
};
const swaggerOptions = {
  swaggerDefinition,
  apis: [__dirname + "/routes.js", __dirname + "/health.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8080;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => log("Connected to MongoDB"))
  .catch((e) => {
    errLog("MongoDB connection error:", e);
    process.exit(1);
  });

app.use("/", require("./health"));
app.use("/api", router);
app.listen(PORT, () => log(`Server listening on port ${PORT}`));
