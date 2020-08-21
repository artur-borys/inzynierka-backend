const fs = require('fs')
const fsPromise = fs.promises;
const { manifest, getFileName } = require('./manifest')
const path = require('path');

async function getGuide(name) {
  console.log(name)
  if (!name || name.trim().length === 0) {
    return null;
  }
  const filePath = path.join(__dirname, 'guides', getFileName(name))
  const contentBuffer = await fsPromise.readFile(filePath);
  const content = contentBuffer.toString();

  return content;
}

async function getAllGuides() {
  const guides = await Promise.all(manifest.guides.map(async guide => {
    const content = await getGuide(guide.name);
    return {
      name: guide.name,
      content: content,
    }
  }))

  return guides;
}


module.exports = {
  getGuide,
  getAllGuides
}