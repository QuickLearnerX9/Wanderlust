if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Listing=require("./models/listings.js");
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const app = express();
const PORT = 3000;
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/expressError.js")
const listingRouter = require('./routes/listingsRouter.js');
const reviewRouter = require('./routes/reviewsRouter.js');
const session = require('express-session')
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/users.js');
const authRouter = require('./routes/authRouter.js');
const bookingRouter = require("./routes/bookingRouter.js");
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require("connect-mongo").default;
const adminRoutes = require("./routes/adminRouter.js");

// const MONGODB_URI = 'mongodb://127.0.0.1:27017/Wanderlust';
// const {data}=require("./init/data.js")

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Explicitly set the views directory path
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Parses HTML form data into req.body (allows nested objects like listing[title])
app.use(express.urlencoded({ extended: true }));

// Allows HTML forms (which only support GET/POST) to use PUT, PATCH, or DELETE
app.use(methodOverride('_method'));

// Set EJS-Mate as the engine for ejs files
app.engine('ejs', ejsMate);

// Explicitly set the public directory path
app.use(express.static(path.join(__dirname,"public")))


// Default variables available to every EJS template
app.locals.currUser = null;
app.locals.success = [];
app.locals.error = [];
app.locals.redirectUrl = null;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    // crypto: {
    //   secret: process.env.SECRET,
    // },
    touchAfter: 24 * 3600,
});


//Session Implementation
const sessionProperties = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
    app.use(session(sessionProperties))
    
    // use static serialize and deserialize of model for passport session support
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    
    //Passport Setup
    app.use(passport.initialize());
    //Adds th Authentication Through Out the whole session
    app.use(passport.authenticate('session'));
    
    // use static authenticate method of model in LocalStrategy
    passport.use(new LocalStrategy({ usernameField: 'email' },User.authenticate()));
    
    
    //flash implementation
    app.use(flash());
    
    // Global middleware to make flash messages available in all EJS templates
    app.use((req, res, next) => {
      res.locals.currUser = req.user || null;
      res.locals.success = req.flash("success");
      res.locals.error = req.flash("error");
      res.locals.redirectUrl = req.session.redirectUrl || null;
    

    next();
});



// Connect to MongoDB and name the database "Wonderland"
mongoose.connect(dbUrl)
  .then(() => {
    console.log('Connected to MongoDB: Wanderlust database');
    // Start the Express server only after a successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
  

  

  // Root / Home Route
  app.get('/', wrapAsync(async (req, res) => {
      const allListings = await Listing.find({})
          .populate('reviews')
          .sort({ _id: -1 })
          .limit(8); 
      res.render("listings/home.ejs", { allListings });
  }));
  
  // Mount the router
  app.use('/listings', listingRouter);
  app.use('/listings/:id/reviews', reviewRouter);
  app.use('/auth', authRouter);
  app.use("/bookings", bookingRouter);
  app.use("/admin", adminRoutes);
  // //initialize database with the sample data
  // const initDB = async () => {
  //   // Clear existing data and insert sample data
  //   await Listing.deleteMany({});
    
  //   // Assign owner from existing users if available
  //   let user = await User.findOne({});
  //   const ownerId = user ? user._id : "6af9530aab04cfb90703f840";

  //   const updatedData = data.map((obj) => ({
  //     ...obj,
  //     owner: ownerId,
  //   }));

  //   await Listing.insertMany(updatedData);
  //   console.log(`Database was initialized with ${updatedData.length} sample listings!`);
  // };
  
  // // Initialize Database Route
  // app.get('/initdb', wrapAsync(async (req, res) => {
  //     await initDB(); 
  //     console.log("Sample Data was saved");
  //     req.flash("success", "Sample listings loaded into database successfully!");
  //     res.redirect("/listings");
  // }));

  
  //Catch-all for undefined routes (404)
  app.all('/*splat', (req, res, next) => {
      console.log("404 REQUEST:", req.method, req.originalUrl);

    next(new ExpressError(404, 'Page Not Found on this Server'));
  });
  
  // --- CENTRAL ERROR-HANDLING MIDDLEWARE ---
  // Place this at the very bottom of your app.js after all routes
  app.use((err, req, res, next) => {
      console.error("========== ACTUAL ERROR ==========");
      console.error(err);
      console.error("==================================");
      let { statusCode = 500, message = "Something went wrong!" } = err;
      // Render the error.ejs template instead of sending raw text/JSON
    res.status(statusCode).render('errors/errors.ejs', { statusCode, message });
  });

module.exports = app;
  





// // Listing Check Route
// app.get('/testlisting', wrapAsync(async (req, res) => {
//     const newListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Goa",
//         country: "India"
//     });

//     await newListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing: Sample listing saved to the database!");
// }));



