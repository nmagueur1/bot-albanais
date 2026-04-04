const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coke')
    .setDescription('💊 Guide fabrication de coke'),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('💊 Fabrication de Coke')
      .setDescription('Guide rapide pour optimiser ton farm et ta production.')
      .addFields(
        {
          name: '🧪 Étapes de fabrication',
          value: '1. Récolter le ciment\n2. Récolter le kérosène\n3. Récolter les feuilles de coca',
        },
        {
          name: '⚠️ Information importante',
          value: 'Le farm se fait en **Rumpo (450 kg)**',
        },
        {
          name: '📦 Décomposition d’un Rumpo',
          value: '**65 coca** = 65 kg\n**65 ciment** = 211,25 kg\n**65 kérosène** = 172,25 kg',
        },
        {
          name: '🏭 Production',
          value: '➡️ 65 bacs\n➡️ 65 blocs\n➡️ 520 pochons',
        },
        {
          name: '💰 Rentabilité',
          value: '**Prix :** 556$ → 677$\n**CA Rumpo :** 289 120$ → 352 040$',
        },
      )
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
