# 🌸 Cherry Blush Bot

Bot Discord untuk server **Cherry Blush** — Components V2, tema pink.

| Fitur | Keterangan |
|---|---|
| Welcome / Goodbye | Kartu teks di kiri + foto profil member di kanan, otomatis saat member masuk/keluar |
| Verifikasi | Panel + tombol 🌸 Verifikasi → member dapat role Member → channel lain terbuka |
| Take Role | Boy · Girls (pilih salah satu) · Mole · Fish It (bebas), klik lagi untuk lepas |

---

## 1. Buat bot di Discord Developer Portal

1. Buka https://discord.com/developers/applications → **New Application** → beri nama `Cherry Blush`.
2. Menu **Bot** → **Reset Token** → salin token (isi ke `.env`).
3. Masih di menu **Bot**, nyalakan **SERVER MEMBERS INTENT** ✅ (wajib, kalau tidak welcome/goodbye tidak jalan).
4. Menu **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Manage Roles`, `View Channels`, `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`
5. Buka link yang muncul → invite ke server Cherry Blush.

## 2. Buat role di server

Server Settings → **Roles** → buat role:

- `🌸 Member` ← role hasil verifikasi
- `Boy`, `Girls`, `Mole`, `Fish It`

> ⚠️ **PENTING — urutan role:** seret role **bot (Cherry Blush)** ke **atas** semua role di atas.
> Bot hanya bisa memberi role yang posisinya **di bawah** role bot. Kalau tidak, muncul error "bot tidak punya izin".

Salin ID tiap role (aktifkan *Developer Mode* di User Settings → Advanced, lalu klik kanan role → **Copy Role ID**).

## 3. Atur akses channel (inti sistem verifikasi)

Tujuannya: member baru (belum punya role apa pun) **hanya bisa lihat channel verifikasi**. Setelah klik tombol → dapat `🌸 Member` → semua channel muncul.

**a. Kunci role `@everyone`**
Server Settings → Roles → `@everyone` → Permissions → **matikan `View Channels`** → Save.
Sekarang member tanpa role tidak bisa lihat channel apa pun.

**b. Beri akses ke `🌸 Member`**
Server Settings → Roles → `🌸 Member` → Permissions → **nyalakan `View Channels`**, `Send Messages`, `Read Message History`, `Connect`, `Speak`, dll.

**c. Buka channel verifikasi untuk @everyone**
Klik kanan channel `#verifikasi` → Edit Channel → **Permissions**:
- `@everyone`: ✅ View Channel, ✅ Read Message History, ❌ Send Messages
- `🌸 Member`: ❌ View Channel *(opsional — supaya channel verifikasi hilang setelah verifikasi)*

**d. Channel welcome** (`1568709095907922030`)
Kalau mau member baru bisa lihat ucapan welcome-nya, beri `@everyone` ✅ View Channel & ❌ Send Messages di channel itu. Kalau tidak, biarkan hanya untuk Member.

**e. Pastikan bot bisa lihat & kirim pesan** di channel verifikasi, take role, dan welcome (beri role bot izin View Channel + Send Messages di channel itu kalau channel-nya private).

> 💡 Tips: atur permission per **kategori** lalu klik "Sync" di channel-channel di dalamnya, jauh lebih cepat.

## 4. Isi `.env`

```bash
cp .env.example .env
```

Isi `DISCORD_TOKEN`, `MEMBER_ROLE_ID`, `ROLE_BOY_ID`, `ROLE_GIRL_ID`, `ROLE_MOLE_ID`, `ROLE_FISHIT_ID`.
`BANNER_URL` opsional — link gambar banner pink untuk panel verifikasi & take role.

## 5. Jalankan

```bash
npm install
npm start
```

Di VPS dengan pm2:

```bash
pm2 start src/index.js --name cherry-blush
pm2 save
```

## 6. Kirim panel

Di Discord (butuh izin Manage Server):

| Command | Fungsi |
|---|---|
| `/setup verifikasi channel:#verifikasi` | Kirim panel verifikasi |
| `/setup roles channel:#take-role` | Kirim panel take role |
| `/test welcome` | Preview kartu welcome |
| `/test goodbye` | Preview kartu goodbye |

Panel cukup dikirim **sekali** — tombolnya tetap jalan walau bot restart.

## Mengubah tampilan

- Warna: `src/config.js` → `colors`
- Teks panel & kartu: `src/ui.js`
- Tambah role baru: tambah object di `takeRoles` (`src/config.js`) + ID di `.env`, lalu kirim ulang `/setup roles`.

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Welcome tidak muncul | Server Members Intent belum dinyalakan / bot tidak bisa lihat channel |
| "Bot tidak punya izin" saat klik | Role bot harus di atas role yang diberikan + izin Manage Roles |
| Sudah verifikasi tapi channel tidak muncul | `@everyone` masih ✅ / `🌸 Member` belum diberi View Channels |
| Slash command tidak muncul | Cek `GUILD_ID`, invite ulang bot dengan scope `applications.commands` |
