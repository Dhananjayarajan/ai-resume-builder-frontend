const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./services/passport");

mongoose.connect(process.env.MONGO_URI);

const app = express();

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

console.log("LinkedIn Client ID:", process.env.LINKEDIN_CLIENT_ID);
console.log("LinkedIn Client Secret:", process.env.LINKEDIN_CLIENT_SECRET);

app.use(passport.initialize());
app.use(passport.session());
require("./routes/authRoutes")(app);

if (process.env.NODE_ENV === "production") {
  const path = require("path");
  app.use(express.static(path.resolve(__dirname, "client", "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
