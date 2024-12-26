// Existing imports and setup
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
    const purchaseCollection = db.collection("Purchases");

    // Get all food items
    app.get("/foods", async (req, res) => {
      try {
        const foods = await foodCollection.find().toArray();
        res.send(foods);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch foods" });
      }
    });

    // Get food items by AddedByEmail
    app.get("/foods/email", async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).send({ message: "Email is required." });
      }

      try {
        const foods = await foodCollection.find({ "AddBy.Email": email }).toArray();

        if (foods.length === 0) {
          return res.status(404).send({ message: "No foods found for this email." });
        }

        res.send(foods);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch foods by email" });
      }
    });

    // Get a single food item by ID
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const food = await foodCollection.findOne(query);
        if (!food) {
          return res.status(404).send({ message: "Food not found" });
        }
        res.send(food);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch food" });
      }
    });

    // Post a new food item
    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      try {
        const result = await foodCollection.insertOne(newFood);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to add food" });
      }
    });

    // Update a food item by ID
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedFood };

      try {
        const result = await foodCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to update food" });
      }
    });

    // Create a new purchase
    app.post("/purchases", async (req, res) => {
      const purchase = req.body;

      if (!purchase.foodId || !purchase.foodName || !purchase.price || !purchase.quantity || !purchase.buyerEmail) {
        return res.status(400).send({ message: "All fields are required to make a purchase." });
      }

      try {
        const food = await foodCollection.findOne({ _id: new ObjectId(purchase.foodId) });

        if (!food) {
          return res.status(404).send({ message: "Food not found" });
        }

        if (food.Quantity < purchase.quantity) {
          return res.status(400).send({ message: "Insufficient stock available." });
        }

        purchase.buyingDate = new Date();
        const result = await purchaseCollection.insertOne(purchase);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to create purchase" });
      }
    });

    // Get all purchases for a specific user
    app.get("/purchases/email", async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).send({ message: "Buyer email is required to fetch purchases." });
      }

      try {
        const purchases = await purchaseCollection.find({ buyerEmail: email }).toArray();
        res.send(purchases);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchases" });
      }
    });

     // Delete a purchase by ID
     app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await purchaseCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Purchase not found" });
        }
        res.send({ message: "Purchase deleted successfully", result });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete purchase" });
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
