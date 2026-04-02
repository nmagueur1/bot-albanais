const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel-rc')
    .setDescription('📩 Envoie le panel de recrutement officiel dans le salon candidatures'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('💼 Candidature – Rejoindre la Famiglia Berisha')
      .setDescription(
        'Salut ! 👋 Tu souhaites rejoindre la **Famiglia Berisha** ?\n\n' +
        'Remplis ce formulaire et notre équipe te répondra rapidement.\n' +
        'Toutes les réponses sont strictement **confidentielles**.\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
        '**Ce que nous recherchons :**\n' +
        '▸ Un joueur sérieux et impliqué dans le RP\n' +
        '▸ Quelqu\'un de loyal et discret\n' +
        '▸ Une disponibilité régulière\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .setFooter({ text: '📩 Nous te répondrons directement en DM après traitement de ta candidature.' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('open_candidature')
      .setLabel('📝 Postuler maintenant')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    const rcChannel = await client.channels.fetch(config.channels.recrutement);
    await rcChannel.send({ embeds: [embed], components: [row] });

    await interaction.reply({ content: `✅ Panel de recrutement posté dans <#${config.channels.recrutement}> !`, ephemeral: true });
    await sendLog(client, { action: 'Panel recrutement posté', user: interaction.user, color: config.colors.info });
  },
};
