// Fitur Pesan Bot: kirim, edit, hapus, dan balas pesan atas nama bot.
const {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  LabelBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelSelectMenuBuilder,
  FileUploadBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require('discord.js');
const config = require('./config');
const { notice } = require('./ui');

const V2 = MessageFlags.IsComponentsV2;
const EPH = MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral;
const MENTIONS = { parse: ['users', 'roles', 'everyone'] };

// ID komponen di dalam card, dipakai untuk membaca ulang isi card saat diedit
const ID = { title: 101, body: 102, image: 103, footer: 104 };

/* ───────────────────────── Commands ───────────────────────── */
const linkOpt = (o) => o.setName('link').setDescription('Link pesan (klik kanan pesan → Copy Message Link) atau ID pesan').setRequired(true);

const commands = [
  new SlashCommandBuilder()
    .setName('pesan')
    .setDescription('Kirim / edit / hapus / balas pesan sebagai bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((s) => s.setName('kirim').setDescription('Kirim pesan baru sebagai bot'))
    .addSubcommand((s) => s.setName('edit').setDescription('Edit pesan yang dikirim bot').addStringOption(linkOpt))
    .addSubcommand((s) => s.setName('hapus').setDescription('Hapus pesan yang dikirim bot').addStringOption(linkOpt))
    .addSubcommand((s) => s.setName('balas').setDescription('Balas (reply) sebuah pesan sebagai bot').addStringOption(linkOpt)),
  ...['Edit Pesan Bot', 'Hapus Pesan Bot', 'Balas sebagai Bot'].map((name) =>
    new ContextMenuCommandBuilder()
      .setName(name)
      .setType(ApplicationCommandType.Message)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
      .setDMPermission(false),
  ),
].map((c) => c.toJSON());

/* ───────────────────────── Data sementara modal ───────────────────────── */
const pending = new Map(); // nonce -> { mode, channelId, messageId, oldImage }
function remember(data) {
  const nonce = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  pending.set(nonce, data);
  setTimeout(() => pending.delete(nonce), 15 * 60 * 1000);
  return nonce;
}

/* ───────────────────────── Builder card ───────────────────────── */
function buildCard({ title, body, image }) {
  const c = new ContainerBuilder().setAccentColor(config.colors.primary);
  if (title) {
    c.addTextDisplayComponents(new TextDisplayBuilder().setId(ID.title).setContent(`## ${title}`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  }
  c.addTextDisplayComponents(new TextDisplayBuilder().setId(ID.body).setContent(body));
  if (image) {
    c.addMediaGalleryComponents(
      new MediaGalleryBuilder().setId(ID.image).addItems(new MediaGalleryItemBuilder().setURL(image)),
    );
  }
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setId(ID.footer).setContent('-# 🌸 Cherry Blush'));
  return c;
}

function readCard(message) {
  const out = { title: '', body: '', image: '', isCard: false };
  const walk = (arr) => {
    for (const c of arr) {
      if (c.id === ID.title) out.title = (c.content || '').replace(/^## /, '');
      if (c.id === ID.body) {
        out.body = c.content || '';
        out.isCard = true;
      }
      if (c.id === ID.image) out.image = c.items?.[0]?.media?.url || '';
      if (c.components) walk(c.components);
    }
  };
  walk(message.components.map((c) => c.toJSON()));
  return out;
}

const isV2 = (m) => m.flags.has(MessageFlags.IsComponentsV2);
const fileName = (att) => (att.name || 'gambar.png').replace(/[^\w.-]/g, '_');

/* ───────────────────────── Modal ───────────────────────── */
function textInput(id, style, { required = false, value = '', max = 4000, placeholder } = {}) {
  const t = new TextInputBuilder().setCustomId(id).setStyle(style).setRequired(required).setMaxLength(max);
  if (value) t.setValue(value.slice(0, max));
  if (placeholder) t.setPlaceholder(placeholder);
  return t;
}

function styleSelect() {
  return new StringSelectMenuBuilder()
    .setCustomId('gaya')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Card Pink').setValue('card').setEmoji('🌸').setDescription('Pesan dalam kotak pink + judul + gambar').setDefault(true),
      new StringSelectMenuOptionBuilder().setLabel('Teks Biasa').setValue('teks').setEmoji('💬').setDescription('Pesan teks polos seperti chat biasa'),
    );
}

function composeModal(nonce, { title, withChannel, channelId, withStyle, prefill = {}, editMode }) {
  const m = new ModalBuilder().setCustomId(`cb:msg:m:${nonce}`).setTitle(title);
  const labels = [];

  if (withChannel) {
    const sel = new ChannelSelectMenuBuilder()
      .setCustomId('channel')
      .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      .setMinValues(1)
      .setMaxValues(1);
    if (channelId) sel.setDefaultChannels(channelId);
    labels.push(new LabelBuilder().setLabel('Channel tujuan').setChannelSelectMenuComponent(sel));
  }
  if (withStyle) labels.push(new LabelBuilder().setLabel('Gaya pesan').setStringSelectMenuComponent(styleSelect()));

  if (editMode !== 'teks') {
    labels.push(
      new LabelBuilder()
        .setLabel('Judul')
        .setDescription('Opsional · hanya tampil di gaya Card')
        .setTextInputComponent(textInput('judul', TextInputStyle.Short, { max: 200, value: prefill.title, placeholder: 'Contoh: 📢 Pengumuman' })),
    );
  }

  labels.push(
    new LabelBuilder()
      .setLabel('Isi pesan')
      .setDescription('Mendukung markdown, emoji, mention @user / @role / @everyone')
      .setTextInputComponent(
        textInput('isi', TextInputStyle.Paragraph, {
          required: true,
          value: prefill.body,
          max: editMode === 'teks' ? 2000 : 3500,
          placeholder: 'Tulis pesannya di sini...',
        }),
      ),
  );

  if (editMode !== 'teks') {
    labels.push(
      new LabelBuilder()
        .setLabel(editMode === 'card' ? 'Ganti gambar' : 'Gambar')
        .setDescription(editMode === 'card' ? 'Opsional · kosongkan untuk tetap pakai gambar lama' : 'Opsional')
        .setFileUploadComponent(new FileUploadBuilder().setCustomId('gambar').setRequired(false).setMaxValues(1)),
    );
  }

  if (editMode === 'card' && prefill.image) {
    labels.push(
      new LabelBuilder().setLabel('Gambar lama').setStringSelectMenuComponent(
        new StringSelectMenuBuilder()
          .setCustomId('gambar_lama')
          .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('Pertahankan').setValue('keep').setEmoji('🖼️').setDefault(true),
            new StringSelectMenuOptionBuilder().setLabel('Hapus gambar').setValue('remove').setEmoji('🗑️'),
          ),
      ),
    );
  }

  return m.addLabelComponents(...labels);
}

/* ───────────────────────── Ambil pesan dari link / ID ───────────────────────── */
async function resolveMessage(i, input) {
  const link = input.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
  let channelId = i.channelId;
  let messageId = input.trim();
  if (link) {
    if (link[1] !== i.guildId) throw userError('Link pesan itu dari server lain.');
    channelId = link[2];
    messageId = link[3];
  }
  if (!/^\d{17,20}$/.test(messageId)) throw userError('Link / ID pesan tidak valid.\nKlik kanan pesan → **Copy Message Link**.');
  const channel = await i.guild.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) throw userError('Channel pesan tidak ditemukan.');
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (!message) throw userError('Pesan tidak ditemukan. Kalau pakai ID saja, jalankan command di channel yang sama dengan pesannya.');
  return message;
}

function userError(msg) {
  const e = new Error(msg);
  e.userFacing = true;
  return e;
}

/* ───────────────────────── Aksi ───────────────────────── */
async function openSend(i) {
  const nonce = remember({ mode: 'send' });
  return i.showModal(composeModal(nonce, { title: '🌸 Kirim Pesan Bot', withChannel: true, channelId: i.channelId, withStyle: true }));
}

async function openReply(i, message) {
  const nonce = remember({ mode: 'reply', channelId: message.channelId, messageId: message.id });
  return i.showModal(composeModal(nonce, { title: '💬 Balas sebagai Bot', withStyle: true }));
}

async function openEdit(i, message) {
  if (message.author.id !== i.client.user.id)
    throw userError('Hanya pesan yang dikirim **bot ini** yang bisa diedit.');

  if (isV2(message)) {
    const card = readCard(message);
    if (!card.isCard) throw userError('Pesan ini adalah panel sistem (verifikasi / take role / welcome), tidak bisa diedit dari sini.');
    const nonce = remember({ mode: 'edit', style: 'card', channelId: message.channelId, messageId: message.id, oldImage: card.image });
    return i.showModal(composeModal(nonce, { title: '✏️ Edit Pesan Bot', prefill: card, editMode: 'card' }));
  }

  const nonce = remember({ mode: 'edit', style: 'teks', channelId: message.channelId, messageId: message.id });
  return i.showModal(composeModal(nonce, { title: '✏️ Edit Pesan Bot', prefill: { body: message.content }, editMode: 'teks' }));
}

async function askDelete(i, message) {
  if (message.author.id !== i.client.user.id) throw userError('Hanya pesan yang dikirim **bot ini** yang bisa dihapus.');
  const preview = isV2(message) ? readCard(message).body || '(panel)' : message.content || '(tanpa teks)';
  const c = new ContainerBuilder()
    .setAccentColor(config.colors.danger)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('### 🗑️ Hapus pesan ini?'),
      new TextDisplayBuilder().setContent(`> ${preview.slice(0, 300).replace(/\n/g, '\n> ')}${preview.length > 300 ? '…' : ''}\n\n${message.url}`),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`cb:msg:del:${message.channelId}:${message.id}`).setLabel('Ya, hapus').setEmoji('🗑️').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cb:msg:cancel').setLabel('Batal').setStyle(ButtonStyle.Secondary),
      ),
    );
  return i.reply({ components: [c], flags: EPH });
}

