const jwt = require("./jwt")
const { User } = require("../components/users/User")

function extractToken(req) {
  const authorizationHeader = req.get("Authorization")
  if (!authorizationHeader) { return null }
  const token = authorizationHeader.split("Bearer")[1].trim();
  return token
}

async function authorize(req, res, next) {
  try {
    const token = extractToken(req)
    const decoded = jwt.verify(token)
    req.user = await User.findById(decoded.id)
    next()
  } catch (e) {
    next(e)
  }
}

module.exports.authorize = authorize

module.exports.authorizeIfType = function (types) {
  return [authorize, (req, res, next) => {
    // Convert to array if not already
    const test = Array.isArray(types) ? types : [types]

    // if user type not found in allowed types, throw error
    if (test.indexOf(req.user.type) === -1) {
      next(new Error("UnauthorizedType"))
    } else {
      next()
    }
  }]
}
