const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('organisation')
    .setDescription('🧩 Affiche la structure hiérarchique de la Famiglia Berisha'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('🧩 Structure – Famiglia Berisha')
      .setDescription(
        '> *Organisation interne de la famille. Connaître sa place, c\'est connaître sa valeur.*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .addFields(
        {
          name: '👑  KRY — Chef Suprême · 1 poste',
          value: '→ Autorité absolue sur la famille. Sa parole est loi.',
        },
        {
          name: '⚜️  NËNKRY — Sous-Chef · 1 poste',
          value: '→ Bras droit du Kry. Représente la direction en son absence.',
        },
        {
          name: '🧠  KËSH — Conseiller · 1 poste',
          value: '→ Stratège de l\'organisation. Conseille sur les décisions importantes.',
        },
        {
          name: '⚔️  KAP — Chef de Section · 3 postes',
          value: '→ Commandant de terrain. Dirige les opérations et gère les membres.',
        },
        {
          name: '🗡️  USH — Soldat Confirmé · Effectif variable',
          value: '→ Membre actif de la famille. Participe aux opérations.',
        },
        {
          name: '🌱  ANËT — Associé / Probatoire · Effectif variable',
          value: '→ Nouveau membre en période d\'évaluation. Sous tutelle d\'un membre confirmé.',
        },
      )
      .setFooter({ text: config.footerText })
      .setTimestamp();

    const orgChannel = await client.channels.fetch(config.channels.organisation);
    await orgChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ Organisation postée dans <#${config.channels.organisation}> !`, ephemeral: true });
    await sendLog(client, { action: 'Organisation affichée', user: interaction.user, color: config.colors.info });
  },
};
