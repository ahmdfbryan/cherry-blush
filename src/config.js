require('dotenv').config();

const env = (key, fallback = '') => (process.env[key] || fallback).trim();

module.exports = {
  token: env('DISCORD_TOKEN'),
  guildId: env('GUILD_ID', '1568703967184027688'),

  channels: {
    welcome: env('WELCOME_CHANNEL_ID', '1568709095907922030'),
    goodbye: env('GOODBYE_CHANNEL_ID', '1568709095907922030'),
  },

  memberRoleId: env('MEMBER_ROLE_ID'),
  bannerUrl: env('BANNER_URL'),

  // Palet pink Cherry Blush
  colors: {
    primary: 0xff6fae, // cherry pink
    soft: 0xffb6d5, // blush
    deep: 0xe84393, // deep rose (goodbye)
    success: 0xff8cc6,
    danger: 0xff4d79,
  },

  /**
   * Daftar role untuk panel Take Role.
   * group: role dalam group yang sama saling eksklusif (pilih satu saja).
   * group null = bebas diambil/dilepas.
   */
  takeRoles: [
    {
      key: 'boy',
      id: env('ROLE_BOY_ID'),
      label: 'Boy',
      emoji: '💙',
      desc: 'Untuk member cowok',
      group: 'gender',
    },
    {
      key: 'girl',
      id: env('ROLE_GIRL_ID'),
      label: 'Girls',
      emoji: '🎀',
      desc: 'Untuk member cewek',
      group: 'gender',
    },
    {
      key: 'mole',
      id: env('ROLE_MOLE_ID'),
      label: 'Mole',
      emoji: '🐹',
      desc: 'Dapat notif & akses seputar Mole',
      group: null,
    },
    {
      key: 'fishit',
      id: env('ROLE_FISHIT_ID'),
      label: 'Fish It',
      emoji: '🎣',
      desc: 'Dapat notif & akses seputar Fish It',
      group: null,
    },
  ],
};
