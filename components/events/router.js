const { Event } = require("./Event");
const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { body, validationResult } = require("express-validator");
const { authorize } = require("../../shared/auth")

const router = Router();

router.get('/events', wrap(async (req, res, next) => {
  const events = await Event.find();
  return res.json({
    events: events
  })
}))

router.post('/event', authorize, wrap(async (req, res, next) => {
  const newEvent = new Event({
    reportedBy: req.user.id
  })
  await newEvent.save();
  return res.status(201).json({
    event: newEvent
  })
}))

router.delete('/event/:id', authorize, wrap(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }
  await event.remove();
  return res.status(200).json({
    message: "REMOVED"
  })
}))

module.exports = router;