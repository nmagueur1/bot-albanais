// ────────────────────────────────────────────
// Configuration centrale du bot Gjyshi
// ────────────────────────────────────────────

module.exports = {
  // ── Salons ────────────────────────────────
  channels: {
    reglement:    '1489061092394012682',
    lore:         '1489061223071879198',
    organisation: '1489061356425707593',
    recrutement:  '1489061765085139136',
    annonces:     '1489061966298218646',
    territoire:   '1489062591136530675',
    business:     '1489063394291089508',
    radio:        '1489069846590263446',
    logs:         '1489067973003051058',
    darkChat:     '1489079373288968213',
  },

  // ── Rôles ─────────────────────────────────
  roles: {
    accesBot: '1489072771198750720',  // Peut utiliser les commandes du bot
    berisha:  '1489061469416067283',  // Tous les membres de la famille
  },

  // ── Couleurs embed ────────────────────────
  colors: {
    primary:  0x8B0000, // Rouge sombre – couleur officielle Berisha
    success:  0x2ECC71,
    danger:   0xE74C3C,
    warning:  0xF39C12,
    info:     0x3498DB,
    dark:     0x2C2F33,
  },

  // ── Divers ────────────────────────────────
  footerText: 'Famiglia Berisha • Sistema',
  footerIcon: 'https://i.imgur.com/your-logo.png', // Remplace par l'icône réelle
};
