'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = bcrypt.hashSync('password123', 10);
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      password: passwordHash,
      isMaster: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { username: 'admin' }, {});
  }
};
