const { User } = require("./User");
const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { body, validationResult } = require("express-validator");
const { authorize, getUserType } = require("../../shared/auth")
const jwt = require("../../shared/jwt")
const aqp = require('api-query-params')

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

async function checkNumberExists(value) {
  const user = await User.findByTelephoneNumber(value)
  if (user) {
    throw new Error("Numer telefonu został już wykorzystany")
  }
}


const router = Router();

router.get("/users", wrap(async (req, res, next) => {
  const { filter } = aqp(req.query)
  const userType = await getUserType(req);
  if (typeof filter.nick === 'string' && filter.nick.length) {
    filter.nick = new RegExp(filter.nick.toLowerCase(), 'i')
  } else {
    delete filter.nick;
  }

  if (userType === 'admin') {
    delete filter.hidden;
  } else {
    filter.hidden = false;
  }
  const users = await User.find(filter).populate({ path: 'emergencies' });
  return res.json({ users })
}))

router.get("/user/:id", wrap(async (req, res, next) => {
  const user = await User.findById(req.params.id)
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
  body("telephoneNumber").notEmpty().withMessage("Musisz podać numer telefonu").isNumeric().withMessage("Numer musi składać się z samych cyfr i znaku +").bail().custom(checkNumberExists),
  body("password").trim().isLength({ min: 8, max: 32 }).withMessage("Hasłu musi zawierać od 8 do 32 znaków"),
  body("passwordConfirmation").trim().custom((value, { req }) => { return value === req.body.password }).withMessage("Hasła muszą się zgadzać"),
  body("type").isIn(['regular', 'paramedic', 'dispatcher']).withMessage("Musisz podać odpowiedni typ konta")
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
    lastName: req.body.lastName,
    telephoneNumber: req.body.telephoneNumber,
    type: req.body.type
  })
  await newUser.save()
  return res.status(201).json({
    user: newUser
  })
}))

router.patch('/user/:id',
  authorize,
  [
    body('email').optional().custom(checkEmailExists),
    body('telephoneNumber').optional().custom(checkNumberExists)
  ],
  wrap(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      })
    }
    if (req.user.type == 'admin' || req.user.id == req.params.id) {
      const user = await User.findById(req.params.id);
      if (req.body.firstName) {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.fullName = `${req.body.firstName} ${req.body.lastName}`
      }
      if (req.body.email) {
        user.email = req.body.email;
      }
      if (req.body.telephoneNumber) {
        user.telephoneNumber = req.body.telephoneNumber;
      }
      if (req.body.password) {
        user.password = req.body.password;
      }
      await user.save();
      return res.json(user);
    } else {
      return res.status(401).json({
        error: "UNAUTHORIZED"
      })
    }
  })
)

router.delete("/user/:id", wrap(async (req, res, next) => {
  const user = await User.findById(req.params.id)
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

router.post("/user/:id/toggle-hide", wrap(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      errors: ["Nie znaleziono użytkownika"]
    })
  }
  user.hidden = !user.hidden;
  await user.save();
  return res.status(200).json({
    hidden: user.hidden
  })
}))

router.post("/auth", [
  body("email").if(body("nick").not().exists()).notEmpty().withMessage("Musisz podać nick lub email"),
  body("nick").if(body("email").not().exists()).notEmpty().withMessage("Musisz podać nick lub email"),
  body("password").notEmpty().withMessage("Musisz podać hasło")
], wrap(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array()
    })
  }
  let user = await User.findByNick(req.body.nick);
  if (!user) {
    user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.status(401).json({
        errors: ["UNAUTHORIZED"]
      })
    }
  }
  if (user.hidden && user.type !== 'admin') {
    return res.status(401).json({
      errors: ["UNAUTHORIZED"]
    })
  }
  user.checkPassword(req.body.password).then(resolved => {
    const accessToken = jwt.sign({
      id: user.id,
      nick: user.nick,
      type: user.type,
    }, "1h")
    res.json({
      accessToken
    })
  }, err => {
    if (err.message === "Hasła nie są zgodne") {
      return res.status(401).json({
        errors: ["UNAUTHORIZED"]
      })
    }
  })

}))

router.get("/users/me", authorize, wrap(async (req, res, next) => {
  if (req.user) {
    return res.json({
      user: req.user
    })
  }
}))

router.get('/users/me/active-emergency', authorize, wrap(async (req, res, next) => {
  const activeEmergency = await req.user.getActiveEmergency();
  if (!activeEmergency) {
    return res.status(404).json({
      error: 'NOT_FOUND'
    })
  }
  return res.json({
    emergency: activeEmergency
  })
}))

router.get('/user/:id/active-emergency', wrap(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: "USER_NOT_FOUND"
    })
  }
  const activeEmergency = await user.getActiveEmergency();
  return res.json({
    emergency: activeEmergency
  })
}))

module.exports = router;