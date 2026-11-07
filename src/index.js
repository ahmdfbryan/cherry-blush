const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ChannelType,
  ActivityType,
} = require('discord.js');
const config = require('./config');
const ui = require('./ui');
const messenger = require('./messenger');

if (!config.token) {
  console.error('❌ DISCORD_TOKEN belum diisi di file .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  partials: [Partials.GuildMember, Partials.User],
});

const V2 = MessageFlags.IsComponentsV2;
const EPH = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral;

/* ───────────────────────── Slash commands ───────────────────────── */
const channelOpt = (o) =>
  o
    .setName('channel')
    .setDescription('Channel tujuan (default: channel ini)')
    .addChannelTypes(ChannelType.GuildText)
    .setRequired(false);

const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Kirim panel Cherry Blush')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((s) => s.setName('verifikasi').setDescription('Kirim panel verifikasi').addChannelOption(channelOpt))
    .addSubcommand((s) => s.setName('roles').setDescription('Kirim panel take role').addChannelOption(channelOpt)),
  new SlashCommandBuilder()
    .setName('test')
    .setDescription('Preview pesan welcome / goodbye')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((s) => s.setName('welcome').setDescription('Kirim contoh welcome ke channel welcome'))
    .addSubcommand((s) => s.setName('goodbye').setDescription('Kirim contoh goodbye ke channel goodbye')),
].map((c) => c.toJSON()).concat(messenger.commands);

/* ───────────────────────── Ready ───────────────────────── */
client.once(Events.ClientReady, async (c) => {
  console.log(`🌸 Login sebagai ${c.user.tag}`);
  c.user.setActivity('Cherry Blush 🌸', { type: ActivityType.Watching });

  try {
    const guild = await c.guilds.fetch(config.guildId);
    await guild.commands.set(commands);
    console.log(`✅ Slash command terdaftar di ${guild.name}`);
  } catch (err) {
    console.error('❌ Gagal daftar slash command (cek GUILD_ID & bot sudah di-invite):', err.message);
  }

  // Cek konfigurasi supaya ketahuan sejak awal
  if (!config.memberRoleId) console.warn('⚠️  MEMBER_ROLE_ID belum diisi — tombol verifikasi tidak akan berfungsi.');
  for (const r of config.takeRoles) if (!r.id) console.warn(`⚠️  Role "${r.label}" belum diisi di .env`);
});

/* ───────────────────────── Welcome / Goodbye ───────────────────────── */
async function sendTo(channelId, payload) {
  if (!channelId) return;
  try {
    const ch = await client.channels.fetch(channelId);
    if (ch?.isTextBased()) await ch.send(payload);
  } catch (err) {
    console.error(`❌ Gagal kirim ke channel ${channelId}:`, err.message);
  }
}

client.on(Events.GuildMemberAdd, async (member) => {
  if (member.guild.id !== config.guildId || member.user.bot) return;
  await sendTo(config.channels.welcome, {
    components: [ui.welcomeCard(member)],
    flags: V2,
    allowedMentions: { users: [member.id] },
  });
});

client.on(Events.GuildMemberRemove, async (member) => {
  if (member.guild.id !== config.guildId || member.user?.bot) return;
  if (member.partial) {
    try {
      await member.user.fetch();
    } catch {}
  }
  await sendTo(config.channels.goodbye, {
    components: [ui.goodbyeCard(member)],
    flags: V2,
    allowedMentions: { parse: [] },
  });
});

/* ───────────────────────── Interactions ───────────────────────── */
client.on(Events.InteractionCreate, async (i) => {
  try {
    if (i.isChatInputCommand()) {
      if (i.commandName === 'pesan') return await messenger.onCommand(i);
      return await onCommand(i);
    }
    if (i.isMessageContextMenuCommand()) return await messenger.onContext(i);
    if (i.isModalSubmit() && i.customId.startsWith('cb:msg:')) return await messenger.onModal(i);
    if (i.isButton() && i.customId.startsWith('cb:msg:')) return await messenger.onButton(i);
    if (i.isButton() && i.customId.startsWith('cb:')) return await onButton(i);
  } catch (err) {
    console.error('❌ Interaction error:', err);
    const msg = permissionHint(err);
    const payload = { components: [ui.notice('❌ Terjadi kesalahan', msg, config.colors.danger)], flags: EPH };
    try {
      if (i.deferred || i.replied) await i.followUp(payload);
      else await i.reply(payload);
    } catch {}
  }
});

