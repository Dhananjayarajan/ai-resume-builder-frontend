const passport = require("passport");

module.exports = (app) => {
  const redirectDomain = process.env.REDIRECT_DOMAIN || "http://localhost:5173";

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: `${redirectDomain}/dashboard`,
      failureRedirect: `${redirectDomain}/login`,
    })
  );

  app.get(
    "/auth/linkedin",
    (req, res, next) => {
      console.log("🔁 /auth/linkedin route triggered");
      next();
    },
    passport.authenticate("linkedin")
  );

  app.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get(
    "/auth/linkedin/callback",
    passport.authenticate("linkedin", {
      successRedirect: `${redirectDomain}/dashboard`,
      failureRedirect: `${redirectDomain}/login`,
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout();

    res.redirect(`${redirectDomain}`);
  });

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};
