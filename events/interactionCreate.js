const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require('discord.js');
const { sendLog } = require('../utils/logger');
const { isAdmin, hasAccess, denyAccess } = require('../utils/permissions');
const config = require('../utils/config');
const fs = require('fs');
const path = require('path');

// ─── Chemins des données ───────────────────
const RC_PATH       = path.join(__dirname, '../data/rc-status.json');
const BLACKLIST_PATH = path.join(__dirname, '../data/rc-blacklist.json');

// ─── Sessions quiz (en mémoire) ────────────
const quizSessions = new Map();

// ─── Sessions candidature multi-pages ──────
// candidatureSessions.get(userId) = { quizScore, quizTotal, p1: {...}, p2: {...} }
const candidatureSessions = new Map();

// ─── Questions du quiz lore ────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    placeholder: 'Q1 – Quel est le symbole sacré de la Famiglia ?',
    correct: 'aigle',
    options: [
      { label: "🦅 L'Aigle à deux têtes",  value: 'aigle' },
      { label: '🐺 La Louve romaine',       value: 'louve' },
      { label: '🐍 Le Serpent noir',        value: 'serpent' },
      { label: '🦁 Le Lion de Shkodra',     value: 'lion' },
    ],
  },
  {
    id: 'q2',
    placeholder: 'Q2 – À quelle époque la Famiglia est-elle arrivée en ville ?',
    correct: 'annees90',
    options: [
      { label: '📅 Les années 90',       value: 'annees90' },
      { label: '📅 Les années 70',       value: 'annees70' },
      { label: '📅 Les années 2000',     value: 'annees2000' },
      { label: '📅 Les années 80',       value: 'annees80' },
    ],
  },
  {
    id: 'q3',
    placeholder: 'Q3 – Quel titre porte le Chef Suprême de la Famiglia ?',
    correct: 'kry',
    options: [
      { label: '👑 Kry',     value: 'kry' },
      { label: '🗡️ Kap',    value: 'kap' },
      { label: '🧠 Kësh',   value: 'kesh' },
      { label: '🤝 Nënkry', value: 'nenkry' },
    ],
  },
  {
    id: 'q4',
    placeholder: "Q4 – D'où viennent les origines des Berisha ?",
    correct: 'albanie',
    options: [
      { label: '🇦🇱 Albanie',           value: 'albanie' },
      { label: '🇽🇰 Kosovo',            value: 'kosovo' },
      { label: '🇲🇰 Macédoine du Nord', value: 'macedoine' },
      { label: '🇷🇸 Serbie',            value: 'serbie' },
    ],
  },
];

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
      // ── Bouton candidature → quiz lore ───────
      if (interaction.customId === 'open_candidature') {
        const rcStatus = JSON.parse(fs.readFileSync(RC_PATH, 'utf8'));
        if (!rcStatus.open) {
          return interaction.reply({
            content: '🔒 Les candidatures sont actuellement **fermées**. Reviens plus tard !',
            ephemeral: true,
          });
        }

        // Vérification blacklist
        const blacklist = JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf8'));
        if (blacklist.includes(interaction.user.id)) {
          return interaction.reply({
            content: '🚫 Ta candidature a déjà été **refusée définitivement**. Tu ne peux pas postuler à nouveau.',
            ephemeral: true,
          });
        }

        // Initialiser la session quiz pour cet utilisateur
        quizSessions.set(interaction.user.id, {});

        const quizEmbed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle('📚 Test de Connaissance – Famiglia Berisha')
          .setDescription(
            'Avant de soumettre ta candidature, réponds aux **4 questions** ci-dessous.\n\n' +
            'Elles nous permettent de vérifier que tu connais bien l\'histoire et les codes de la famille.\n\n' +
            '> ⚠️ Réponds à toutes les questions avant de cliquer sur **Valider**.'
          )
          .setFooter({ text: config.footerText });

        // Mélanger les options aléatoirement à chaque affichage
        const quizRows = QUIZ_QUESTIONS.map((q) => {
          const shuffled = [...q.options].sort(() => Math.random() - 0.5);
          return new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`quiz_${q.id}`)
              .setPlaceholder(q.placeholder)
              .addOptions(shuffled)
          );
        });

        const validateRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('quiz_validate')
            .setLabel('✅ Valider et continuer')
            .setStyle(ButtonStyle.Primary)
        );

        quizRows.push(validateRow);
        return interaction.reply({ embeds: [quizEmbed], components: quizRows, ephemeral: true });
      }

      // ── Bouton validation du quiz ─────────
      if (interaction.customId === 'quiz_validate') {
        const answers = quizSessions.get(interaction.user.id) || {};
        const answered = QUIZ_QUESTIONS.filter(q => answers[q.id] !== undefined).length;

        if (answered < QUIZ_QUESTIONS.length) {
          return interaction.reply({
            content: `⚠️ Tu n'as pas répondu à toutes les questions ! (**${answered}/${QUIZ_QUESTIONS.length}** répondues)`,
            ephemeral: true,
          });
        }

        // Calcul du score
        const score = QUIZ_QUESTIONS.filter(q => answers[q.id] === q.correct).length;
        const total = QUIZ_QUESTIONS.length;
        quizSessions.delete(interaction.user.id);

        // ── Refus automatique si score insuffisant ──
        if (score < config.minQuizScore) {
          // Ajout à la blacklist
          const blacklist = JSON.parse(fs.readFileSync(BLACKLIST_PATH, 'utf8'));
          if (!blacklist.includes(interaction.user.id)) {
            blacklist.push(interaction.user.id);
            fs.writeFileSync(BLACKLIST_PATH, JSON.stringify(blacklist, null, 2));
          }

          await sendLog(client, {
            action: 'Candidature refusée – Score lore insuffisant',
            user: interaction.user,
            details: `Score : ${score}/${total} (minimum requis : ${config.minQuizScore}/${total})`,
            color: config.colors.danger,
          });

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(config.colors.danger)
                .setTitle('❌ Candidature refusée')
                .setDescription(
                  `Tu as obtenu **${score}/${total}** au test de connaissance.\n\n` +
                  'Le score minimum requis pour rejoindre la **Famiglia Berisha** est de ' +
                  `**${config.minQuizScore}/${total}**.\n\n` +
                  '> Lis attentivement le lore de la famille avant de postuler.\n\n' +
                  '*Cette décision est définitive. Tu ne pourras pas soumettre de nouvelle candidature.*'
                )
                .setFooter({ text: config.footerText })
                .setTimestamp(),
            ],
            ephemeral: true,
          });
        }

        // Stocker le score du quiz et ouvrir la page 1 du formulaire
        candidatureSessions.set(interaction.user.id, { quizScore: score, quizTotal: total });

        const p1 = new ModalBuilder()
          .setCustomId('modal_rc_p1')
          .setTitle('📝 Candidature – Page 1/3');

        p1.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('pseudo_discord').setLabel('👤 Pseudo Discord').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('id_unique').setLabel('🆔 ID Unique').setPlaceholder('Ex : 123456789').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('naissance_hrp').setLabel('🎂 Date de naissance HRP').setPlaceholder('Ex : 01/01/2000').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('dispos_hrp').setLabel('🗓️ Disponibilités HRP').setPlaceholder('Ex : Lun-Ven 20h-00h, week-end variable').setStyle(TextInputStyle.Short).setRequired(true)
          ),
        );
        return interaction.showModal(p1);
      }

      // ── Ticket : prendre en charge ────────
      if (interaction.customId.startsWith('ticket_claim_')) {
        if (!interaction.member.roles.cache.has(config.roles.recruteur)) return denyAccess(interaction);

        const userId = interaction.customId.split('_')[2];
        const existingEmbed = interaction.message.embeds[0];

        const updatedEmbed = EmbedBuilder.from(existingEmbed)
          .addFields({ name: '🙋 Pris en charge par', value: `<@${interaction.user.id}>`, inline: true });

        await interaction.update({
          embeds: [updatedEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`ticket_claim_${userId}`)
                .setLabel(`✅ Pris en charge`)
                .setStyle(ButtonStyle.Success)
                .setDisabled(true),
              new ButtonBuilder()
                .setCustomId(`ticket_close_${userId}`)
                .setLabel('🔒 Fermer le ticket')
                .setStyle(ButtonStyle.Danger),
            ),
          ],
        });

        await sendLog(client, {
          action: 'Ticket pris en charge',
          user: interaction.user,
          details: `Salon : ${interaction.channel.name}`,
          color: config.colors.info,
        });
        return;
      }

      // ── Ticket : fermer ───────────────────
      if (interaction.customId.startsWith('ticket_close_')) {
        if (!interaction.member.roles.cache.has(config.roles.recruteur)) return denyAccess(interaction);

        await interaction.reply({ content: '🔒 Fermeture du ticket dans 5 secondes...' });

        await sendLog(client, {
          action: 'Ticket fermé',
          user: interaction.user,
          details: `Salon : ${interaction.channel.name}`,
          color: config.colors.warning,
        });

        setTimeout(() => interaction.channel.delete().catch(console.error), 5000);
        return;
      }

      // ── Bouton passage page 2 ────────────
      if (interaction.customId === 'rc_next_p2') {
        const p2 = new ModalBuilder()
          .setCustomId('modal_rc_p2')
          .setTitle('📝 Candidature – Page 2/3');

        p2.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('identite_rp').setLabel('🪪 Identité RP (Nom & Prénom)').setPlaceholder('Ex : Arben Berisha').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('naissance_rp').setLabel('🎂 Date de naissance RP').setPlaceholder('Ex : 15/06/1992').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('telephone').setLabel('📱 Numéro de téléphone RP').setPlaceholder('Ex : 555-1234').setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('legal').setLabel('💼 Fais-tu du légal ? (Si oui, quoi ?)').setPlaceholder('Ex : Non / Oui – Mécanicien').setStyle(TextInputStyle.Short).setRequired(true)
          ),
        );
        return interaction.showModal(p2);
      }

      // ── Bouton passage page 3 ────────────
      if (interaction.customId === 'rc_next_p3') {
        const p3 = new ModalBuilder()
          .setCustomId('modal_rc_p3')
          .setTitle('📝 Candidature – Page 3/3');

        p3.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('motivations').setLabel('✍️ Vos motivations (3 lignes min.)').setStyle(TextInputStyle.Paragraph).setMinLength(150).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('pourquoi_vous').setLabel('✍️ Pourquoi vous ? (2 lignes min.)').setStyle(TextInputStyle.Paragraph).setMinLength(100).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId('pourquoi_berisha').setLabel('✍️ Pourquoi la Famiglia ? (2 lignes min.)').setStyle(TextInputStyle.Paragraph).setMinLength(100).setRequired(true)
          ),
        );
        return interaction.showModal(p3);
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

          // ── Création du ticket si accepté ──
          if (accepted) {
            const ticketChannel = await interaction.guild.channels.create({
              name: `🎖️┃${targetUser.username}`,
              type: ChannelType.GuildText,
              parent: config.categories.recrutement,
              permissionOverwrites: [
                {
                  id: interaction.guild.id,
                  deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                  id: targetUser.id,
                  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                },
                {
                  id: config.roles.recruteur,
                  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
                },
              ],
            });

            const ticketEmbed = new EmbedBuilder()
              .setColor(config.colors.success)
              .setTitle('🎖️ Bienvenue dans la Famiglia Berisha')
              .setDescription(
                `Félicitations <@${targetUser.id}> !\n\n` +
                'Ta candidature a été **acceptée**. Un recruteur va prendre contact avec toi ici pour la suite du processus.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
                '▸ Reste disponible et patient\n' +
                '▸ Ne partage aucune information de ce salon\n' +
                '▸ Respecte les membres du staff\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
              )
              .setFooter({ text: config.footerText })
              .setTimestamp();

            const ticketButtons = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(`ticket_claim_${targetUser.id}`)
                .setLabel('🙋 Prendre en charge')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId(`ticket_close_${targetUser.id}`)
                .setLabel('🔒 Fermer le ticket')
                .setStyle(ButtonStyle.Danger),
            );

            await ticketChannel.send({
              content: `<@${targetUser.id}> <@&${config.roles.recruteur}>`,
              embeds: [ticketEmbed],
              components: [ticketButtons],
            });
          }

          // Log
          await sendLog(client, {
            action: `Candidature ${accepted ? 'ACCEPTÉE' : 'REFUSÉE'}`,
            user: interaction.user,
            target: targetUser,
            color: accepted ? config.colors.success : config.colors.danger,
          });
        } catch (err) {
          console.error('[RC Accept/Refuse]', err);
          await interaction.followUp({ content: '⚠️ Une erreur est survenue lors du traitement.', ephemeral: true });
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
    // 3. SELECT MENUS (quiz lore)
    // ═══════════════════════════════════════
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId.startsWith('quiz_q')) {
        const qId = interaction.customId.replace('quiz_', ''); // ex: 'q1'
        const session = quizSessions.get(interaction.user.id) || {};
        session[qId] = interaction.values[0];
        quizSessions.set(interaction.user.id, session);
        return interaction.deferUpdate();
      }
    }

    // ═══════════════════════════════════════
    // 4. MODALS
    // ═══════════════════════════════════════
    if (interaction.isModalSubmit()) {
      // ── Page 1/3 – Infos HRP ─────────────
      if (interaction.customId === 'modal_rc_p1') {
        const session = candidatureSessions.get(interaction.user.id);
        if (!session) return interaction.reply({ content: '❌ Session expirée. Recommence depuis le début.', ephemeral: true });

        session.p1 = {
          pseudoDiscord:  interaction.fields.getTextInputValue('pseudo_discord'),
          idUnique:       interaction.fields.getTextInputValue('id_unique'),
          naissanceHrp:   interaction.fields.getTextInputValue('naissance_hrp'),
          disposHrp:      interaction.fields.getTextInputValue('dispos_hrp'),
        };
        candidatureSessions.set(interaction.user.id, session);

        // Discord ne permet pas d'ouvrir un modal depuis un modal → bouton intermédiaire
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.primary)
              .setTitle('✅ Page 1/3 complète')
              .setDescription('Clique sur le bouton ci-dessous pour passer à la **page 2/3**.')
              .setFooter({ text: config.footerText }),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('rc_next_p2').setLabel('➡️ Continuer – Page 2/3').setStyle(ButtonStyle.Primary)
            ),
          ],
          ephemeral: true,
        });
      }

      // ── Page 2/3 – Infos RP ──────────────
      if (interaction.customId === 'modal_rc_p2') {
        const session = candidatureSessions.get(interaction.user.id);
        if (!session) return interaction.reply({ content: '❌ Session expirée. Recommence depuis le début.', ephemeral: true });

        session.p2 = {
          identiteRp:   interaction.fields.getTextInputValue('identite_rp'),
          naissanceRp:  interaction.fields.getTextInputValue('naissance_rp'),
          telephone:    interaction.fields.getTextInputValue('telephone'),
          legal:        interaction.fields.getTextInputValue('legal'),
        };
        candidatureSessions.set(interaction.user.id, session);

        // Bouton intermédiaire vers page 3
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(config.colors.primary)
              .setTitle('✅ Page 2/3 complète')
              .setDescription('Clique sur le bouton ci-dessous pour passer à la **page 3/3**.')
              .setFooter({ text: config.footerText }),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId('rc_next_p3').setLabel('➡️ Continuer – Page 3/3').setStyle(ButtonStyle.Primary)
            ),
          ],
          ephemeral: true,
        });
      }

      // ── Page 3/3 – Motivations → envoi ───
      if (interaction.customId === 'modal_rc_p3') {
        const session = candidatureSessions.get(interaction.user.id);
        if (!session) return interaction.reply({ content: '❌ Session expirée. Recommence depuis le début.', ephemeral: true });

        const { quizScore, quizTotal, p1, p2 } = session;
        const scoreLabel = `${quizScore}/${quizTotal}`;
        const scoreEmoji = quizScore === quizTotal ? '🏆' : quizScore >= quizTotal / 2 ? '✅' : '⚠️';

        const motivations      = interaction.fields.getTextInputValue('motivations');
        const pourquoiVous     = interaction.fields.getTextInputValue('pourquoi_vous');
        const pourquoiBerisha  = interaction.fields.getTextInputValue('pourquoi_berisha');

        candidatureSessions.delete(interaction.user.id);

        const rcChannel = await client.channels.fetch(config.channels.candidatures);
        if (!rcChannel) return interaction.reply({ content: '❌ Salon de candidatures introuvable.', ephemeral: true });

        const candidatureEmbed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle('📋 Nouvelle Candidature')
          .setDescription(`Candidature soumise par <@${interaction.user.id}>`)
          .addFields(
            // ── Page 1
            { name: '👤 Pseudo Discord',             value: p1.pseudoDiscord,  inline: true },
            { name: '🆔 ID Unique',                  value: p1.idUnique,       inline: true },
            { name: `${scoreEmoji} Lore`,             value: `**${scoreLabel}**`, inline: true },
            { name: '🎂 Naissance HRP',               value: p1.naissanceHrp,   inline: true },
            { name: '🗓️ Disponibilités HRP',          value: p1.disposHrp,      inline: true },
            { name: '\u200b',                          value: '\u200b',           inline: true },
            // ── Page 2
            { name: '🪪 Identité RP',                 value: p2.identiteRp,     inline: true },
            { name: '🎂 Naissance RP',                value: p2.naissanceRp,    inline: true },
            { name: '📱 Téléphone RP',                value: p2.telephone,      inline: true },
            { name: '💼 Légal',                        value: p2.legal,          inline: false },
            // ── Page 3
            { name: '✍️ Motivations',                 value: motivations,       inline: false },
            { name: '✍️ Pourquoi vous ?',             value: pourquoiVous,      inline: false },
            { name: '✍️ Pourquoi la Famiglia ?',      value: pourquoiBerisha,   inline: false },
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

        await interaction.reply({
          content: '📩 Ta candidature a bien été envoyée ! Tu recevras une réponse en DM prochainement.',
          ephemeral: true,
        });

        await sendLog(client, {
          action: 'Nouvelle candidature reçue',
          user: interaction.user,
          details: `${p1.pseudoDiscord} • Lore : ${scoreLabel}`,
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
