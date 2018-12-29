const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const router = express.Router();
const User = require("../../models/User");
const passport = require("passport");

router.get("/test", (req, res) => {
  res.json({ msg: "This is the user route" });
});

module.exports = router;

router.post("/register", (req, res) => {
  // Check if email is already registered
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        // Throw a 404 error if the email already exists
        return res.status(400).json({ email: "Email already registered" })
      } else {
        // Otherwise create a new user
        const newUser = new User({
          handle: req.body.handle,
          email: req.body.email,
          password: req.body.password
        })

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          })
        })
      }
    })
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: "No user found" });
      }

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            const payload = { id: user.id, name: user.name };

            jwt.sign(
              payload,
              keys.secretOrKey,
              // Key will expire in one hour
              { expiresIn: 3600 },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token
                });
              });
          } else {
            return res.status(400).json({ password: "Wrong password" });
          }
        })
    });
});

// First private auth route
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    id: req.user.id,
    handle: req.user.handle,
    email: req.user.email
  });
})
