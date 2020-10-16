const { Emergency } = require("./Emergency");
const { User } = require("./../users/User");
const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { body, validationResult } = require("express-validator");
const { authorize, authorizeIfType } = require("../../shared/auth");
const Media = require("./Media");
const multer = require('multer');
const upload = multer();

const router = Router();

router.get('/emergencies', authorizeIfType(['dispatcher', 'admin']), wrap(async (req, res, next) => {
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
    emergencies = await Emergency.find({ reportedBy: user.id }).sort({ createDt: 'desc' }).populate(['reportedBy', 'paramedic', 'guide']).exec();
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
  const emergency = await Emergency.findById(req.params.id).populate(['reportedBy', 'paramedic', 'guide'])
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
  const emergency = await Emergency.findByIdAndUpdate(req.params.id, req.body).populate(['reportedBy', 'paramedic', 'guide'])
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

router.post('/emergency/:id/media', upload.single('mediaFile'), wrap(async (req, res, next) => {
  const newMedia = await Media.create({
    emergencyId: req.params.id,
    mime: req.file.mimetype,
    binaryData: req.file.buffer
  })
  return res.status(200).json({
    ok: true,
    mediaId: newMedia.id
  })
}))

router.get('/emergency/:id/media', wrap(async (req, res, next) => {
  const media = await Media.findByEmergency(req.params.id).select('-binaryData')
  return res.json(media);
}))

router.get('/media/:id', wrap(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  if (media) {
    return res.contentType(media.mime).send(media.binaryData);
  } else {
    return res.status(404);
  }
}))

router.post('/emergency/:id/image', wrap(async (req, res, next) => {
  const newImage = new Media({
    emergencyId: req.params.id,
    data: req.body.image
  })

  await newImage.save();

  return res.status(201).json({
    ok: true,
    imageId: newImage.id
  })
}))

router.get('/emergency/:id/images', wrap(async (req, res, next) => {
  const images = await Media.findByEmergency(req.params.id).select('-data').exec();
  return res.json(images);
}))

router.get('/image/:id', wrap(async (req, res, next) => {
  const image = await Media.findById(req.params.id);
  if (!image) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  } else {
    return res.json({
      dataURL: image.data
    })
  }
}))

module.exports = router;