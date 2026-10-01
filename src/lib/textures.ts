import * as THREE from 'three';
import type { Film, Mood } from '../data/films';

const cache = new Map<string, THREE.Texture>();

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function finish(c: HTMLCanvasElement, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.needsUpdate = true;
  return t;
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  if (amt > 0) {
    r += (255 - r) * amt;
    g += (255 - g) * amt;
    b += (255 - b) * amt;
  } else {
    r *= 1 + amt;
    g *= 1 + amt;
    b *= 1 + amt;
  }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitTitle(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number, start: number) {
  let size = start;
  let lines: string[] = [];
  for (; size > 11; size -= 1) {
    ctx.font = `900 ${size}px Haettenschweiler, "Arial Narrow", Impact, Arial, sans-serif`;
    lines = wrapLines(ctx, text, maxW);
    if (lines.length <= maxLines) break;
  }
  return { size, lines };
}

/* ------------------------------------------------------------------ */
/* POSTER                                                              */
/* ------------------------------------------------------------------ */
export function posterTexture(f: Film) {
  const key = 'p' + f.id;
  const hit = cache.get(key);
  if (hit) return hit;

  const W = 384,
    H = 576;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  const [c1, c2] = f.c;

  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(0.55, shade(c1, -0.25));
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  switch (f.a) {
    case 0: {
      const sg = ctx.createRadialGradient(W / 2, H * 0.36, 8, W / 2, H * 0.36, 110);
      sg.addColorStop(0, shade(c1, 0.75));
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.36, 110, 0, 7);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (let i = 0; i < 7; i++) ctx.fillRect(0, H * 0.3 + i * 18, W, 7);
      break;
    }
    case 1: {
      ctx.fillStyle = shade(c2, -0.25);
      ctx.beginPath();
      ctx.moveTo(-10, H * 0.72);
      ctx.lineTo(W * 0.34, H * 0.3);
      ctx.lineTo(W * 0.66, H * 0.68);
      ctx.lineTo(W * 0.85, H * 0.42);
      ctx.lineTo(W + 10, H * 0.78);
      ctx.lineTo(W + 10, H);
      ctx.lineTo(-10, H);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(c1, 0.55);
      ctx.beginPath();
      ctx.arc(W * 0.74, H * 0.22, 34, 0, 7);
      ctx.fill();
      break;
    }
    case 2: {
      ctx.translate(W / 2, H * 0.42);
      for (let i = 0; i < 16; i++) {
        ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.16)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 420, (i * Math.PI) / 8, ((i + 1) * Math.PI) / 8);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 3: {
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 16;
      for (let i = -H; i < W + H; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + H, H);
        ctx.stroke();
      }
      ctx.fillStyle = shade(c2, -0.4);
      ctx.beginPath();
      ctx.arc(W * 0.5, H * 0.4, 72, 0, 7);
      ctx.fill();
      break;
    }
    case 4: {
      for (let i = 9; i > 0; i--) {
        ctx.fillStyle = i % 2 ? shade(c2, -0.18) : shade(c1, 0.18);
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.38, i * 20, 0, 7);
        ctx.fill();
      }
      break;
    }
    default: {
      ctx.fillStyle = shade(c2, -0.45);
      let x = 0;
      let i = 0;
      while (x < W) {
        const w = 16 + ((i * 37) % 26);
        const h = 60 + ((i * 53) % 130);
        ctx.fillRect(x, H * 0.72 - h, w, h + 40);
        ctx.fillStyle = 'rgba(255,230,140,0.5)';
        for (let k = 0; k < 4; k++) ctx.fillRect(x + 4 + (k % 2) * 8, H * 0.72 - h + 10 + k * 14, 5, 7);
        ctx.fillStyle = shade(c2, -0.45);
        x += w + 5;
        i++;
      }
      break;
    }
  }
  ctx.restore();

  // monogram
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#fff';
  ctx.font = '900 300px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(f.t[0].toUpperCase(), W / 2, H * 0.38);
  ctx.restore();

  // bagliore d'angolo per dare profondità
  const gl = ctx.createRadialGradient(W * 0.25, H * 0.15, 4, W * 0.25, H * 0.15, W * 0.9);
  gl.addColorStop(0, 'rgba(255,255,255,0.18)');
  gl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, W, H);

  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // bottom plate
  const bg = ctx.createLinearGradient(0, H * 0.56, 0, H);
  bg.addColorStop(0, 'rgba(0,0,0,0)');
  bg.addColorStop(0.35, 'rgba(0,0,0,0.78)');
  bg.addColorStop(1, 'rgba(0,0,0,0.95)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, H * 0.56, W, H * 0.44);

  // filetto decorativo sopra il titolo
  ctx.strokeStyle = shade(c1, 0.6);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.2, H * 0.66);
  ctx.lineTo(W * 0.8, H * 0.66);
  ctx.stroke();

  // title
  const { size, lines } = fitTitle(ctx, f.t.toUpperCase(), W - 44, 3, 62);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  let y = H - 84 - (lines.length - 1) * (size + 4);
  for (const ln of lines) {
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillText(ln, W / 2 + 3, y + 3);
    ctx.fillStyle = '#fff';
    ctx.fillText(ln, W / 2, y);
    y += size + 4;
  }

  ctx.font = '600 22px Arial, sans-serif';
  ctx.fillStyle = shade(c1, 0.6);
  ctx.fillText(`${f.y}  •  ${f.d} MIN  •  ★ ${f.r.toFixed(1)}`, W / 2, H - 44);

  // format badge
  ctx.fillStyle = f.fmt === 'VHS' ? '#111' : '#0a3b8c';
  ctx.fillRect(15, 15, 78, 32);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(15, 15, 78, 32);
  ctx.fillStyle = '#fff';
  ctx.font = '900 20px Arial, sans-serif';
  ctx.fillText(f.fmt, 54, 38);

  // grain sottile
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 13;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  // bordo lucido
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  const t = finish(c);
  cache.set(key, t);
  return t;
}

