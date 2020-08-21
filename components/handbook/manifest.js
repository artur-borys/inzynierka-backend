const manifest = {
  version: 1,
  guides: [
    {
      name: "Guide1",
      file: "Guide1.md"
    }
  ]
}

function getFileName(name) {
  const handbook = manifest.guides.find(obj => {
    return obj.name === name
  })

  return handbook.file
}

module.exports = {
  manifest,
  getFileName
}