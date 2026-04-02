const config = require('./config');

/**
 * Vérifie si le membre a accès aux commandes du bot
 * (rôle 🤖・Accès Bot requis)
 */
function hasAccess(member) {
  return member.roles.cache.has(config.roles.accesBot);
}

/**
 * Vérifie si le membre est admin (Kry/Nënkry/Kësh/Kap)
 * → On utilise les permissions Discord natives (Administrator ou ManageGuild)
 */
function isAdmin(member) {
  return (
    member.permissions.has('Administrator') ||
    member.permissions.has('ManageGuild') ||
    member.roles.cache.has(config.roles.accesBot)
  );
}

/**
 * Réponse rapide si accès refusé
 */
async function denyAccess(interaction, message = '🚫 Tu n\'as pas la permission d\'utiliser cette commande.') {
  return interaction.reply({ content: message, ephemeral: true });
}

module.exports = { hasAccess, isAdmin, denyAccess };
