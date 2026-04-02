const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { isAdmin, hasAccess, denyAccess } = require('../utils/permissions');
const config = require('../utils/config');
const fs = require('fs');
const path = require('path');

// ─── Chemins des données ───────────────────
const RC_PATH = path.join(__dirname, '../data/rc-status.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // ═══════════════════════════════════════
    // 1. SLASH COMMANDS
    // ═══════════════════════════════════════
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Vérification accès bot (sauf /help)
      if (!hasAccess(interaction.member) && interaction.commandName !== 'help') {
        return denyAccess(interaction);
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[Commande /${interaction.commandName}]`, error);
        const msg = { content: '❌ Une erreur est survenue lors de l\'exécution de cette commande.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // ═══════════════════════════════════════
    // 2. BOUTONS
    // ═══════════════════════════════════════
    if (interaction.isButton()) {
      // ── Bouton candidature ────────────────
      if (interaction.customId === 'open_candidature') {
        // Vérification RC ouvert
        const rcStatus = JSON.parse(fs.readFileSync(RC_PATH, 'utf8'));
        if (!rcStatus.open) {
          return interaction.reply({
            content: '🔒 Les candidatures sont actuellement **fermées**. Reviens plus tard !',
            ephemeral: true,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId('modal_candidature')
          .setTitle('📝 Candidature – Famiglia Berisha');

        const fields = [
          new TextInputBuilder().setCustomId('pseudo_hrp').setLabel('Pseudo HRP').setStyle(TextInputStyle.Short).setRequired(true),
          new TextInputBuilder().setCustomId('age_hrp').setLabel('Âge HRP').setStyle(TextInputStyle.Short).setRequired(true),
          new TextInputBuilder().setCustomId('dispos_hrp').setLabel('Disponibilités HRP (jours/heures)').setStyle(TextInputStyle.Short).setRequired(true),
          new TextInputBuilder().setCustomId('identite_rp').setLabel('Nom & Prénom RP + Date de naissance').setStyle(TextInputStyle.Short).setRequired(true),
          new TextInputBuilder().setCustomId('questions_rp').setLabel('Expérience, pourquoi Berisha, compétences ?').setStyle(TextInputStyle.Paragraph).setRequired(true),
        ];

        modal.addComponents(fields.map((f) => new ActionRowBuilder().addComponents(f)));
        return interaction.showModal(modal);
      }

      // ── Boutons accept/refus candidature ─
      if (interaction.customId.startsWith('rc_accept_') || interaction.customId.startsWith('rc_refuse_')) {
        if (!isAdmin(interaction.member)) return denyAccess(interaction);

        const [, action, userId, threadId] = interaction.customId.split('_');
        const accepted = action === 'accept';

        try {
          const targetUser = await client.users.fetch(userId);
          const dmEmbed = new EmbedBuilder()
            .setColor(accepted ? config.colors.success : config.colors.danger)
            .setTitle(accepted ? '✅ Candidature acceptée !' : '❌ Candidature refusée')
            .setDescription(
              accepted
                ? 'Félicitations ! Ta candidature pour rejoindre la **Famiglia Berisha** a été **acceptée**. Un membre du staff va prendre contact avec toi très prochainement.'
                : 'Nous avons bien étudié ta candidature pour rejoindre la **Famiglia Berisha**, mais celle-ci n\'a pas été retenue cette fois. Tu pourras retenter ta chance ultérieurement.'
            )
            .setFooter({ text: config.footerText })
            .setTimestamp();

          await targetUser.send({ embeds: [dmEmbed] });

          // Mise à jour du message original
          await interaction.update({
            components: [],
            embeds: [
              EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(accepted ? config.colors.success : config.colors.danger)
                .setTitle((accepted ? '✅ ACCEPTÉ – ' : '❌ REFUSÉ – ') + interaction.message.embeds[0].title),
            ],
          });

          // Log
          await sendLog(client, {
            action: `Candidature ${accepted ? 'ACCEPTÉE' : 'REFUSÉE'}`,
            user: interaction.user,
            target: targetUser,
            color: accepted ? config.colors.success : config.colors.danger,
          });
        } catch (err) {
          await interaction.reply({ content: '⚠️ Impossible d\'envoyer le DM à l\'utilisateur.', ephemeral: true });
        }
        return;
      }

      // ── Boutons role-react ────────────────
      if (interaction.customId.startsWith('role_react_')) {
        const roleId = interaction.customId.replace('role_react_', '');
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return interaction.reply({ content: '❌ Rôle introuvable.', ephemeral: true });

        const member = interaction.member;
        if (member.roles.cache.has(roleId)) {
          await member.roles.remove(roleId);
          return interaction.reply({ content: `✅ Rôle **${role.name}** retiré.`, ephemeral: true });
        } else {
          await member.roles.add(roleId);
          return interaction.reply({ content: `✅ Rôle **${role.name}** attribué !`, ephemeral: true });
        }
      }
    }

    // ═══════════════════════════════════════
    // 3. MODALS
    // ═══════════════════════════════════════
    if (interaction.isModalSubmit()) {
      // ── Modal candidature ─────────────────
      if (interaction.customId === 'modal_candidature') {
        const pseudoHrp    = interaction.fields.getTextInputValue('pseudo_hrp');
        const ageHrp       = interaction.fields.getTextInputValue('age_hrp');
        const disposHrp    = interaction.fields.getTextInputValue('dispos_hrp');
        const identiteRp   = interaction.fields.getTextInputValue('identite_rp');
        const questionsRp  = interaction.fields.getTextInputValue('questions_rp');

        const rcChannel = await client.channels.fetch(config.channels.recrutement);
        if (!rcChannel) return interaction.reply({ content: '❌ Salon de recrutement introuvable.', ephemeral: true });

        const candidatureEmbed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle('📋 Nouvelle Candidature')
          .addFields(
            { name: '👤 Pseudo HRP', value: pseudoHrp, inline: true },
            { name: '🎂 Âge HRP', value: ageHrp, inline: true },
            { name: '🕐 Disponibilités', value: disposHrp, inline: true },
            { name: '🪪 Identité RP', value: identiteRp, inline: false },
            { name: '📝 Questions RP', value: questionsRp, inline: false },
            { name: '📨 Discord', value: `<@${interaction.user.id}>`, inline: true },
          )
          .setFooter({ text: config.footerText })
          .setTimestamp();

        const actionRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`rc_accept_${interaction.user.id}_`)
            .setLabel('✅ Accepter')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`rc_refuse_${interaction.user.id}_`)
            .setLabel('❌ Refuser')
            .setStyle(ButtonStyle.Danger),
        );

        await rcChannel.send({ embeds: [candidatureEmbed], components: [actionRow] });

        // Confirmation au candidat
        await interaction.reply({
          content: '📩 Ta candidature a bien été envoyée ! Tu recevras une réponse en DM prochainement.',
          ephemeral: true,
        });

        await sendLog(client, {
          action: 'Nouvelle candidature reçue',
          user: interaction.user,
          details: `Pseudo HRP : ${pseudoHrp}`,
          color: config.colors.info,
        });
        return;
      }

      // ── Modal embed générique ─────────────
      if (interaction.customId === 'modal_embed') {
        const titre      = interaction.fields.getTextInputValue('embed_titre');
        const description = interaction.fields.getTextInputValue('embed_description');
        const couleur    = interaction.fields.getTextInputValue('embed_couleur') || '#8B0000';
        const footer     = interaction.fields.getTextInputValue('embed_footer') || config.footerText;
        const imageUrl   = interaction.fields.getTextInputValue('embed_image') || null;

        let colorInt;
        try {
          colorInt = parseInt(couleur.replace('#', ''), 16);
        } catch {
          colorInt = config.colors.primary;
        }

        const embed = new EmbedBuilder()
          .setColor(colorInt)
          .setTitle(titre)
          .setDescription(description)
          .setFooter({ text: footer })
          .setTimestamp();

        if (imageUrl) embed.setImage(imageUrl);

        await interaction.reply({ content: '✅ Embed créé !', ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
        return;
      }

      // ── Modal annonce ─────────────────────
      if (interaction.customId === 'modal_annonce') {
        const titre      = interaction.fields.getTextInputValue('ann_titre');
        const description = interaction.fields.getTextInputValue('ann_description');
        const ping       = interaction.fields.getTextInputValue('ann_ping') || '';

        const embed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle(`📢 ${titre}`)
          .setDescription(description)
          .setFooter({ text: `Annonce par ${interaction.user.tag} • ${config.footerText}` })
          .setTimestamp();

        const annChannel = await client.channels.fetch(config.channels.annonces);
        const content = ping ? `${ping}` : '';
        await annChannel.send({ content, embeds: [embed] });

        await interaction.reply({ content: '✅ Annonce publiée !', ephemeral: true });
        await sendLog(client, { action: 'Annonce publiée', user: interaction.user, details: titre, color: config.colors.info });
        return;
      }

      // ── Modal add-terrain ─────────────────
      if (interaction.customId === 'modal_add_terrain') {
        const nom       = interaction.fields.getTextInputValue('terrain_nom');
        const zone      = interaction.fields.getTextInputValue('terrain_zone');
        const activites = interaction.fields.getTextInputValue('terrain_activites');
        const controle  = interaction.fields.getTextInputValue('terrain_controle');

        const terrainPath = path.join(__dirname, '../data/terrains.json');
        const terrains = JSON.parse(fs.readFileSync(terrainPath, 'utf8'));
        terrains.push({ nom, zone, activites, controle, addedBy: interaction.user.tag, addedAt: new Date().toISOString() });
        fs.writeFileSync(terrainPath, JSON.stringify(terrains, null, 2));

        const terrainChannel = await client.channels.fetch(config.channels.territoire);
        const embed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle(`📍 Nouveau Territoire : ${nom}`)
          .addFields(
            { name: '🗺️ Zone', value: zone, inline: true },
            { name: '⚡ Activités', value: activites, inline: true },
            { name: '🏴 Contrôle', value: controle, inline: true },
          )
          .setFooter({ text: config.footerText })
          .setTimestamp();

        await terrainChannel.send({ embeds: [embed] });
        await interaction.reply({ content: `✅ Territoire **${nom}** ajouté !`, ephemeral: true });
        await sendLog(client, { action: 'Terrain ajouté', user: interaction.user, details: nom, color: config.colors.success });
        return;
      }

      // ── Modal add-business ────────────────
      if (interaction.customId === 'modal_add_business') {
        const nom       = interaction.fields.getTextInputValue('biz_nom');
        const type      = interaction.fields.getTextInputValue('biz_type');
        const adresse   = interaction.fields.getTextInputValue('biz_adresse');
        const infos     = interaction.fields.getTextInputValue('biz_infos');

        const bizPath = path.join(__dirname, '../data/businesses.json');
        const businesses = JSON.parse(fs.readFileSync(bizPath, 'utf8'));
        businesses.push({ nom, type, adresse, infos, addedBy: interaction.user.tag, addedAt: new Date().toISOString() });
        fs.writeFileSync(bizPath, JSON.stringify(businesses, null, 2));

        const bizChannel = await client.channels.fetch(config.channels.business);

        const embed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle(`💼 Business : ${nom}`)
          .addFields(
            { name: '🏷️ Type', value: type, inline: true },
            { name: '📍 Adresse', value: adresse, inline: true },
            { name: '📝 Infos', value: infos, inline: false },
            { name: '👤 Ajouté par', value: interaction.user.tag, inline: true },
          )
          .setFooter({ text: config.footerText })
          .setTimestamp();

        // Salon forum → nécessite un message comme premier post
        await bizChannel.threads.create({
          name: `💼 ${nom}`,
          autoArchiveDuration: 10080,
          message: { embeds: [embed] },
          reason: `Business créé par ${interaction.user.tag}`,
        });
        await interaction.reply({ content: `✅ Business **${nom}** créé avec fil de discussion !`, ephemeral: true });
        await sendLog(client, { action: 'Business ajouté', user: interaction.user, details: nom, color: config.colors.success });
        return;
      }
    }
  },
};
