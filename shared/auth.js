const jwt = require("./jwt")
const { User } = require("../components/users/User")

function extractToken(req) {
  const authorizationHeader = req.get("Authorization")
  const token = authorizationHeader.split("Bearer")[1].trim();
  return token
}

module.exports.authorize = async function (req, res, next) {
  try {
    const token = extractToken(req)
    const decoded = jwt.verify(token)
    req.user = await User.findById(decoded.id)
    next()
  } catch (e) {
    next(e)
  }
}

module.exports.authorizeIfType = async function (type) {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      const decoded = jwt.verify(token)
      if (decoded.type === type) {
        req.user = decoded
        next()
      } else {
        next(new Error("UnauthorizedType"))
      }
    } catch (e) {
      next(e)
    }
  }
}
