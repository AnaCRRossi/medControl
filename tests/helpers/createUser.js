const UserService = require('../../src/services/UserService');

async function createUser(email, password, name, role = 'USER', age) {
  return await UserService.create(email, password, name, role, age);
}

async function createAdmin() {
  return await createUser('admin@test.com', '123456', 'Admin User', 'ADMIN', 30);
}

async function createRegularUser() {
  return await createUser('user@test.com', '123456', 'Regular User', 'USER', 25);
}

module.exports = {
  createUser,
  createAdmin,
  createRegularUser
};