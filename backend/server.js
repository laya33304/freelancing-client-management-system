const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const clientRoutes = require("./routes/clientRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/clients", clientRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Freelancer Management API is running",
  });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
