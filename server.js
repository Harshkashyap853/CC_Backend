// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
// MongoDB connection
const atlasUri = "mongodb+srv://kharsh72002:Harsh1234@cluster0.8hlfluh.mongodb.net/";
mongoose.connect(atlasUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});


const Reservation = mongoose.model("Reservation", {
  first: String,
  last: String,
  email: String,
  date: Date,
  time: String,
  confirmationCode: String, // Add confirmationCode field
});

// Middleware
app.use(bodyParser.json());

// Function to generate confirmation code
function generateConfirmationCode(reservation) {
  const { first, last, time, date } = reservation;
  return `${last}${time}${date}-${first}`.toUpperCase().replace(/\s/g, "");
}

// API endpoint to save reservation
app.post("/api/reservation", async (req, res) => {
  try {
    const reservationData = req.body;
    // Generate confirmation code
    const confirmationCode = generateConfirmationCode(reservationData);
    // Save reservation to MongoDB database
    const reservation = new Reservation({ ...reservationData, confirmationCode });
    await reservation.save();
    res.status(201).send(reservation);
  } catch (error) {
    res.status(400).send(error);
  }
});


app.get("/api/reservation/:confirmationCode", async (req, res) => {
    try {
      const confirmationCode = req.params.confirmationCode;
      const reservation = await Reservation.findOne({ confirmationCode });
      if (!reservation) {
        return res.status(404).send({ message: "Reservation not found" });
      }
      res.send(reservation);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  });
  
  // API endpoint to delete reservation by confirmation code
  app.delete("/api/reservation/:confirmationCode", async (req, res) => {
    try {
      const confirmationCode = req.params.confirmationCode;
      const reservation = await Reservation.findOneAndDelete({ confirmationCode });
      if (!reservation) {
        return res.status(404).send({ message: "Reservation not found" });
      }
      res.send({ message: "Reservation deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  });


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
