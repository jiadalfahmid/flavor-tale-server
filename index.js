const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@fahmid.iin7z.mongodb.net/?retryWrites=true&w=majority&appName=Fahmid`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("FlavorTaleDB");
    const foodCollection = db.collection("Foods");

    // Get all food items
    app.get("/foods", async (req, res) => {
      try {
        const foods = await foodCollection.find().toArray();
        res.send(foods);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch foods" });
      }
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
    // Do nothing here to keep the connection alive
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food API is running!");
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
