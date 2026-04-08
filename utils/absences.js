// ────────────────────────────────────────────
// Utilitaires – Gestion des absences
// ────────────────────────────────────────────

const { EmbedBuilder } = require('discord.js');
const config = require('./config');
const fs   = require('fs');
const path = require('path');

const ABSENCES_PATH = path.join(__dirname, '../data/absences.json');

// ── Lecture / écriture ─────────────────────
function getAbsencesData() {
  return JSON.parse(fs.readFileSync(ABSENCES_PATH, 'utf8'));
}

function saveAbsencesData(data) {
  fs.writeFileSync(ABSENCES_PATH, JSON.stringify(data, null, 2));
}

// ── Construction de l'embed panel ──────────
function buildPanelEmbed(absences) {
  const embed = new EmbedBuilder()
    .setColor(config.colors.warning)
    .setTitle('📋 Panel des Absences – Staff')
    .setFooter({ text: config.footerText })
    .setTimestamp();

  if (!absences || absences.length === 0) {
    embed.setDescription('✅ Aucune absence déclarée pour le moment.');
  } else {
    const lines = absences.map((a, i) =>
      `**${i + 1}.** ${a.prenom} ${a.nom} • <@${a.discordId}>\n` +
      `╰ 🛫 Départ : \`${a.depart}\` → 🛬 Retour : \`${a.retour}\`\n` +
      `╰ 📅 Déclaré le : \`${a.declaredAt}\` par <@${a.declaredBy}>`
    );
    embed.setDescription(lines.join('\n\n'));
  }

  return embed;
}

// ── Mise à jour automatique du panel ───────
async function updatePanel(client, data) {
  if (!data.panelMessageId || !data.panelChannelId) return;

  try {
    const panelChannel = await client.channels.fetch(data.panelChannelId);
    const panelMsg     = await panelChannel.messages.fetch(data.panelMessageId);
    const embed        = buildPanelEmbed(data.absences);
    await panelMsg.edit({ embeds: [embed] });
  } catch (err) {
    console.error('[Panel absence – update]', err);
    // Le message a peut-être été supprimé → on réinitialise les refs
    data.panelMessageId = null;
    data.panelChannelId = null;
    saveAbsencesData(data);
  }
}

module.exports = {
  ABSENCES_PATH,
  getAbsencesData,
  saveAbsencesData,
  buildPanelEmbed,
  updatePanel,
};
