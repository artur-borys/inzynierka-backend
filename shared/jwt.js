const jwt = require("jsonwebtoken");

const SECRET = "MySuperSecretText"

module.exports.sign = (payload, expiresIn) => {
  return jwt.sign(payload, SECRET, { expiresIn }).toString("base64");
}

module.exports.verify = (token) => {
  return jwt.verify(token, SECRET);
}