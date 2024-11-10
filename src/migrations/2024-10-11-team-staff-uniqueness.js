'use strict';

module.exports = {
  async up(db, client) {
    // SQL to add a unique constraint on (orderId, productId)
    await db.query(`ALTER TABLE TeamStaff ADD CONSTRAINT unique_team_staff UNIQUE (teamId, staffId)`);
  },

  async down(db, client) {
    // SQL to remove the unique constraint
    await db.query(`ALTER TABLE TeamStaff DROP INDEX unique_team_staff`);
  },
};
