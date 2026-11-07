// Generator gambar Welcome / Goodbye Cherry Blush (1024 x 500 px)
const path = require('path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

const FONT_DIR = path.join(__dirname, '..', 'assets', 'fonts');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Fredoka.ttf'), 'Fredoka');

const W = 1024;
const H = 500;

const C = {
  plum: '#8a2a62',
  navy: '#3d4f92',
  pink: '#ff6fb1',
  pinkLight: '#ffb8d9',
  gold: '#ffd66b',
  goldDark: '#d99a2b',
};

const THEMES = {
  welcome: {
    title: 'WELCOME',
    tagline: "WE'RE SO HAPPY YOU'RE HERE!",
    sky: ['#ffd2ea', '#f6dcff', '#cfe4ff'],
  },
  goodbye: {
    title: 'GOODBYE',
    tagline: "WE'LL MISS YOU, COME BACK SOON!",
    sky: ['#f6c3df', '#dfc9f7', '#bccdf3'],
  },
};

/* ─────────────────────────── Bentuk dasar ─────────────────────────── */
function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
}

function heart(ctx, x, y, s, { fill = '#ff8cc6', stroke = '#ffffff', alpha = 1, rot = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  heartPath(ctx, 0, -s / 2, s);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function sparkle(ctx, x, y, r, color = '#ffffff', alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = r * 0.8;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

function star5(ctx, x, y, r, fill = C.gold, stroke = C.goldDark) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.48 : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.lineJoin = 'round';
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

function bubble(ctx, x, y, r, alpha = 0.8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.7, 'rgba(220,235,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0.35)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.08);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function cloud(ctx, x, y, s, alpha = 0.85) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255,190,225,0.6)';
  ctx.shadowBlur = 20;
  for (const [dx, dy, r] of [
    [0, 0, 0.5],
    [0.45, -0.18, 0.42],
    [0.85, 0.02, 0.38],
    [-0.42, 0.06, 0.34],
    [0.3, 0.18, 0.36],
  ]) {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function bow(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.lineJoin = 'round';
  const g = ctx.createLinearGradient(0, -s, 0, s);
  g.addColorStop(0, '#ffd0e6');
  g.addColorStop(1, '#ff86bf');
  const outline = () => {
    ctx.lineWidth = s * 0.07;
    ctx.strokeStyle = '#e0559a';
    ctx.stroke();
  };
  // ekor pita
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.08, s * 0.1);
    ctx.quadraticCurveTo(dir * s * 0.35, s * 0.6, dir * s * 0.55, s * 0.95);
    ctx.lineTo(dir * s * 0.3, s * 0.85);
    ctx.lineTo(dir * s * 0.22, s * 1.02);
    ctx.quadraticCurveTo(dir * s * 0.12, s * 0.55, -dir * s * 0.05, s * 0.12);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    outline();
  }
  // lingkaran pita
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * s * 0.35, -s * 0.75, dir * s * 1.05, -s * 0.45, dir * s * 0.85, s * 0.05);
    ctx.bezierCurveTo(dir * s * 0.75, s * 0.42, dir * s * 0.3, s * 0.25, 0, 0);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
    outline();
    ctx.beginPath();
    ctx.ellipse(dir * s * 0.55, -s * 0.25, s * 0.16, s * 0.07, dir * -0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }
  // simpul
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.2, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ff9acb';
  ctx.fill();
  outline();
  ctx.restore();
}

function cherries(ctx, x, y, s, rot = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  // tangkai
  ctx.strokeStyle = '#4f9a3d';
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, s * 0.2);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.5, s * 0.1, -s * 0.85);
  ctx.moveTo(s * 0.45, s * 0.35);
  ctx.quadraticCurveTo(s * 0.35, -s * 0.3, s * 0.1, -s * 0.85);
  ctx.stroke();
  // daun
  ctx.beginPath();
  ctx.moveTo(s * 0.1, -s * 0.85);
  ctx.quadraticCurveTo(s * 0.55, -s * 1.15, s * 0.85, -s * 0.8);
  ctx.quadraticCurveTo(s * 0.45, -s * 0.6, s * 0.1, -s * 0.85);
  ctx.fillStyle = '#6cc04a';
  ctx.fill();
  ctx.lineWidth = s * 0.04;
  ctx.strokeStyle = '#3d7f2c';
  ctx.stroke();
  // buah
  for (const [cx, cy] of [
    [-s * 0.45, s * 0.42],
    [s * 0.45, s * 0.58],
  ]) {
    const g = ctx.createRadialGradient(cx - s * 0.12, cy - s * 0.12, s * 0.05, cx, cy, s * 0.36);
    g.addColorStop(0, '#ff9ccc');
    g.addColorStop(0.6, '#f0458f');
    g.addColorStop(1, '#c21f6a');
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = s * 0.05;
    ctx.strokeStyle = '#8f1550';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.12, cy - s * 0.14, s * 0.09, s * 0.05, -0.7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fill();
  }
  ctx.restore();
}

