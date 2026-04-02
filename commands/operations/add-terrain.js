const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-terrain')
    .setDescription('📍 Ajoute un nouveau territoire (ouvre un formulaire)'),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('modal_add_terrain')
      .setTitle('📍 Nouveau Territoire');

    const nom = new TextInputBuilder()
      .setCustomId('terrain_nom')
      .setLabel('Nom du territoire')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const zone = new TextInputBuilder()
      .setCustomId('terrain_zone')
      .setLabel('Zone / Quartier')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const activites = new TextInputBuilder()
      .setCustomId('terrain_activites')
      .setLabel('Activités possibles sur ce terrain')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const controle = new TextInputBuilder()
      .setCustomId('terrain_controle')
      .setLabel('Niveau de contrôle (ex: Total / Partagé)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nom),
      new ActionRowBuilder().addComponents(zone),
      new ActionRowBuilder().addComponents(activites),
      new ActionRowBuilder().addComponents(controle),
    );

    await interaction.showModal(modal);
  },
};