/* ───────────────────────── Handlers (dipanggil dari index.js) ───────────────────────── */
async function guard(i, fn) {
  try {
    await fn();
  } catch (err) {
    if (!err.userFacing) throw err; // error lain ditangani index.js
    const payload = { components: [notice('⚠️ Tidak bisa diproses', err.message, config.colors.danger)], flags: EPH };
    if (i.deferred || i.replied) await i.followUp(payload);
    else await i.reply(payload);
  }
}

async function onCommand(i) {
  return guard(i, async () => {
    const sub = i.options.getSubcommand();
    if (sub === 'kirim') return openSend(i);
    const message = await resolveMessage(i, i.options.getString('link'));
    if (sub === 'edit') return openEdit(i, message);
    if (sub === 'hapus') return askDelete(i, message);
    if (sub === 'balas') return openReply(i, message);
  });
}

async function onContext(i) {
  return guard(i, async () => {
    const message = i.targetMessage;
    if (i.commandName === 'Edit Pesan Bot') return openEdit(i, message);
    if (i.commandName === 'Hapus Pesan Bot') return askDelete(i, message);
    if (i.commandName === 'Balas sebagai Bot') return openReply(i, message);
  });
}

async function onButton(i) {
  return guard(i, async () => {
    const [, , action, channelId, messageId] = i.customId.split(':');
    if (action === 'cancel') {
      return i.update({ components: [notice('↩️ Dibatalkan', 'Pesan tidak jadi dihapus.')], flags: V2 });
    }
    if (action === 'del') {
      const channel = await i.guild.channels.fetch(channelId).catch(() => null);
      const message = await channel?.messages.fetch(messageId).catch(() => null);
      if (!message) return i.update({ components: [notice('⚠️ Tidak ditemukan', 'Pesan sudah dihapus sebelumnya.', config.colors.danger)], flags: V2 });
      await message.delete();
      return i.update({ components: [notice('🗑️ Terhapus', 'Pesan berhasil dihapus.', config.colors.success)], flags: V2 });
    }
  });
}