function crown(ctx, x, y, w, rot = 0) {
  const h = w * 0.62;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.lineTo(-w / 2, -h * 0.15);
  ctx.lineTo(-w * 0.25, h * 0.08);
  ctx.lineTo(0, -h / 2);
  ctx.lineTo(w * 0.25, h * 0.08);
  ctx.lineTo(w / 2, -h * 0.15);
  ctx.lineTo(w / 2, h / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, '#fff1b0');
  g.addColorStop(1, '#ffc548');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(255,200,80,0.7)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineJoin = 'round';
  ctx.lineWidth = w * 0.06;
  ctx.strokeStyle = C.goldDark;
  ctx.stroke();
  for (const [px, py] of [
    [-w / 2, -h * 0.15],
    [0, -h / 2],
    [w / 2, -h * 0.15],
  ]) {
    ctx.beginPath();
    ctx.arc(px, py, w * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#fff6cf';
    ctx.fill();
    ctx.stroke();
  }
  // permata pink
  ctx.beginPath();
  ctx.moveTo(0, h * 0.02);
  ctx.lineTo(w * 0.09, h * 0.2);
  ctx.lineTo(0, h * 0.38);
  ctx.lineTo(-w * 0.09, h * 0.2);
  ctx.closePath();
  ctx.fillStyle = '#ff7cbc';
  ctx.fill();
  ctx.lineWidth = w * 0.035;
  ctx.strokeStyle = '#c23c7f';
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────── Latar ─────────────────────────── */
function background(ctx, theme) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, theme.sky[0]);
  sky.addColorStop(0.55, theme.sky[1]);
  sky.addColorStop(1, theme.sky[2]);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // cahaya lembut
  for (const [x, y, r, col] of [
    [250, 230, 330, 'rgba(255,170,215,0.55)'],
    [820, 120, 260, 'rgba(255,255,255,0.55)'],
  ]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  // pulau / bukit samar di kejauhan
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#c9b6ee';
  ctx.beginPath();
  ctx.moveTo(470, 420);
  ctx.quadraticCurveTo(560, 330, 650, 380);
  ctx.quadraticCurveTo(720, 320, 820, 370);
  ctx.quadraticCurveTo(900, 335, 1000, 400);
  ctx.lineTo(1000, 430);
  ctx.lineTo(470, 430);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  cloud(ctx, 90, 62, 70, 0.9);
  cloud(ctx, 470, 30, 55, 0.75);
  cloud(ctx, 880, 50, 75, 0.85);
  cloud(ctx, 640, 455, 50, 0.5);

  // ombak
  const waves = [
    { y: 432, amp: 9, len: 120, color: '#b7d4ff', off: 0 },
    { y: 450, amp: 8, len: 95, color: '#cfe2ff', off: 40 },
    { y: 470, amp: 7, len: 80, color: '#e6f0ff', off: 15 },
  ];
  for (const w of waves) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) {
      ctx.lineTo(x, w.y + Math.sin((x + w.off) / w.len * Math.PI * 2) * w.amp);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fillStyle = w.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
  }

  // gelembung
  for (const [x, y, r] of [
    [45, 300, 14], [70, 345, 8], [455, 410, 11], [990, 290, 15], [960, 330, 8],
    [600, 70, 7], [415, 120, 10], [1000, 420, 10], [30, 180, 9], [560, 440, 9],
  ]) bubble(ctx, x, y, r);

  // hati & kilau di latar
  heart(ctx, 60, 120, 26, { fill: null, stroke: '#ff8cc6', alpha: 0.85, rot: -0.3 });
  heart(ctx, 445, 200, 20, { fill: '#ffc2df', stroke: '#ffffff', alpha: 0.9, rot: 0.25 });
  heart(ctx, 975, 220, 24, { fill: '#ffb3d6', stroke: '#ffffff', alpha: 0.9, rot: 0.2 });
  heart(ctx, 560, 400, 16, { fill: null, stroke: '#ff8cc6', alpha: 0.8, rot: -0.2 });
  heart(ctx, 940, 400, 18, { fill: null, stroke: '#ffffff', alpha: 0.9, rot: 0.3 });
  for (const [x, y, r] of [
    [150, 440, 10], [420, 60, 9], [700, 55, 8], [990, 120, 9], [520, 300, 7], [945, 455, 8], [35, 240, 7],
  ]) sparkle(ctx, x, y, r, '#ffffff', 0.95);
}

