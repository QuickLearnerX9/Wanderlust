const User = require("../models/users.js"); // Adjust the path to your User model if needed

module.exports.renderLogin = (req, res) => {
  res.render("auths/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  // Fallback to '/listings' if they didn't try to visit a protected page first
  let redirectUrl = res.locals.redirectUrl || "/listings";
  // Clear it from the session
  delete req.session.redirectUrl;

  res.redirect(redirectUrl);
};

module.exports.renderRegister = (req, res) => {
  res.render("auths/register.ejs");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    
    // 1. Create the user instance
    const user = new User({ email, username,isAdmin: false });

    // 2. Await the registration
    const registeredUser = await User.register(user, password);

    // 3. Automatically log them in after registration
    req.logIn(registeredUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Registration successful! Welcome.');
      return res.redirect('/listings');
    });

  } catch (err) {
    req.flash('error', err.message);
    return res.redirect('/auth/register');
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'Logged out successfully.');
    res.redirect('/auth/login');
  });
};