const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { manifest } = require('./manifest')
const { getGuide, getAllGuides } = require('./utils')
const { Handbook } = require('./Handbook');
const { Guide } = require('./Guide');

const router = new Router();

router.get('/handbook/manifest', wrap(async (req, res, next) => {
  const handbook = await Handbook.find().populate('guides');
  return res.json(handbook[0]);
}))

router.get('/handbook/guide/:name', wrap(async (req, res, next) => {
  const handbookContents = await getGuide(req.params.name);

  if (handbookContents) {
    return res.json({
      name: req.params.name,
      content: handbookContents
    })
  } else {
    return res.status(404).json({
      error: "NOT_FOUND"
    })
  }
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