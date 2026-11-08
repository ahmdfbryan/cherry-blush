require('dotenv').config();

const env = (key, fallback = '') => (process.env[key] || fallback).trim();

module.exports = {
  token: env('DISCORD_TOKEN'),
  guildId: env('GUILD_ID', '1568703967184027688'),

  channels: {
    welcome: env('WELCOME_CHANNEL_ID', '1568709095907922030'),
    goodbye: env('GOODBYE_CHANNEL_ID', '1568709095907922030'),
    boost: env('BOOST_CHANNEL_ID', '1568734390949781524'), // channel ucapan booster
  },

  memberRoleId: '1568717262620328168', // 🌸 Member
  bannerUrl: env('BANNER_URL'),

  // Emoji custom (diupload di bot / application emoji)
  emojis: {
    verification: '<:verification:1568844511336075315>',
    checklist: '<:checklist:1568844509746438225>',
  },

  // Palet pink Cherry Blush
  colors: {
    primary: 0xff6fae, // cherry pink
    soft: 0xffb6d5, // blush
    deep: 0xe84393, // deep rose (goodbye)
    success: 0xff8cc6,
    danger: 0xff4d79,
    boost: 0xf47fff, // pink-ungu khas booster
  },

  /**
   * Daftar role untuk panel Take Role.
   * group: role dalam group yang sama saling eksklusif (pilih satu saja).
   * group null = bebas diambil/dilepas.
   */
  takeRoles: [
    {
      key: 'boy',
      id: '1568719134349336658',
      label: 'Boy',
      emoji: '💙',
      desc: 'Untuk member cowok',
      group: 'gender',
    },
    {
      key: 'girl',
      id: '1568719323801850026',
      label: 'Girls',
      emoji: '🎀',
      desc: 'Untuk member cewek',
      group: 'gender',
    },
    {
      key: 'mlbb',
      id: '1568719493528817755',
      label: 'Mobile Legends',
      button: 'Mole', // teks di tombol (kalau tidak diisi, pakai label)
      emoji: '⚔️',
      desc: 'Untuk info mabar, push rank & info event',
      group: null,
    },
    {
      key: 'fishit',
      id: '1568719560113258526',
      label: 'Fish It',
      emoji: '🎣',
      desc: 'Dapat notif & akses seputar Fish It',
      group: null,
    },
  ],
};
