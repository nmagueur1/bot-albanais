const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-business')
    .setDescription('💼 Crée un nouveau business avec un fil de discussion'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_add_business')
      .setTitle('💼 Nouveau Business');

    const nom = new TextInputBuilder()
      .setCustomId('biz_nom')
      .setLabel('Nom du business')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const type = new TextInputBuilder()
      .setCustomId('biz_type')
      .setLabel('Type (ex: Garage, Bar, Import/Export...)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const adresse = new TextInputBuilder()
      .setCustomId('biz_adresse')
      .setLabel('Adresse RP')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const infos = new TextInputBuilder()
      .setCustomId('biz_infos')
      .setLabel('Informations complémentaires')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nom),
      new ActionRowBuilder().addComponents(type),
      new ActionRowBuilder().addComponents(adresse),
      new ActionRowBuilder().addComponents(infos),
    );

    await interaction.showModal(modal);
  },
};