export function posterDataURL(f: Film) {
  const t = posterTexture(f) as THREE.CanvasTexture;
  return (t.image as HTMLCanvasElement).toDataURL('image/jpeg', 0.82);
}

/* ------------------------------------------------------------------ */
/* ENVIRONMENT                                                         */
/* ------------------------------------------------------------------ */
export function carpetTexture() {
  const k = 'carpet';
  if (cache.has(k)) return cache.get(k)!;
  const S = 512;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;

  // base con variazione tonale
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, '#15306e');
  bg.addColorStop(0.5, '#102555');
  bg.addColorStop(1, '#16336f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // motivo geometrico anni 90 (rombi + stelle)
  ctx.strokeStyle = 'rgba(245,195,40,0.22)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= S; x += 128) {
    for (let y = 0; y <= S; y += 128) {
      ctx.beginPath();
      ctx.moveTo(x, y - 34);
      ctx.lineTo(x + 34, y);
      ctx.lineTo(x, y + 34);
      ctx.lineTo(x - 34, y);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(220,60,50,0.16)';
      ctx.beginPath();
      ctx.arc(x + 64, y + 64, 9, 0, 7);
      ctx.fill();
    }
  }

  // fibre della moquette
  for (let i = 0; i < 7000; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = Math.random();
    ctx.fillStyle =
      r > 0.95 ? 'rgba(245,195,40,0.55)' : r > 0.9 ? 'rgba(220,60,50,0.45)' : r > 0.55 ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y, 1 + Math.random() * 2.6, 0.8 + Math.random() * 1.6, Math.random() * 3, 0, 7);
    ctx.fill();
  }
  const t = finish(c, [16, 16]);
  cache.set(k, t);
  return t;
}

