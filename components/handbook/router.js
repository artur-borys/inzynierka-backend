const { Router } = require("express");
const wrap = require("../../shared/wrap");
const { manifest } = require('./manifest')
const { getGuide, getAllGuides } = require('./utils')

const router = new Router();

router.get('/handbook/manifest', wrap(async (req, res, next) => {
  return res.json(manifest)
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
  if (req.query.version) {
    if (Number(req.query.version) === manifest.version) {
      return res.json({
        upToDate: true,
      })
    }
  }
  const guides = await getAllGuides();
  return res.json({
    upToDate: false,
    manifest,
    guides,
  })
}))

module.exports = router;