const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@fahmid.iin7z.mongodb.net/?retryWrites=true&w=majority&appName=Fahmid`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ message: "Invalid or expired token." });
    }

    req.user = user;
    next();
  });
};

async function run() {
  try {
    const db = client.db("FlavorTaleDB");
    const foodCollection = db.collection("Foods");
    const purchaseCollection = db.collection("Purchases");

    // JWT Authentication route
    app.post("/jwt", async (req, res) => {
      const user = req.body;

      // Create a token and include email
      const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Logout route to clear cookie
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // Get all food items
    app.get("/foods", async (req, res) => {
      const search = req.query.search
      let query = {
        FoodName: {
          $regex: search,
          $options: 'i'
        }
      }
      try {
        const foods = await foodCollection.find(query).toArray();
        res.send(foods);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch foods" });
      }
    });

    // Get food items by AddedByEmail
    app.get("/foods/email", verifyToken, async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).send({ message: "Email is required." });
      }

      try {
        const foods = await foodCollection
          .find({ "AddBy.Email": email })
          .toArray();

        if (foods.length === 0) {
          return res
            .status(404)
            .send({ message: "No foods found for this email." });
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

      if (
        !purchase.foodId ||
        !purchase.foodName ||
        !purchase.price ||
        !purchase.quantity ||
        !purchase.buyerEmail
      ) {
        return res
          .status(400)
          .send({ message: "All fields are required to make a purchase." });
      }

      try {
        const food = await foodCollection.findOne({
          _id: new ObjectId(purchase.foodId),
        });

        if (!food) {
          return res.status(404).send({ message: "Food not found" });
        }

        if (food.Quantity < purchase.quantity) {
          return res
            .status(400)
            .send({ message: "Insufficient stock available." });
        }

        purchase.buyingDate = new Date();
        const result = await purchaseCollection.insertOne(purchase);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to create purchase" });
      }
    });

    // Get all purchases for a specific user (protected route)
    app.get("/purchases/email", verifyToken, async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res
          .status(400)
          .send({ message: "Buyer email is required to fetch purchases." });
      }

      // Ensure the email matches the one in the token
      if (req.user.email !== email) {
        return res.status(403).send({ message: "You are not authorized to access this resource." });
      }

      try {
        const purchases = await purchaseCollection
          .find({ buyerEmail: email })
          .toArray();
        res.send(purchases);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch purchases" });
      }
    });

    // Delete a purchase by ID
    app.delete("/purchases/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      try {
        const result = await purchaseCollection.deleteOne({
          _id: new ObjectId(id),
        });
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
    // Keep the connection open
  }
}

run().catch(console.dir);

// Base route
app.get("/", (req, res) => {
  res.send("Food API is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