export function cinemaCarpetTexture() {
  const k = 'cinema_carpet';
  if (cache.has(k)) return cache.get(k)!;
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#540b15';
  ctx.fillRect(0, 0, S, S);
  // Gold retro geometric diamond pattern
  ctx.strokeStyle = '#c9962a';
  ctx.lineWidth = 2.5;
  for (let x = -32; x < S + 64; x += 64) {
    for (let y = -32; y < S + 64; y += 64) {
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.lineTo(x + 24, y);
      ctx.lineTo(x, y + 24);
      ctx.lineTo(x - 24, y);
      ctx.closePath();
      ctx.stroke();
    }
  }
  const t = finish(c, [8, 8]);
  cache.set(k, t);
  return t;
}

export function wallTexture() {
  const k = 'wall';
  if (cache.has(k)) return cache.get(k)!;
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#f1eee6');
  g.addColorStop(1, '#ddd8cc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  // intonaco fine
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.045})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 2, 2);
  }
  for (let i = 0; i < 1200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
    ctx.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5);
  }
  const t = finish(c, [10, 3]);
  cache.set(k, t);
  return t;
}

export function ceilingTexture() {
  const k = 'ceil';
  if (cache.has(k)) return cache.get(k)!;
  const c = canvas(128, 128);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#2c3038';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#1b1e24';
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, 128, 128);
  const t = finish(c, [12, 11]);
  cache.set(k, t);
  return t;
}

