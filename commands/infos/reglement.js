const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reglement')
    .setDescription('📜 Affiche le règlement complet de la Famiglia Berisha'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📜 Règlement du Serveur')
      .setDescription(
        '> Bienvenue sur le serveur de la **Famiglia Berisha**.\n' +
        '> Le respect de ces règles est **obligatoire** pour tous.\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .addFields(
        {
          name: '〔 1 〕 Respect & Bienveillance',
          value:
            '▸ Tout le monde doit être traité avec respect, sans exception.\n' +
            '▸ Les insultes, provocations, discriminations et harcèlements sont **interdits**.\n' +
            '▸ Les conflits se règlent en privé, jamais dans les salons publics.',
        },
        {
          name: '〔 2 〕 Comportement général',
          value:
            '▸ Pas de spam, flood, mentions abusives ou majuscules excessives.\n' +
            '▸ Pas de publicité ou de lien vers d\'autres serveurs sans autorisation du staff.\n' +
            '▸ Le pseudo et l\'avatar doivent rester appropriés et lisibles.',
        },
        {
          name: '〔 3 〕 Contenu autorisé',
          value:
            '▸ Tout contenu choquant, pornographique ou illégal est **strictement interdit**.\n' +
            '▸ Respectez les thématiques de chaque salon (utilisez le bon salon).\n' +
            '▸ Le contenu partagé doit respecter les CGU de Discord.',
        },
        {
          name: '〔 4 〕 Roleplay & RP',
          value:
            '▸ Le RP se fait uniquement dans les salons dédiés.\n' +
            '▸ Ne pas mélanger les informations HRP et RP.\n' +
            '▸ Le meta-gaming (utiliser des infos HRP en RP) est **interdit**.\n' +
            '▸ Respecter le lore et l\'univers de la Famiglia.',
        },
        {
          name: '〔 5 〕 Vocal',
          value:
            '▸ Pas de bruit de fond excessif, son crachotant ou musique non désirée.\n' +
            '▸ Respectez la parole des autres, pas de coupures intempestives.\n' +
            '▸ L\'utilisation d\'un soundboard doit être validée par les présents.',
        },
        {
          name: '〔 6 〕 Staff & Sanctions',
          value:
            '▸ Les décisions du staff sont **finales** et doivent être respectées.\n' +
            '▸ Ne pas tenter de contourner un mute, kick ou ban.\n' +
            '▸ Toute contestation se fait en DM au staff, jamais en public.\n\n' +
            '🔴 **Warn** → 🟠 **Mute** → 🟡 **Kick** → 🔨 **Ban**',
        },
      )
      .setFooter({ text: `${config.footerText} • Le non-respect entraîne des sanctions.` })
      .setTimestamp();

    const reglChannel = await client.channels.fetch(config.channels.reglement);
    await reglChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Règlement posté dans <#${config.channels.reglement}> !`, ephemeral: true });
    await sendLog(client, { action: 'Règlement affiché', user: interaction.user, color: config.colors.info });
  },
};
