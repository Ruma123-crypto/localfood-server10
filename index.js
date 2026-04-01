const express = require("express");
const cors = require("cors");
require("dotenv").config()
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.l7oz43b.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("foodLover");
    const reviewCollection = db.collection("reviews");
    const favoriteCollection = db.collection("favorites");

    //all data
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    //add data
    app.post("/reviews", async (req, res) => {
      try {
        const reviewData = req.body;

        const result = await reviewCollection.insertOne(reviewData);

        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to add review" });
      }
    });

    //get review by users
    app.get("/my-reviews", async (req, res) => {
      const email = req.query.email;
      const query = { createdBy: email };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });

    // get single review by ID
    app.get("/reviews/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const review = await reviewCollection.findOne({
          _id: new ObjectId(id),
        });
        res.send(review);
      } catch (err) {
        res.status(500).send({ error: "Failed to fetch review" });
      }
    });
    // update review by ID
    app.put("/reviews/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const result = await reviewCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData },
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update review" });
      }
    });
    // DELETE review by ID
    app.delete("/reviews/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await reviewCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Review not found" });
        }

        res.send({ success: true, message: "Review deleted successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to delete review" });
      }
    });

    // favourite
    //add favourite
    app.post("/favorites", async (req, res) => {
      const { userEmail, reviewId } = req.body;

      // check if already favorited
       const review = await reviewCollection.findOne({ _id: new ObjectId(reviewId) });
  if (!review) {
    return res.status(404).send({ message: "Review not found" });
  }


   
  const alreadyFavorited = await favoriteCollection.findOne({
    userEmail,
    reviewId: review._id
  });

  if (alreadyFavorited) {
    return res.status(400).send({ message: "Already Add in Favourite" });
  }

      const favoriteData = {
     userEmail,
  reviewId: review._id,
  foodName: review.foodName,
  foodImage: review.foodImage,
  restaurantName: review.restaurantName,
  location: review.location,
  starRating: review.starRating,
  reviewText: review.reviewText,
  reviewerName: review.reviewerName,
  createdBy: review.createdBy,
  postedDate: review.postedDate,
  addedAt: new Date(),
  };
    const result = await favoriteCollection.insertOne(favoriteData);
      res.send(result);
    });

    // Get user's favorites
    app.get("/my-favorites", async (req, res) => {
      const email = req.query.email;
      const favorites = await favoriteCollection
        .find({ userEmail: email })
        .toArray();

      const reviewIds = favorites.map((f) => new ObjectId(f.reviewId));
      const favoriteReviews = await reviewCollection
        .find({ _id: { $in: reviewIds } })
        .toArray();

      res.send(favoriteReviews);
    });

    

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Food Lover Surver is running");
});

app.listen(port, () => {
  console.log(`Food Lover Surver is running${port}`);
});

//f5MtQsSnripXVHrA
//foodDBUser
