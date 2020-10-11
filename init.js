const config = require('./config')
const { User } = require('./components/users/User')

async function init() {
  const admin = await User.findOne({ type: 'admin' });
  if (!admin) {
    console.log('Creating admin')
    const newAdmin = await User.create({
      type: 'admin',
      ...config.admin
    })
  }
}

module.exports.init = init;