async function onModal(i) {
  return guard(i, async () => {
    const nonce = i.customId.split(':')[3];
    const data = pending.get(nonce);
    if (!data) throw userError('Form sudah kedaluwarsa (lebih dari 15 menit atau bot sempat restart). Silakan ulangi.');
    pending.delete(nonce);

    await i.deferReply({ flags: MessageFlags.Ephemeral });

    const get = (id) => {
      try {
        return i.fields.getTextInputValue(id)?.trim() || '';
      } catch {
        return '';
      }
    };
    const title = get('judul');
    const body = get('isi');
    let upload = null;
    try {
      upload = i.fields.getUploadedFiles('gambar')?.first() || null;
    } catch {}
    if (upload && !(upload.contentType || '').startsWith('image/')) throw userError('File yang diupload harus berupa gambar (png / jpg / gif / webp).');

    let style = data.style || 'card';
    try {
      style = i.fields.getStringSelectValues('gaya')[0] || style;
    } catch {}

    // File diupload ulang oleh bot supaya link gambarnya permanen
    const files = upload ? [{ attachment: upload.url, name: fileName(upload) }] : [];

    /* ── Kirim / Balas ── */
    if (data.mode === 'send' || data.mode === 'reply') {
      let payload;
      if (style === 'teks') {
        if (body.length > 2000) throw userError(`Gaya **Teks Biasa** maksimal 2000 karakter (sekarang ${body.length}). Pakai gaya **Card Pink** untuk pesan panjang.`);
        payload = { content: body, files, allowedMentions: MENTIONS };
      } else {
        const card = buildCard({ title, body, image: upload ? `attachment://${fileName(upload)}` : '' });
        payload = { components: [card], flags: V2, files, allowedMentions: MENTIONS };
      }

      let sent;
      if (data.mode === 'send') {
        const channel = i.fields.getSelectedChannels('channel')?.first();
        const target = channel && (await i.guild.channels.fetch(channel.id));
        if (!target?.isTextBased()) throw userError('Channel tujuan tidak valid.');
        sent = await target.send(payload);
      } else {
        const channel = await i.guild.channels.fetch(data.channelId);
        const original = await channel.messages.fetch(data.messageId).catch(() => null);
        if (!original) throw userError('Pesan yang mau dibalas sudah tidak ada.');
        sent = await original.reply(payload);
      }
      return i.editReply({
        components: [notice(data.mode === 'send' ? '✅ Pesan terkirim' : '✅ Balasan terkirim', `${sent.url}`, config.colors.success)],
        flags: V2,
      });
    }

    /* ── Edit ── */
    if (data.mode === 'edit') {
      const channel = await i.guild.channels.fetch(data.channelId);
      const message = await channel.messages.fetch(data.messageId).catch(() => null);
      if (!message) throw userError('Pesan yang mau diedit sudah tidak ada.');

      if (data.style === 'teks') {
        await message.edit({ content: body, allowedMentions: MENTIONS });
      } else {
        let keepOld = true;
        try {
          keepOld = i.fields.getStringSelectValues('gambar_lama')[0] !== 'remove';
        } catch {}

        let image = '';
        let editFiles = { attachments: [] }; // default: buang lampiran lama
        if (upload) {
          image = `attachment://${fileName(upload)}`;
          editFiles = { attachments: [], files };
        } else if (data.oldImage && keepOld) {
          const base = data.oldImage.split('?')[0];
          const att = message.attachments.find((a) => a.url.split('?')[0] === base);
          if (att) {
            image = `attachment://${att.name}`;
            editFiles = {}; // biarkan lampiran lama tetap ada
          } else {
            image = data.oldImage; // gambar dari link luar
          }
        }

        await message.edit({ components: [buildCard({ title, body, image })], flags: V2, allowedMentions: MENTIONS, ...editFiles });
      }
      return i.editReply({ components: [notice('✏️ Pesan diperbarui', message.url, config.colors.success)], flags: V2 });
    }
  });
}

module.exports = { commands, onCommand, onContext, onButton, onModal };
