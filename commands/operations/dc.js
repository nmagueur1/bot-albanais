const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dc')
    .setDescription('📱 Gestion du Dark Chat de la famille')
    .addSubcommand((sub) =>
      sub
        .setName('info')
        .setDescription('📱 Communique le nom du Dark Chat actuel')
        .addStringOption((o) =>
          o.setName('nom').setDescription('Nom du Dark Chat').setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('delete')
        .setDescription('🚨 Annonce de suppression du Dark Chat – mention @Berisha')
        .addStringOption((o) =>
          o.setName('nom').setDescription('Nom du Dark Chat à supprimer').setRequired(true)
        )
    ),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const nom = interaction.options.getString('nom');

    // ── Sous-commande INFO ───────────────────
    if (sub === 'info') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.dark)
        .setTitle('📱 Dark Chat – Famiglia Berisha')
        .setDescription(
          '> *Information hautement confidentielle. Ne pas mentionner en dehors de la famille.*\n\n' +
          `**Nom du Dark Chat :**\n\n` +
          `\`\`\`fix\n${nom}\n\`\`\``
        )
        .addFields({
          name: '⚠️ Rappel de sécurité',
          value: '▸ Ne **jamais** communiquer ce nom à l\'extérieur.\n▸ En cas de compromission, alerter immédiatement la direction.',
        })
        .setFooter({ text: config.footerText })
        .setTimestamp();

      const dcChannel = await client.channels.fetch(config.channels.darkChat);
      await dcChannel.send({ embeds: [embed] });
      await interaction.reply({ content: `✅ Nom du Dark Chat publié dans <#${config.channels.darkChat}> !`, ephemeral: true });
      await sendLog(client, { action: 'Dark Chat – Info publiée', user: interaction.user, details: `Nom : ${nom}`, color: config.colors.info });
    }

    // ── Sous-commande DELETE ─────────────────
    if (sub === 'delete') {
      const embed = new EmbedBuilder()
        .setColor(config.colors.danger)
        .setTitle('🚨 ALERTE – Suppression du Dark Chat')
        .setDescription(
          `<@&${config.roles.berisha}>\n\n` +
          '**⚠️ ACTION REQUISE IMMÉDIATEMENT ⚠️**\n\n' +
          `Le Dark Chat **\`${nom}\`** doit être **supprimé de tous les téléphones**.\n\n` +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
          '▸ Supprimer la conversation complète\n' +
          '▸ Vider la corbeille / cache de l\'application\n' +
          '▸ Confirmer la suppression à un haut gradé\n\n' +
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
          '*Ne pas tarder. La sécurité de la famille en dépend.*'
        )
        .setFooter({ text: config.footerText })
        .setTimestamp();

      const dcChannel = await client.channels.fetch(config.channels.darkChat);
      await dcChannel.send({ content: `<@&${config.roles.berisha}>`, embeds: [embed] });
      await interaction.reply({ content: `✅ Alerte de suppression publiée dans <#${config.channels.darkChat}> !`, ephemeral: true });
      await sendLog(client, { action: 'Dark Chat – Alerte suppression', user: interaction.user, details: `DC : ${nom}`, color: config.colors.danger });
    }
  },
};
