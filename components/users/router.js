const { User } = require("./User");
const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { body, validationResult } = require("express-validator");

async function checkEmailExists(value) {
  const user = await User.findByEmail(value).exec();
  if (user) {
    throw new Error("Email jest zajęty")
  }
}

async function checkNickExitsts(value) {
  const user = await User.findByNick(value).exec();
  if (user) {
    throw new Error("Nick jest zajęty")
  }
}


const router = Router();

router.get("/users", wrap(async (req, res, next) => {
  const users = await User.find();
  return res.json({ users })
}))

router.get("/user/:nick", wrap(async (req, res, next) => {
  const user = await User.findByNick(req.params.nick)
  if (!user) {
    return res.status(404).json({
      errors: ["User not found"]
    })
  }
  res.json({
    user: user
  })
}))

router.post("/user", [
  body("nick").trim().isLength({ min: 3, max: 32 }).withMessage("Nick musi mieć od 3 do 32 znaków").bail().custom(checkNickExitsts),
  body("email").trim().notEmpty().withMessage("Musisz podać email").isEmail().withMessage("Musisz podać poprawny email").bail().custom(checkEmailExists),
  body("firstName").notEmpty().withMessage("Musisz podać imię"),
  body("lastName").notEmpty().withMessage("Musisz podać nazwisko"),
  body("password").trim().isLength({ min: 8, max: 32 }).withMessage("Hasłu musi zawierać od 8 do 32 znaków")
], wrap(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }
  const newUser = new User({
    nick: req.body.nick,
    email: req.body.email,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  })
  await newUser.save()
  return res.status(201).json({
    user: newUser
  })
}))

router.delete("/user/:nick", wrap(async (req, res, next) => {
  const user = await User.findByNick(req.params.nick)
  if (!user) {
    return res.status(404).json({
      errors: ["Nie znaleziono użytkownika"]
    })
  }

  await user.remove()
  res.status(200).json({
    message: "Usunięto użytkownika"
  })
}))

module.exports = router;