const config = require('./config')
const { User } = require('./components/users/User')
const { Handbook } = require('./components/handbook/Handbook');
const { Guide } = require('./components/handbook/Guide');

async function init() {
  const admin = await User.findOne({ type: 'admin' });
  if (!admin) {
    console.log('Creating admin')
    const newAdmin = await User.create({
      type: 'admin',
      ...config.admin
    })
  }

  const handbook = await Handbook.findOne();
  if (!handbook) {
    console.log('Creating handbook');
    const newHandbook = await Handbook.create({
      version: 1,
      guides: []
    });
    console.log('Handbook created');
    console.log('Populating handbook');
    const newGuide = await Guide.create({
      name: "Przykład",
      content: "# To jest przykładowy poradnik\n\nasd 123"
    })
    newHandbook.guides.push(newGuide.id);
    newHandbook.save();
  }
}

module.exports.init = init;