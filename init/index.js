const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listings.js");
const User = require("../models/users.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB for initialization");
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  // Find an existing user or fallback to default owner ID
  let user = await User.findOne({});
  const ownerId = user ? user._id : "6af9530aab04cfb90703f840";

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: ownerId,
  }));

  await Listing.insertMany(updatedData);
  console.log(`Database successfully initialized with ${updatedData.length} listings!`);
};

main()
  .then(initDB)
  .then(() => {
    mongoose.connection.close();
    console.log("Database connection closed.");
  })
  .catch((err) => {
    console.error("Initialization error:", err);
  });
