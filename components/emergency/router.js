const { Emergency } = require("./Emergency");
const { User } = require("./../users/User");
const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { body, validationResult } = require("express-validator");
const { authorize, authorizeIfType } = require("../../shared/auth")

const router = Router();

router.get('/emergencies', authorizeIfType('dispatcher'), wrap(async (req, res, next) => {
  let emergencies;
  if (req.query.telephoneNumber) {
    const telephoneNumber = req.query.telephoneNumber;
    const user = await User.findOne({ telephoneNumber: telephoneNumber }).exec();
    if (!user) {
      // we don't want to fail, just return empty array
      return res.json({
        emergencies: []
      })
    }
    emergencies = await Emergency.find({ reportedBy: user.id }).sort({ createDt: 'desc' }).populate(['reportedBy', 'paramedic']).exec();
  } else {
    emergencies = await Emergency.find().sort({ createDt: 'desc' }).populate([
      'reportedBy',
      'paramedic'
    ]).exec();
  }

  return res.json({
    emergencies: emergencies
  })
}))

router.post('/emergency', authorize, wrap(async (req, res, next) => {
  const newEmergency = new Emergency({
    ...req.body.emergency
  })
  await newEmergency.save();
  return res.status(201).json({
    emergency: newEmergency
  })
}))

router.get('/emergency/:id', authorize, wrap(async (req, res, next) => {
  const emergency = await Emergency.findById(req.params.id).populate(['reportedBy', 'paramedic'])
  if (!emergency) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }

  return res.json({
    emergency
  })
}));

router.patch('/emergency/:id', authorizeIfType(['paramedic', 'dispatcher']), wrap(async (req, res, next) => {
  const emergency = await Emergency.findByIdAndUpdate(req.params.id, req.body).populate(['reportedBy', 'paramedic'])
  return res.status(201).json({
    emergency
  })
}))

router.delete('/emergency/:id', authorize, wrap(async (req, res, next) => {
  const emergency = await Emergency.findById(req.params.id);
  if (!emergency) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }
  await emergency.remove();
  return res.status(200).json({
    message: "REMOVED"
  })
}))

module.exports = router;