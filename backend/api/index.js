const express = require("express");
const bodyParser = require("body-parser");

const loginUser = require("./loginUser");
const createUser = require("./createUser");
const fetchDatabase =require('./getdata')

const cors = require("cors");
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

app.use(loginUser)
app.use(createUser)
app.use(fetchDatabase)


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});