function permissionHint(err) {
  if (err?.code === 50013)
    return 'Bot tidak punya izin untuk melakukan ini.\n• Untuk role: pastikan **role bot berada di atas** role yang diberikan & punya izin **Manage Roles**.\n• Untuk pesan: pastikan bot bisa **View Channel, Send Messages, Attach Files** di channel tersebut.';
  return 'Ada masalah saat memproses permintaanmu. Coba lagi sebentar lagi ya 🙏';
}

async function onCommand(i) {
  const group = i.commandName;
  const sub = i.options.getSubcommand();

  if (group === 'setup') {
    const target = i.options.getChannel('channel') || i.channel;
    const container = sub === 'verifikasi' ? ui.verifyPanel(i.guild) : ui.rolePanel(i.guild);
    await target.send({ components: [container], flags: V2, allowedMentions: { parse: [] } });
    return i.reply({
      components: [ui.notice('✅ Panel terkirim', `Panel **${sub}** sudah dikirim ke ${target}.`)],
      flags: EPH,
    });
  }

  if (group === 'test') {
    const member = i.member;
    if (sub === 'welcome') {
      await sendTo(config.channels.welcome, { components: [ui.welcomeCard(member)], flags: V2, allowedMentions: { parse: [] } });
    } else {
      await sendTo(config.channels.goodbye, { components: [ui.goodbyeCard(member)], flags: V2, allowedMentions: { parse: [] } });
    }
    return i.reply({ components: [ui.notice('✅ Preview terkirim', `Contoh pesan **${sub}** sudah dikirim.`)], flags: EPH });
  }
}

async function onButton(i) {
  const [, action, key] = i.customId.split(':');
  const member = await i.guild.members.fetch(i.user.id);

  /* ── Verifikasi ── */
  if (action === 'verify') {
    if (!config.memberRoleId)
      return i.reply({ components: [ui.notice('⚠️ Belum disetel', 'Role member belum diatur oleh admin.', config.colors.danger)], flags: EPH });

    if (member.roles.cache.has(config.memberRoleId))
      return i.reply({ components: [ui.notice('💗 Kamu sudah terverifikasi', 'Semua channel sudah terbuka untukmu, selamat bersenang-senang~')], flags: EPH });

    await member.roles.add(config.memberRoleId, 'Cherry Blush verification');
    return i.reply({
      components: [
        ui.notice(
          '🌸 Verifikasi berhasil!',
          `Yeay ${i.user}, kamu sekarang resmi jadi member **Cherry Blush** 💗\n` +
            `Semua channel sudah terbuka. Jangan lupa ambil role kamu di panel **Take Role** ya~`,
          config.colors.success,
        ),
      ],
      flags: EPH,
    });
  }

  if (action === 'verify-help') {
    return i.reply({
      components: [
        ui.notice(
          '❔ Bantuan Verifikasi',
          '1. Klik tombol **🌸 Verifikasi Sekarang**\n' +
            '2. Tunggu pesan "Verifikasi berhasil"\n' +
            '3. Channel lain akan muncul otomatis di sidebar\n\n' +
            '-# Masih belum muncul? Coba restart Discord, atau hubungi staff.',
        ),
      ],
      flags: EPH,
    });
  }

  /* ── Take Role ── */
  if (action === 'role') {
    const role = config.takeRoles.find((r) => r.key === key);
    if (!role?.id)
      return i.reply({ components: [ui.notice('⚠️ Belum disetel', 'Role ini belum diatur oleh admin.', config.colors.danger)], flags: EPH });

    if (config.memberRoleId && !member.roles.cache.has(config.memberRoleId))
      return i.reply({ components: [ui.notice('🔒 Verifikasi dulu ya', 'Kamu harus verifikasi terlebih dahulu sebelum mengambil role.', config.colors.danger)], flags: EPH });

    await i.deferReply({ flags: MessageFlags.Ephemeral });
    const changes = [];

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role.id, 'Cherry Blush take role');
      changes.push(`➖ Melepas ${role.emoji} <@&${role.id}>`);
    } else {
      // Role satu grup saling eksklusif (Boy / Girls)
      if (role.group) {
        for (const other of config.takeRoles) {
          if (other.group === role.group && other.key !== role.key && other.id && member.roles.cache.has(other.id)) {
            await member.roles.remove(other.id, 'Cherry Blush take role (ganti)');
            changes.push(`➖ Melepas ${other.emoji} <@&${other.id}>`);
          }
        }
      }
      await member.roles.add(role.id, 'Cherry Blush take role');
      changes.push(`➕ Mendapat ${role.emoji} <@&${role.id}>`);
    }

    const fresh = await i.guild.members.fetch({ user: i.user.id, force: true });
    return i.editReply({ components: [ui.roleResult(fresh, changes)], flags: V2 });
  }
}

process.on('unhandledRejection', (e) => console.error('UnhandledRejection:', e));
client.login(config.token);
