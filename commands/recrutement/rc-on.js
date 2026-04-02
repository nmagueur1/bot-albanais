const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const RC_PATH = path.join(__dirname, '../../data/rc-status.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rc-on')
    .setDescription('✅ Ouvre les candidatures'),

  async execute(interaction, client) {
    fs.writeFileSync(RC_PATH, JSON.stringify({ open: true }, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.colors.success)
      .setTitle('✅ Recrutement OUVERT')
      .setDescription('Les candidatures sont désormais **ouvertes** ! Bonne chance à tous les postulants.')
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    await sendLog(client, { action: 'Recrutement ouvert', user: interaction.user, color: config.colors.success });
  },
};
