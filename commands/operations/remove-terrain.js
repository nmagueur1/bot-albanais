const { SlashCommandBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');
const fs = require('fs');
const path = require('path');

const TERRAIN_PATH = path.join(__dirname, '../../data/terrains.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-terrain')
    .setDescription('🗑️ Supprime un territoire de la liste')
    .addStringOption((o) =>
      o.setName('nom').setDescription('Nom exact du territoire à supprimer').setRequired(true)
    ),

  async execute(interaction, client) {
    const nom = interaction.options.getString('nom');
    const terrains = JSON.parse(fs.readFileSync(TERRAIN_PATH, 'utf8'));
    const index = terrains.findIndex((t) => t.nom.toLowerCase() === nom.toLowerCase());

    if (index === -1) {
      return interaction.reply({ content: `❌ Territoire **${nom}** introuvable.`, ephemeral: true });
    }

    terrains.splice(index, 1);
    fs.writeFileSync(TERRAIN_PATH, JSON.stringify(terrains, null, 2));

    await interaction.reply({ content: `✅ Territoire **${nom}** supprimé de la liste.`, ephemeral: true });
    await sendLog(client, { action: 'Terrain supprimé', user: interaction.user, details: nom, color: config.colors.danger });
  },
};
