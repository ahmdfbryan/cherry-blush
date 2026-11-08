// Panel otomatis: menyimpan lokasi panel (verifikasi / take role) dan
// meng-update pesannya setiap bot menyala kalau tampilannya berubah.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { AttachmentBuilder, MessageFlags } = require('discord.js');
const ui = require('./ui');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE = path.join(DATA_DIR, 'panels.json');
const BANNER_DIR = path.join(__dirname, '..', 'assets', 'banners');

const TYPES = {
  verifikasi: { banner: 'verification.png', build: ui.verifyPanel },
  roles: { banner: 'roles.png', build: ui.rolePanel },
};

/* ── Penyimpanan JSON sederhana ── */
function load() {
  try {
    return JSON.parse(fs.readFileSync(STORE, 'utf8'));
  } catch {
    return {};
  }
}
function save(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${STORE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, STORE);
}

/* ── Susun isi panel + sidik jari (hash) tampilannya ── */
function build(type, guild) {
  const def = TYPES[type];
  const bannerPath = path.join(BANNER_DIR, def.banner);
  const banner = fs.existsSync(bannerPath) ? fs.statSync(bannerPath) : null;
  const container = def.build(guild, banner ? def.banner : null);

  const hash = crypto
    .createHash('sha1')
    .update(JSON.stringify(container.toJSON()))
    .update(banner ? `${banner.size}:${banner.mtimeMs}` : 'no-banner')
    .digest('hex');

  return {
    hash,
    payload: {
      components: [container],
      flags: MessageFlags.IsComponentsV2,
      files: banner ? [new AttachmentBuilder(bannerPath, { name: def.banner })] : [],
      allowedMentions: { parse: [] },
    },
  };
}

/* ── Kirim panel baru (panel lama dengan tipe sama otomatis dihapus) ── */
async function send(type, channel) {
  const data = load();
  const old = data[type];
  const { hash, payload } = build(type, channel.guild);
  const msg = await channel.send(payload);

  if (old && old.messageId !== msg.id) {
    try {
      const oldCh = await channel.guild.channels.fetch(old.channelId);
      const oldMsg = await oldCh.messages.fetch(old.messageId);
      await oldMsg.delete();
    } catch {}
  }

  data[type] = { channelId: msg.channelId, messageId: msg.id, hash };
  save(data);
  return msg;
}

/* ── Update semua panel yang tersimpan kalau ada perubahan ── */
async function sync(guild, { force = false } = {}) {
  const data = load();
  const result = [];

  for (const type of Object.keys(TYPES)) {
    const rec = data[type];
    if (!rec) continue;
    const { hash, payload } = build(type, guild);
    if (!force && rec.hash === hash) {
      result.push(`${type}: sudah terbaru`);
      continue;
    }
    try {
      const ch = await guild.channels.fetch(rec.channelId);
      const msg = await ch.messages.fetch(rec.messageId);
      // attachments: [] = ganti lampiran lama dengan banner terbaru
      await msg.edit({ ...payload, attachments: [] });
      rec.hash = hash;
      result.push(`${type}: diperbarui`);
    } catch (err) {
      if (err.code === 10008 || err.code === 10003) {
        delete data[type]; // pesan / channel sudah dihapus
        result.push(`${type}: pesan sudah tidak ada (kirim ulang dengan /setup ${type})`);
      } else {
        result.push(`${type}: gagal (${err.message})`);
      }
    }
  }

  save(data);
  return result;
}

module.exports = { send, sync };
