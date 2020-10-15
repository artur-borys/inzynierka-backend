module.exports = {
  host: "0.0.0.0",
  port: 4000,
  mongo: {
    url: "mongodb://192.168.253.129/first-aid-help",
    options: { useNewUrlParser: true, useUnifiedTopology: true }
  },
  admin: {
    nick: 'admin',
    password: '12345678',
    email: 'admin@admin.com',
    telephoneNumber: '123456789',
    firstName: 'Admin',
    lastName: 'Administrator',
    hidden: true
  }
}