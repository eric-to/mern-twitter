const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const User = require("../../models/User");

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
            res.json({ msg: "Successful login" });
          } else {
            return res.status(400).json({ password: "Wrong password" });
          }
        })
    });
});
