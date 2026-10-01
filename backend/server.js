const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Freelancer Management API is running",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