/* ------------------------------------------------------------------ */
/* SIGNS / UI IN 3D                                                    */
/* ------------------------------------------------------------------ */
export function moodSignTexture(m: Mood) {
  const k = 'sign' + m.id;
  if (cache.has(k)) return cache.get(k)!;
  const W = 1024,
    H = 256;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, m.colore);
  g.addColorStop(1, m.colore2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(0, 0, W, 22);
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, W - 10, H - 10);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '80px serif';
  ctx.fillText(m.emoji, 110, H / 2 + 4);
  ctx.fillText(m.emoji, W - 110, H / 2 + 4);

  ctx.font = '900 80px Haettenschweiler, "Arial Narrow", Impact, Arial, sans-serif';
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillText(m.nome, W / 2 + 4, H / 2 - 14);
  ctx.fillStyle = '#fff';
  ctx.fillText(m.nome, W / 2, H / 2 - 18);
  ctx.font = '600 30px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(m.claim, W / 2, H / 2 + 56);
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function logoTexture() {
  const k = 'logo';
  if (cache.has(k)) return cache.get(k)!;
  const W = 1024,
    H = 256;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0b1f5c';
  ctx.fillRect(0, 0, W, H);
  // torn ticket
  ctx.fillStyle = '#f5c518';
  ctx.fillRect(44, 34, W - 88, H - 68);
  ctx.fillStyle = '#0b1f5c';
  ctx.fillRect(54, 44, W - 108, H - 88);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 96px Haettenschweiler, "Arial Narrow", Impact, Arial, sans-serif';
  ctx.fillStyle = '#f5c518';
  ctx.fillText('MOODBUSTER', W / 2, H / 2 - 16);
  ctx.font = '900 38px Arial, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText('V I D E O', W / 2, H / 2 + 50);
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function bannerTexture(title: string, sub: string, bg: string, fg: string) {
  const k = 'ban' + title + sub;
  if (cache.has(k)) return cache.get(k)!;
  const W = 768,
    H = 256;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fg;
  ctx.font = '900 84px Haettenschweiler, "Arial Narrow", Impact, Arial, sans-serif';
  ctx.fillText(title, W / 2, H / 2 - 22);
  ctx.font = '600 32px Arial, sans-serif';
  ctx.fillText(sub, W / 2, H / 2 + 50);
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function faceTexture() {
  const k = 'face';
  if (cache.has(k)) return cache.get(k)!;
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f5cd30';
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(66, 86, 28, 40);
  ctx.fillRect(162, 86, 28, 40);
  ctx.fillStyle = '#fff';
  ctx.fillRect(72, 92, 10, 12);
  ctx.fillRect(168, 92, 10, 12);
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(S / 2, 140, 48, 0.25 * Math.PI, 0.75 * Math.PI);
  ctx.stroke();
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function clerkFaceTexture() {
  const k = 'clerk_face';
  if (cache.has(k)) return cache.get(k)!;
  const S = 256;
  const c = canvas(S, S);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f5cd30';
  ctx.fillRect(0, 0, S, S);
  // Occhiali retrò da commesso nerd
  ctx.strokeStyle = '#1b1b22';
  ctx.lineWidth = 10;
  ctx.strokeRect(40, 75, 60, 48);
  ctx.strokeRect(156, 75, 60, 48);
  ctx.beginPath();
  ctx.moveTo(100, 99);
  ctx.lineTo(156, 99);
  ctx.stroke();
  // occhi
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(60, 90, 20, 20);
  ctx.fillRect(176, 90, 20, 20);
  ctx.fillStyle = '#fff';
  ctx.fillRect(64, 94, 8, 8);
  ctx.fillRect(180, 94, 8, 8);
  // sorriso amichevole
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(S / 2, 150, 42, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function kioskScreenTexture() {
  const k = 'kiosk';
  if (cache.has(k)) return cache.get(k)!;
  const W = 512,
    H = 384;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1150');
  g.addColorStop(1, '#4a1070');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5c518';
  ctx.font = '900 62px Haettenschweiler, "Arial Narrow", Impact, Arial, sans-serif';
  ctx.fillText('MOOD-O-MATIC', W / 2, 70);
  ctx.font = '96px serif';
  ctx.fillText('🎬', W / 2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '600 30px Arial, sans-serif';
  ctx.fillText('Non sai cosa guardare?', W / 2, 268);
  ctx.fillStyle = '#7ef5c0';
  ctx.font = '900 34px Arial, sans-serif';
  ctx.fillText('SCEGLI IL MOOD ▸', W / 2, 318);
  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function cinemaScreenTexture(title?: string, quote?: string) {
  const k = 'cinema_' + (title || 'def');
  if (cache.has(k)) return cache.get(k)!;
  const W = 1024,
    H = 576;
  const c = canvas(W, H);
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, W, H);

  // VHS Static / Scanlines
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 2);
  }

  // Header "PLAY ▶ SP 0:00:12"
  ctx.fillStyle = '#39e6a0';
  ctx.font = '900 36px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('PLAY ▶ SP  0:00:24', 40, 50);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#f5c518';
  ctx.fillText('SALA 1 • MOOD CINEMA', W - 40, 50);

  // Big movie title in retro style
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 76px Haettenschweiler, Impact, sans-serif';
  ctx.fillStyle = '#f5c518';
  ctx.shadowColor = 'rgba(245, 197, 24, 0.6)';
  ctx.shadowBlur = 20;
  ctx.fillText(title ? title.toUpperCase() : 'BENVENUTI AL CINEMA', W / 2, H / 2 - 20);
  ctx.shadowBlur = 0;

  if (quote) {
    ctx.font = 'italic 600 28px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`“${quote}”`, W / 2, H / 2 + 60);
  } else {
    ctx.font = '600 30px Arial, sans-serif';
    ctx.fillStyle = '#8ea2c6';
    ctx.fillText('Prendi un film dagli scaffali per vederne l’anteprima', W / 2, H / 2 + 50);
  }

  ctx.font = '900 24px monospace';
  ctx.fillStyle = '#39e6a0';
  ctx.fillText('HI-FI STEREO • DOLBY SURROUND', W / 2, H - 40);

  const t = finish(c);
  cache.set(k, t);
  return t;
}

export function stripeTexture(a: string, b: string) {
  const k = 'str' + a + b;
  if (cache.has(k)) return cache.get(k)!;
  const c = canvas(64, 64);
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = b;
  for (let i = -64; i < 128; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 16, 0);
    ctx.lineTo(i + 16 + 64, 64);
    ctx.lineTo(i + 64, 64);
    ctx.closePath();
    ctx.fill();
  }
  const t = finish(c, [30, 1]);
  cache.set(k, t);
  return t;
}
