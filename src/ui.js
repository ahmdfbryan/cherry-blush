// Semua tampilan Components V2 Cherry Blush ada di sini.
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require('discord.js');
const config = require('./config');

const ts = (ms, style = 'R') => `<t:${Math.floor(ms / 1000)}:${style}>`;
const text = (content) => new TextDisplayBuilder().setContent(content);
const sep = (divider = true, big = false) =>
  new SeparatorBuilder()
    .setDivider(divider)
    .setSpacing(big ? SeparatorSpacingSize.Large : SeparatorSpacingSize.Small);

function avatarOf(user) {
  return user.displayAvatarURL({ extension: 'png', size: 512 });
}

function addBanner(container) {
  if (!config.bannerUrl) return;
  container.addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(config.bannerUrl)),
  );
}

/* ───────────────────────── WELCOME ───────────────────────── */
function welcomeCard(member) {
  const { user, guild } = member;
  return new ContainerBuilder()
    .setAccentColor(config.colors.primary)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`## 🌸 Welcome to ${guild.name}!`),
          text(
            `Hai ${user}, selamat datang di **Cherry Blush** 💗\n` +
              `Semoga betah dan nyaman ya di sini~\n\n` +
              `> 👤 **${user.username}**\n` +
              `> 🎀 Member ke-**${guild.memberCount}**`,
          ),
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarOf(user))),
    )
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(
      text(`-# 🍒 Jangan lupa verifikasi dulu ya · Bergabung ${ts(Date.now())}`),
    );
}

/* ───────────────────────── GOODBYE ───────────────────────── */
function goodbyeCard(member) {
  const { user, guild } = member;
  const joined = member.joinedTimestamp ? `Bergabung ${ts(member.joinedTimestamp)}` : 'Waktu bergabung tidak diketahui';
  return new ContainerBuilder()
    .setAccentColor(config.colors.deep)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`## 🥀 Goodbye, ${user.username}`),
          text(
            `**${user.username}** telah meninggalkan **${guild.name}** 💔\n` +
              `Terima kasih sudah pernah mampir, sampai jumpa lagi~\n\n` +
              `> 👥 Sisa member: **${guild.memberCount}**`,
          ),
        )
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarOf(user))),
    )
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(text(`-# 🍂 ${joined} · Keluar ${ts(Date.now())}`));
}

/* ─────────────────────── VERIFICATION ─────────────────────── */
function verifyPanel(guild) {
  const c = new ContainerBuilder().setAccentColor(config.colors.primary);
  addBanner(c);
  c.addTextDisplayComponents(
    text(`# 🌸 Cherry Blush Verification`),
    text(
      `Selamat datang di **${guild.name}**! 💗\n` +
        `Untuk menjaga server tetap aman dan nyaman, kamu perlu **verifikasi** terlebih dahulu sebelum bisa melihat channel lainnya.`,
    ),
  )
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(
      text(
        `### 📜 Sebelum verifikasi, pahami dulu:\n` +
          `🍒 Saling menghargai sesama member\n` +
          `🍒 Dilarang spam, toxic, SARA & konten NSFW\n` +
          `🍒 Dilarang promosi tanpa izin staff\n` +
          `🍒 Ikuti arahan staff & admin`,
      ),
    )
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(
      text(`### ✨ Cara verifikasi\nKlik tombol **Verifikasi** di bawah, dan semua channel akan langsung terbuka untukmu!`),
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('cb:verify')
          .setLabel('Verifikasi Sekarang')
          .setEmoji('🌸')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('cb:verify-help')
          .setLabel('Bantuan')
          .setEmoji('❔')
          .setStyle(ButtonStyle.Secondary),
      ),
    )
    .addSeparatorComponents(sep(false))
    .addTextDisplayComponents(text(`-# Dengan menekan tombol verifikasi, kamu setuju dengan peraturan Cherry Blush 💕`));
  return c;
}

function notice(title, body, color = config.colors.primary) {
  return new ContainerBuilder()
    .setAccentColor(color)
    .addTextDisplayComponents(text(`### ${title}`), text(body));
}

/* ───────────────────────── TAKE ROLE ───────────────────────── */
function rolePanel(guild) {
  const c = new ContainerBuilder().setAccentColor(config.colors.soft);
  addBanner(c);
  c.addTextDisplayComponents(
    text(`# 🎀 Cherry Blush Roles`),
    text(
      `Pilih role sesuai dirimu dan minatmu~ 💗\n` +
        `Klik tombol sekali untuk **ambil**, klik lagi untuk **lepas**.`,
    ),
  ).addSeparatorComponents(sep());

  c.addTextDisplayComponents(text(`### 💞 Gender\n-# Pilih salah satu saja`));
  for (const r of config.takeRoles.filter((x) => x.group === 'gender')) c.addSectionComponents(roleRow(r));

  c.addSeparatorComponents(sep());
  c.addTextDisplayComponents(text(`### 🎮 Game\n-# Boleh pilih lebih dari satu`));
  for (const r of config.takeRoles.filter((x) => x.group !== 'gender')) c.addSectionComponents(roleRow(r));

  c.addSeparatorComponents(sep(false)).addTextDisplayComponents(
    text(`-# 🌸 ${guild.name} · Role bisa diganti kapan saja`),
  );
  return c;
}

function roleRow(r) {
  return new SectionBuilder()
    .addTextDisplayComponents(text(`${r.emoji} **${r.label}**${r.id ? ` · <@&${r.id}>` : ''}\n-# ${r.desc}`))
    .setButtonAccessory(
      new ButtonBuilder()
        .setCustomId(`cb:role:${r.key}`)
        .setLabel(r.label)
        .setEmoji(r.emoji)
        .setStyle(ButtonStyle.Secondary),
    );
}

function roleResult(member, changes) {
  const owned = config.takeRoles.filter((r) => r.id && member.roles.cache.has(r.id));
  const list = owned.length ? owned.map((r) => `${r.emoji} <@&${r.id}>`).join('\n') : '-# Belum ada role yang dipilih';
  return new ContainerBuilder()
    .setAccentColor(config.colors.success)
    .addTextDisplayComponents(text(`### 🎀 Role diperbarui!`), text(changes.join('\n')))
    .addSeparatorComponents(sep())
    .addTextDisplayComponents(text(`**Role kamu sekarang:**\n${list}`));
}

module.exports = { welcomeCard, goodbyeCard, verifyPanel, rolePanel, roleResult, notice };
