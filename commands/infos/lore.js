const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../utils/config');
const { sendLog } = require('../../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lore')
    .setDescription('📖 Envoie le lore officiel de la Famiglia Berisha'),

  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle('📖 Histoire de la Famiglia Berisha')
      .setDescription(
        '> *"Celui qui trahit sa famille se trahit lui-même."*\n\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
      )
      .addFields({
        name: '🇦🇱 Origines',
        value:
          'La Famiglia Berisha trouve ses racines en Albanie, créée par des membres ambitieux de la diaspora cherchant à bâtir une famille puissante, respectée et discrète. \n' +
          'Là où d\'autres voyaient des obstacles, ses fondateurs voyaient des opportunités - et la volonté de les saisir.\n\n' +
          'Très tôt, la Famiglia a combiné business légaux et opérations discrètes, s\'imposant progressivement dans le paysage local et dans la diaspora européenne.\n' +
          'Chaque décision, chaque alliance, chaque risque était calculé avec la précision d\'un horloger.',
      })
      .setFooter({ text: config.footerText });

    const embed2 = new EmbedBuilder()
      .setColor(config.colors.dark)
      .addFields(
        {
          name: '🏙️ L\'Arrivée en Ville',
          value:
            'Fuyant les conflits balkaniques des années 90, plusieurs familles albanaises se sont implantées dans la ville. ' +
            'Parmi elles, les Berisha – petits au départ, ils ont su s\'imposer à force de discipline, ' +
            'de réseaux et d\'une loyauté à toute épreuve.\n\n' +
            'Là où d\'autres cherchaient la gloire, les Berisha cherchaient la **puissance durable**.',
        },
        {
          name: '🦅 Le Symbole',
          value:
            'L\'**Aigle à deux têtes**, emblème national albanais, est le symbole sacré de la famiglia. ' +
            'Il représente la vigilance des deux côtés – passé et futur, guerre et paix, ombre et lumière.\n\n' +
            'Chaque membre tatoué de l\'aigle a prêté serment. Il n\'y a pas de retour en arrière.',
        },
      )
      .setFooter({ text: config.footerText });

    const embed3 = new EmbedBuilder()
      .setColor(config.colors.primary)
      .addFields(
        {
          name: '💼 Activités & Influence',
          value:
            'La famiglia opère dans plusieurs domaines :\n' +
            '▸ **Commerce** – légal en façade, stratégique en coulisse\n' +
            '▸ **Territoire** – contrôle de zones stratégiques de la ville\n' +
            '▸ **Protection** – services discrets pour ceux qui savent où chercher\n' +
            '▸ **Renseignement** – réseau d\'informateurs soigneusement entretenu',
        },
        {
          name: '⚖️ La Hiérarchie',
          value:
            '👑 **Kry** – Chef Suprême. Sa parole est loi.\n' +
            '⚜️ **Nënkry** – Sous-Chef. Il parle au nom du Kry.\n' +
            '🧠 **Kësh** – Conseiller. La tête pensante de l\'organisation.\n' +
            '⚔️ **Kap** – Chef de Section. Commandant de terrain.\n' +
            '🗡️ **Ush** – Soldat Confirmé. Le cœur de la famille.\n' +
            '🌱 **Anët** – Associé / Probatoire. En cours d\'intégration.',
        },
      )
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .setFooter({ text: '🦅 Famiglia Berisha • Gjith gjaku – Tout pour le sang' })
      .setTimestamp();

    const loreChannel = await client.channels.fetch(config.channels.lore);
    await loreChannel.send({ embeds: [embed1] });
    await loreChannel.send({ embeds: [embed2] });
    await loreChannel.send({ embeds: [embed3] });

    await interaction.reply({ content: `✅ Lore posté dans <#${config.channels.lore}> !`, ephemeral: true });
    await sendLog(client, { action: 'Lore affiché', user: interaction.user, color: config.colors.info });
  },
};
