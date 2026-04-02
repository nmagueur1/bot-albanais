const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} est en ligne et prêt !`);
    client.user.setActivity('la Famiglia Berisha', { type: ActivityType.Watching });
  },
};
