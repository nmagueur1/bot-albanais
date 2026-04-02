# 🦅 Gjyshi – Bot Discord Famiglia Berisha

> Bot officiel de la Famiglia Berisha. Gestion complète du serveur : recrutement, opérations, annonces, modération et plus encore.

---

## 📋 Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- Un compte [Discord Developer](https://discord.com/developers/applications)
- Un compte [GitHub](https://github.com)
- Un compte [Railway](https://railway.app) (hébergement gratuit)

---

## 🚀 Installation locale (pour tester)

### 1. Clone le repository

```bash
git clone https://github.com/nmagueur1/bot-albanais.git
cd bot-albanais
```

### 2. Installe les dépendances

```bash
npm install
```

### 3. Configure les variables d'environnement

Copie le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Ouvre `.env` et remplis les valeurs :

```env
DISCORD_TOKEN=ton_token_ici
CLIENT_ID=1489073808991195310
GUILD_ID=id_de_ton_serveur_discord
```

**Où trouver le GUILD_ID ?**
Sur Discord, active le **mode développeur** (Paramètres → Avancé → Mode développeur), puis clique droit sur ton serveur → **Copier l'identifiant**.

### 4. Déploie les slash commands

Cette commande enregistre toutes les commandes `/` sur ton serveur :

```bash
npm run deploy
```

### 5. Lance le bot

```bash
npm start
```

ou en mode développement (rechargement automatique) :

```bash
npm run dev
```

---

## ☁️ Hébergement sur Railway

### Étape 1 – Push sur GitHub

```bash
git init
git remote add origin https://github.com/nmagueur1/bot-albanais.git
git add .
git commit -m "Initial commit – Gjyshi Bot"
git push -u origin main
```

### Étape 2 – Créer un projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi
2. Clique sur **New Project**
3. Sélectionne **Deploy from GitHub repo**
4. Choisis **nmagueur1/bot-albanais**
5. Railway détecte automatiquement le projet Node.js

### Étape 3 – Ajouter les variables d'environnement

Dans ton projet Railway :

1. Clique sur ton service → **Variables**
2. Ajoute les variables suivantes :

| Variable | Valeur |
|---|---|
| `DISCORD_TOKEN` | Ton token Discord |
| `CLIENT_ID` | `1489073808991195310` |
| `GUILD_ID` | L'ID de ton serveur Discord |

### Étape 4 – Déployer les slash commands

Avant le déploiement Railway, tu dois déployer les commandes **une fois en local** :

```bash
npm run deploy
```

> Les slash commands sont enregistrées côté Discord, pas sur Railway. Tu ne fais ça qu'une fois, ou à chaque ajout/modification de commande.

### Étape 5 – Le bot est en ligne !

Railway démarrera automatiquement le bot avec `node index.js`. Il redémarre automatiquement en cas de crash.

---

## 📁 Structure du projet

```
gjyshi-bot/
├── index.js               # Point d'entrée principal
├── deploy-commands.js     # Script de déploiement des slash commands
├── package.json
├── railway.json           # Config Railway
├── .env                   # Variables d'environnement (à ne pas committer)
├── .env.example           # Template des variables
├── .gitignore
│
├── commands/
│   ├── infos/
│   │   ├── reglement.js   # /reglement
│   │   ├── lore.js        # /lore
│   │   ├── organisation.js # /organisation
│   │   ├── embed.js       # /embed
│   │   └── role-react.js  # /role-react
│   ├── berisha/
│   │   └── annonce.js     # /annonce
│   ├── operations/
│   │   ├── terrain.js     # /terrain
│   │   ├── add-terrain.js # /add-terrain
│   │   ├── remove-terrain.js # /remove-terrain
│   │   ├── business.js    # /business
│   │   ├── add-business.js # /add-business
│   │   ├── remove-business.js # /remove-business
│   │   ├── radio.js       # /radio
│   │   └── dc.js          # /dc info & /dc delete
│   ├── staff/
│   │   ├── kick.js        # /kick
│   │   ├── ban.js         # /ban
│   │   └── mute.js        # /mute
│   └── recrutement/
│       ├── panel-rc.js    # /panel-rc
│       ├── rc-on.js       # /rc-on
│       └── rc-off.js      # /rc-off
│
├── events/
│   ├── ready.js           # Événement de démarrage
│   └── interactionCreate.js # Gestion de toutes les interactions
│
├── utils/
│   ├── config.js          # IDs salons, rôles, couleurs
│   ├── logger.js          # Système de logs automatiques
│   └── permissions.js     # Vérification des rôles
│
└── data/
    ├── terrains.json      # Stockage des territoires
    ├── businesses.json    # Stockage des businesses
    └── rc-status.json     # Statut du recrutement (ouvert/fermé)
```

---

## 🎮 Liste des commandes

### 📖 INFOS
| Commande | Description | Accès |
|---|---|---|
| `/reglement` | Poste le règlement dans 📜・règlement | Bot Access |
| `/lore` | Poste le lore dans 📖・lore | Bot Access |
| `/organisation` | Poste la hiérarchie dans 🧩・organisation | Bot Access |
| `/embed` | Crée un embed personnalisé (modal) | Bot Access |
| `/role-react` | Crée un système de role-react par bouton | Bot Access |

### 📢 BERISHA
| Commande | Description | Accès |
|---|---|---|
| `/annonce` | Poste une annonce dans 📢・annonces | Bot Access |

### ⚙️ OPÉRATIONS
| Commande | Description | Accès |
|---|---|---|
| `/terrain` | Liste les territoires | Bot Access |
| `/add-terrain` | Ajoute un territoire (modal) | Bot Access |
| `/remove-terrain <nom>` | Supprime un territoire | Bot Access |
| `/business` | Liste les businesses | Bot Access |
| `/add-business` | Crée un business + fil de discussion (modal) | Bot Access |
| `/remove-business <nom>` | Supprime un business | Bot Access |
| `/radio <numero>` | Publie la fréquence radio du soir | Bot Access |
| `/dc info <nom>` | Publie le nom du Dark Chat | Bot Access |
| `/dc delete <nom>` | Alerte de suppression du DC avec @Berisha | Bot Access |

### 🛡️ STAFF
| Commande | Description | Accès |
|---|---|---|
| `/kick <membre> [raison]` | Expulse un membre | Admin |
| `/ban <membre> [raison] [jours]` | Bannit un membre | Admin |
| `/mute <membre> <durée> [raison]` | Mute un membre | Admin |

### 📩 RECRUTEMENT
| Commande | Description | Accès |
|---|---|---|
| `/panel-rc` | Poste le panel de candidature | Bot Access |
| `/rc-on` | Ouvre les candidatures | Bot Access |
| `/rc-off` | Ferme les candidatures | Bot Access |

---

## 🔐 Permissions requises pour le bot

Dans le portail développeur Discord, active les **Privileged Gateway Intents** :
- ✅ Server Members Intent
- ✅ Message Content Intent

Pour les permissions du bot sur le serveur :
- `Send Messages`
- `Embed Links`
- `Manage Roles`
- `Kick Members`
- `Ban Members`
- `Moderate Members` (Timeout)
- `Read Message History`
- `View Channels`
- `Create Public Threads`

---

## 🔄 Mettre à jour le bot

Après chaque modification :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Railway redéploie automatiquement dès qu'un push est détecté sur la branche `main`.

Si tu as modifié des commandes (ajout, suppression, changement de nom ou d'options) :

```bash
npm run deploy
```

---

## 🦅 Famiglia Berisha • Gjith gjaku