function frame(ctx) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(12, 12, W - 24, H - 24, 30);
  ctx.lineWidth = 8;
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.shadowColor = 'rgba(255,120,190,0.7)';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.roundRect(22, 22, W - 44, H - 44, 24);
  ctx.lineWidth = 2.5;
  ctx.setLineDash([2, 9]);
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,140,198,0.9)';
  ctx.stroke();
  ctx.restore();
}

/* ─────────────────────────── Teks bubbly ─────────────────────────── */
function bubbleText(ctx, str, cx, y, opt) {
  const { font, outline, inner = '#ffffff', fill, depth = 6, outlineW, maxWidth } = opt;
  let size = opt.size;
  ctx.font = `700 ${size}px ${font}`;
  while (maxWidth && ctx.measureText(str).width + outlineW > maxWidth && size > opt.minSize) {
    size -= 2;
    ctx.font = `700 ${size}px ${font}`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const m = ctx.measureText(str);
  const top = y - m.actualBoundingBoxAscent;
  const bottom = y + m.actualBoundingBoxDescent;

  // bayangan 3D
  ctx.save();
  ctx.fillStyle = outline;
  ctx.strokeStyle = outline;
  ctx.lineWidth = outlineW;
  ctx.shadowColor = 'rgba(120,40,90,0.35)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.strokeText(str, cx, y + depth);
  ctx.fillText(str, cx, y + depth);
  ctx.restore();

  // garis luar gelap + garis dalam putih
  ctx.lineWidth = outlineW;
  ctx.strokeStyle = outline;
  ctx.strokeText(str, cx, y);
  ctx.lineWidth = outlineW * 0.45;
  ctx.strokeStyle = inner;
  ctx.strokeText(str, cx, y);

  // isi gradasi + kilau (digambar di canvas terpisah lalu ditempel)
  const off = createCanvas(W, H);
  const o = off.getContext('2d');
  o.font = ctx.font;
  o.textAlign = 'center';
  o.textBaseline = 'alphabetic';
  const g = o.createLinearGradient(0, top, 0, bottom);
  fill.forEach((col, idx) => g.addColorStop(idx / (fill.length - 1), col));
  o.fillStyle = g;
  o.fillText(str, cx, y);
  o.globalCompositeOperation = 'source-atop';
  const shine = o.createLinearGradient(0, top, 0, top + (bottom - top) * 0.55);
  shine.addColorStop(0, 'rgba(255,255,255,0.75)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  o.fillStyle = shine;
  o.fillRect(0, top, W, (bottom - top) * 0.5);
  ctx.drawImage(off, 0, 0);

  return { width: m.width, top, bottom, size };
}

function ribbon(ctx, text, cx, cy) {
  ctx.save();
  let size = 27;
  ctx.font = `600 ${size}px Fredoka`;
  while (ctx.measureText(text).width > 350 && size > 16) {
    size -= 1;
    ctx.font = `600 ${size}px Fredoka`;
  }
  const tw = ctx.measureText(text).width;
  const w = tw + 110;
  const h = 56;
  const x = cx - w / 2;
  const y = cy - h / 2;

  // ekor pita
  for (const dir of [-1, 1]) {
    const ex = dir < 0 ? x + 14 : x + w - 14;
    ctx.beginPath();
    ctx.moveTo(ex, y + 12);
    ctx.lineTo(ex + dir * 46, y + 12);
    ctx.lineTo(ex + dir * 30, y + h / 2 + 8);
    ctx.lineTo(ex + dir * 46, y + h + 4);
    ctx.lineTo(ex, y + h + 4);
    ctx.closePath();
    ctx.fillStyle = '#f177b3';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = C.plum;
    ctx.stroke();
  }

  // badan pita
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#ffc6e1');
  g.addColorStop(1, '#ff8ec5');
  ctx.fillStyle = g;
  ctx.shadowColor = 'rgba(160,50,110,0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = C.plum;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 11);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();

  star5(ctx, x + 30, cy, 11);
  star5(ctx, x + w - 30, cy, 11);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = C.plum;
  ctx.strokeText(text, cx, cy + 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, cx, cy + 1);
  ctx.restore();
}

/* ─────────────────────────── Avatar ─────────────────────────── */
async function fetchAvatar(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    return await loadImage(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

function avatar(ctx, img, cx, cy, r, initial) {
  // cahaya di belakang
  const glow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.45);
  glow.addColorStop(0, 'rgba(255,140,200,0.55)');
  glow.addColorStop(1, 'rgba(255,140,200,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2);

  // cincin luar gradasi
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
  const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  ring.addColorStop(0, '#ff7fbf');
  ring.addColorStop(0.5, '#ffc1e0');
  ring.addColorStop(1, '#a9c8ff');
  ctx.fillStyle = ring;
  ctx.shadowColor = 'rgba(160,50,110,0.4)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r + 16, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.plum;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // foto
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  } else {
    const g = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
    g.addColorStop(0, '#ffc6e1');
    g.addColorStop(1, '#ff8ec5');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${r}px Fredoka`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, cx, cy + r * 0.05);
  }
  ctx.restore();

  // kilau kaca di atas foto
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const gloss = ctx.createLinearGradient(cx, cy - r, cx, cy);
  gloss.addColorStop(0, 'rgba(255,255,255,0.28)');
  gloss.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.15, cy - r * 0.55, r * 0.95, r * 0.55, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // titik-titik mutiara di cincin
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * (r + 11), cy + Math.sin(a) * (r + 11), 2.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
  }
}

function grayscale(ctx, contrast = 1.08) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let p = 0; p < d.length; p += 4) {
    let v = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
    v = Math.max(0, Math.min(255, (v - 128) * contrast + 128));
    d[p] = d[p + 1] = d[p + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
}

/* ─────────────────────────── Generator utama ─────────────────────────── */
/**
 * @param {'welcome'|'goodbye'} type
 * @param {{ username: string, avatarURL: string, footer?: string }} data
 * @returns {Promise<Buffer>} PNG 1024x500
 */
async function renderCard(type, { username, avatarURL, footer }) {
  const theme = THEMES[type] || THEMES.welcome;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  background(ctx, theme);

  // ── kiri: avatar ──
  const ax = 255;
  const ay = 238;
  const ar = 122;
  const img = await fetchAvatar(avatarURL);
  avatar(ctx, img, ax, ay, ar, (username[0] || '?').toUpperCase());
  crown(ctx, ax - 6, ay - ar - 26, 84, -0.12);
  cherries(ctx, ax + ar + 2, ay + ar - 22, 54, 0.15);
  sparkle(ctx, ax - ar - 18, ay - ar + 20, 13);
  sparkle(ctx, ax + ar + 26, ay - ar + 34, 9);
  heart(ctx, ax - ar - 4, ay + ar - 8, 30, { fill: '#ff8cc6', stroke: '#ffffff', rot: -0.3 });
  bow(ctx, 80, 420, 52, -0.15);

  // ── kanan: teks ──
  const tx = 700;
  const title = bubbleText(ctx, theme.title, tx, 168, {
    font: 'Fredoka',
    size: 104,
    minSize: 60,
    maxWidth: 480,
    outline: C.plum,
    outlineW: 16,
    fill: ['#ffd0e7', '#ff8cc6', '#f0559c'],
  });
  crown(ctx, tx - title.width / 2 + 14, title.top - 12, 50, -0.35);
  sparkle(ctx, tx + title.width / 2 + 20, title.top + 6, 14);
  heart(ctx, tx + title.width / 2 + 6, title.bottom - 6, 20, { fill: '#ff8cc6', stroke: '#ffffff', rot: 0.3 });

  bubbleText(ctx, username, tx, 262, {
    font: 'Fredoka',
    size: 60,
    minSize: 28,
    maxWidth: 470,
    outline: C.navy,
    outlineW: 14,
    depth: 5,
    fill: ['#eef5ff', '#b8d3ff', '#7fa8f2'],
  });

  ribbon(ctx, theme.tagline, tx, 334);

  if (footer) {
    ctx.save();
    ctx.font = '600 19px Fredoka';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeText(footer, tx, 392);
    ctx.fillStyle = C.plum;
    ctx.fillText(footer, tx, 392);
    const fw = ctx.measureText(footer).width;
    heart(ctx, tx - fw / 2 - 18, 392, 16, { fill: '#ff8cc6', stroke: '#ffffff' });
    heart(ctx, tx + fw / 2 + 18, 392, 16, { fill: '#ff8cc6', stroke: '#ffffff' });
    ctx.restore();
  }

  frame(ctx);

  // Goodbye dibuat hitam putih
  if (type === 'goodbye') grayscale(ctx);

  return canvas.toBuffer('image/png');
}

module.exports = { renderCard };
