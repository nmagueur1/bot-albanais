const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('business')
    .setDescription('💼 Affiche la liste des business connus de la famille'),

  async execute(interaction) {
    const businesses = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/businesses.json'), 'utf8'));

    if (businesses.length === 0) {
      return interaction.reply({
        content: '💼 Aucun business enregistré. Utilise `/add-business` pour en créer un.',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('💼 Business – Famiglia Berisha')
      .setDescription(`**${businesses.length}** business actif(s).\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      .setFooter({ text: config.footerText })
      .setTimestamp();

    for (const b of businesses) {
      embed.addFields({
        name: `🏢 ${b.nom} – ${b.type}`,
        value:
          `📍 **Adresse :** ${b.adresse}\n` +
          `📝 **Infos :** ${b.infos}\n` +
          `📅 *Créé le ${new Date(b.addedAt).toLocaleDateString('fr-FR')} par ${b.addedBy}*`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
