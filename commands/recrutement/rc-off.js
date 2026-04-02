const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const RC_PATH = path.join(__dirname, '../../data/rc-status.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rc-off')
    .setDescription('🔒 Ferme les candidatures'),

  async execute(interaction, client) {
    fs.writeFileSync(RC_PATH, JSON.stringify({ open: false }, null, 2));

    const embed = new EmbedBuilder()
      .setColor(config.colors.danger)
      .setTitle('🔒 Recrutement FERMÉ')
      .setDescription('Les candidatures sont désormais **fermées**. Aucune nouvelle postulation ne sera acceptée.')
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    await sendLog(client, { action: 'Recrutement fermé', user: interaction.user, color: config.colors.danger });
  },
};
