const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { manifest } = require('./manifest')
const { getGuide, getAllGuides } = require('./utils')
const { Handbook } = require('./Handbook');
const { Guide } = require('./Guide');
const { authorizeIfType } = require('../../shared/auth');

const router = new Router();

router.get('/handbook/manifest', wrap(async (req, res, next) => {
  const handbook = await Handbook.find().populate('guides');
  return res.json(handbook[0]);
}))

router.get('/handbook/guides', wrap(async (req, res, next) => {
  const handbook = await Handbook.findOne().populate('guides');
  const guides = handbook.guides.map(guide => {
    return {
      _id: guide.id,
      name: guide.name
    }
  })
  return res.json(guides);
}))

// router.get('/handbook/guide/:name', wrap(async (req, res, next) => {
//   const handbookContents = await getGuide(req.params.name);

//   if (handbookContents) {
//     return res.json({
//       name: req.params.name,
//       content: handbookContents
//     })
//   } else {
//     return res.status(404).json({
//       error: "NOT_FOUND"
//     })
//   }
// }))

router.get('/handbook/guide/:id', wrap(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }

  return res.json(guide);
}))

router.post('/handbook/guide', authorizeIfType('admin'), wrap(async (req, res, next) => {
  const newGuide = await Guide.create({
    name: req.body.name,
    content: req.body.content
  })
  const handbook = await Handbook.findOne();
  handbook.guides.push(newGuide.id);
  handbook.version += 1;
  await handbook.save();
  return res.status(201).json({
    message: "GUIDE_CREATED"
  })
}))

router.patch('/handbook/guide/:id', authorizeIfType('admin'), wrap(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }
  guide.name = req.body.name
  guide.content = req.body.content

  await guide.save();

  const handbook = await Handbook.findOne();
  handbook.version += 1;
  await handbook.save();

  return res.status(201).json({
    message: "UPDATED"
  })
}))

router.delete('/handbook/guide/:id', authorizeIfType('admin'), wrap(async (req, res, next) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) {
    return res.status(404).json({
      error: 'NOT_FOUND'
    })
  }
  await guide.remove();
  const handbook = await Handbook.findOne();
  handbook.guides.pull({ _id: req.params.id });
  handbook.version += 1;
  await handbook.save();
  return res.json({
    message: 'DELETED'
  })
}))

router.get('/handbook/update', wrap(async (req, res, next) => {
  const handbook = await Handbook.findOne().populate('guides');
  if (req.query.version) {
    if (Number(req.query.version) === handbook.version) {
      return res.json({
        upToDate: true,
      })
    }
  }
  return res.json({
    upToDate: false,
    manifest: handbook
  })
}))

module.exports = router;