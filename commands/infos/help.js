const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Affiche toutes les commandes disponibles'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📚 Commandes – Gjyshi Bot')
      .setDescription('Voici toutes les commandes disponibles sur le serveur.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields(
        {
          name: '📖 INFOS',
          value:
            '`/reglement` → Poste le règlement du serveur\n' +
            '`/lore` → Poste le lore de la Famiglia\n' +
            '`/organisation` → Affiche la hiérarchie\n' +
            '`/embed` → Crée un embed personnalisé\n' +
            '`/role-react` → Crée un bouton de role-react',
        },
        {
          name: '📢 BERISHA',
          value:
            '`/annonce` → Poste une annonce officielle',
        },
        {
          name: '⚙️ OPÉRATIONS',
          value:
            '`/terrain` → Liste les territoires\n' +
            '`/add-terrain` → Ajoute un territoire\n' +
            '`/remove-terrain <nom>` → Supprime un territoire\n' +
            '`/business` → Liste les businesses\n' +
            '`/add-business` → Crée un business\n' +
            '`/remove-business <nom>` → Supprime un business\n' +
            '`/radio <numéro>` → Publie la fréquence radio du soir\n' +
            '`/dc info <nom>` → Communique le Dark Chat\n' +
            '`/dc delete <nom>` → Alerte de suppression du DC',
        },
        {
          name: '🛡️ STAFF',
          value:
            '`/kick <membre>` → Expulse un membre\n' +
            '`/ban <membre>` → Bannit un membre\n' +
            '`/mute <membre>` → Mute un membre',
        },
        {
          name: '📩 RECRUTEMENT',
          value:
            '`/panel-rc` → Poste le panel de candidature\n' +
            '`/rc-on` → Ouvre les candidatures\n' +
            '`/rc-off` → Ferme les candidatures',
        },
      )
      .setFooter({ text: config.footerText })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
