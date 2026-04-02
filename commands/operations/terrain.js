const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('terrain')
    .setDescription('📍 Affiche la liste des territoires contrôlés par la famille'),

  async execute(interaction) {
    const terrains = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/terrains.json'), 'utf8'));

    if (terrains.length === 0) {
      return interaction.reply({
        content: '📍 Aucun territoire enregistré pour le moment. Utilise `/add-terrain` pour en ajouter un.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📍 Territoires – Famiglia Berisha')
      .setDescription(`**${terrains.length}** territoire(s) sous contrôle de la famille.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      .setFooter({ text: config.footerText })
      .setTimestamp();

    for (const t of terrains) {
      embed.addFields({
        name: `🗺️ ${t.nom} – Zone : ${t.zone}`,
        value:
          `⚡ **Activités :** ${t.activites}\n` +
          `🏴 **Contrôle :** ${t.controle}\n` +
          `📅 *Ajouté le ${new Date(t.addedAt).toLocaleDateString('fr-FR')} par ${t.addedBy}*`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
