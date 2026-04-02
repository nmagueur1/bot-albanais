const { SlashCommandBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const BIZ_PATH = path.join(__dirname, '../../data/businesses.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-business')
    .setDescription('🗑️ Supprime un business de la liste')
    .addStringOption((o) =>
      o.setName('nom').setDescription('Nom exact du business à supprimer').setRequired(true)
    ),

  async execute(interaction, client) {
    const nom = interaction.options.getString('nom');
    const businesses = JSON.parse(fs.readFileSync(BIZ_PATH, 'utf8'));
    const index = businesses.findIndex((b) => b.nom.toLowerCase() === nom.toLowerCase());

    if (index === -1) {
      return interaction.reply({ content: `❌ Business **${nom}** introuvable.`, ephemeral: true });
    }

    businesses.splice(index, 1);
    fs.writeFileSync(BIZ_PATH, JSON.stringify(businesses, null, 2));

    await interaction.reply({ content: `✅ Business **${nom}** supprimé.`, ephemeral: true });
    await sendLog(client, { action: 'Business supprimé', user: interaction.user, details: nom, color: config.colors.danger });
  },
};
