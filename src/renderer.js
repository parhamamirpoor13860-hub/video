const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register fonts
registerFont('/home/antigravity/parhamamirpoor13860-hub/video/fonts/Vazirmatn-Bold.ttf', { family: 'Vazirmatn', weight: 'bold' });
registerFont('/home/antigravity/parhamamirpoor13860-hub/video/fonts/Vazirmatn-Black.ttf', { family: 'Vazirmatn', weight: '900' });
registerFont('/home/antigravity/parhamamirpoor13860-hub/video/fonts/Vazirmatn-Regular.ttf', { family: 'Vazirmatn', weight: 'normal' });

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const TOTAL_FRAMES = 645; // 21.5s

function easeOutBack(x, c1 = 1.70158) {
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function toPersianDigits(n) {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => farsiDigits[x]);
}

function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

// Background
function drawBackground(ctx, frame) {
  const t = frame / FPS;

  const bgGrad = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 80, WIDTH / 2, HEIGHT / 2, 1150);
  bgGrad.addColorStop(0, '#220306');
  bgGrad.addColorStop(0.45, '#120204');
  bgGrad.addColorStop(1, '#070102');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Animated glowing red orbs
  const orbs = [
    { x: 320 + Math.sin(t * 0.9) * 90, y: 320 + Math.cos(t * 0.7) * 70, r: 450, color: 'rgba(239, 57, 78, 0.14)' },
    { x: 1600 + Math.cos(t * 0.8) * 80, y: 720 + Math.sin(t * 0.6) * 90, r: 480, color: 'rgba(239, 57, 78, 0.16)' },
    { x: 960 + Math.sin(t * 1.2) * 80, y: 920, r: 380, color: 'rgba(255, 80, 100, 0.09)' }
  ];

  for (const orb of orbs) {
    const orbGrad = ctx.createRadialGradient(orb.x, orb.y, 10, orb.x, orb.y, orb.r);
    orbGrad.addColorStop(0, orb.color);
    orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = orbGrad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Futuristic tech grid
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
  ctx.lineWidth = 1;
  const gridSize = 80;
  const offsetX = (t * 16) % gridSize;
  for (let x = -gridSize; x < WIDTH + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x + offsetX, 0);
    ctx.lineTo(x + offsetX, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.restore();

  // Floating particles & sparkles
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const seed = i * 149.3;
    const px = (seed * 11 + t * (25 + (i % 20))) % (WIDTH + 100) - 50;
    const py = (seed * 17 + Math.sin(t * 1.5 + i) * 35) % (HEIGHT + 100) - 50;
    const size = 1.2 + (i % 3) * 1.2;
    const alpha = 0.2 + 0.3 * Math.sin(t * 2.5 + i);
    ctx.fillStyle = (i % 3 === 0) ? `rgba(239, 57, 78, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.75})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Persistent top brand header
function drawHeader(ctx, frame) {
  ctx.save();
  const hX = 100;
  const hY = 35;
  const hW = WIDTH - 200;
  const hH = 80;

  roundRect(ctx, hX, hY, hW, hH, 26);
  ctx.fillStyle = 'rgba(26, 8, 12, 0.75)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 57, 78, 0.3)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Digikala logo on left
  drawLogo(ctx, hX + 45, hY + 18, 0.75);

  // Incredible offers badge in center
  ctx.save();
  const badgeW = 270;
  const badgeH = 48;
  const badgeX = WIDTH / 2 - badgeW / 2;
  const badgeY = hY + 16;

  const bGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
  bGrad.addColorStop(0, '#ef394e');
  bGrad.addColorStop(1, '#b71c2f');
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 24);
  ctx.fillStyle = bGrad;
  ctx.fill();

  ctx.fillStyle = '#ffeb3b';
  ctx.font = 'bold 22px Vazirmatn';
  ctx.fillText('⚡', badgeX + 235, badgeY + 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('پیشنهاد شگفت‌انگیز', badgeX + 120, badgeY + 33);
  ctx.restore();

  // Countdown timer on right side
  const totalSec = Math.max(0, Math.floor(31500 - (frame / FPS)));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const timeStr = `${toPersianDigits(hrs.toString().padStart(2, '0'))}:${toPersianDigits(mins.toString().padStart(2, '0'))}:${toPersianDigits(secs.toString().padStart(2, '0'))}`;

  ctx.fillStyle = '#ff8092';
  ctx.font = 'bold 16px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText('فرصت باقی‌مانده', hX + hW - 170, hY + 48);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px Vazirmatn';
  ctx.textAlign = 'center';
  roundRect(ctx, hX + hW - 150, hY + 18, 125, 44, 12);
  ctx.fillStyle = 'rgba(239, 57, 78, 0.25)';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillText(timeStr, hX + hW - 87, hY + 48);

  ctx.restore();
}

// Digikala logo renderer
function drawLogo(ctx, x, y, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const r = 24;
  ctx.fillStyle = '#ef394e';
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(r, r - 2, 13, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Vazirmatn';
  ctx.textAlign = 'left';
  ctx.fillText('دیجی‌کالا', 60, 36);

  ctx.restore();
}

// Scene 1: Introduction & Countdown Teaser (Frames 0 to 125)
function drawScene1(ctx, frame) {
  const localF = frame;
  const progress = localF / 125;
  const t = localF / FPS;

  const enterScale = easeOutBack(clamp(progress / 0.22, 0, 1));
  const alpha = clamp(progress / 0.12, 0, 1);

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.translate(WIDTH / 2, HEIGHT / 2 + 30);
  ctx.scale(enterScale, enterScale);

  const heroGlow = ctx.createRadialGradient(0, 0, 50, 0, 0, 520);
  heroGlow.addColorStop(0, 'rgba(239, 57, 78, 0.38)');
  heroGlow.addColorStop(1, 'rgba(239, 57, 78, 0)');
  ctx.fillStyle = heroGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 520, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 70px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 30;
  ctx.fillText('جشنـواره شگفت‌انگیـز دیجیتـال', 0, -100);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ff4d63';
  ctx.font = 'bold 36px Vazirmatn';
  ctx.fillText('تخفیف‌های استثنایی تا ۷۰٪ فقط به مدت محدود', 0, -35);

  // Proper RTL Order: Right=ساعت, Center=دقیقه, Left=ثانیه
  const cardW = 155;
  const cardH = 145;
  const gap = 35;
  const startX = -(3 * cardW + 2 * gap) / 2;
  const cardY = 50;

  const totalSec = Math.max(0, Math.floor(31500 - (frame / FPS)));
  const units = [
    { label: 'ثانیه', val: totalSec % 60 },
    { label: 'دقیقه', val: Math.floor((totalSec % 3600) / 60) },
    { label: 'ساعت', val: Math.floor(totalSec / 3600) }
  ];

  units.forEach((u, idx) => {
    const cx = startX + idx * (cardW + gap);
    
    roundRect(ctx, cx, cardY, cardW, cardH, 22);
    const cGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
    cGrad.addColorStop(0, 'rgba(45, 15, 22, 0.9)');
    cGrad.addColorStop(1, 'rgba(20, 5, 9, 0.96)');
    ctx.fillStyle = cGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 57, 78, 0.45)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 58px Vazirmatn';
    ctx.textAlign = 'center';
    ctx.fillText(toPersianDigits(u.val.toString().padStart(2, '0')), cx + cardW / 2, cardY + 80);

    ctx.fillStyle = '#ff8595';
    ctx.font = 'bold 20px Vazirmatn';
    ctx.fillText(u.label, cx + cardW / 2, cardY + 124);
  });

  const pillW = 340;
  const pillH = 58;
  const pillX = -pillW / 2;
  const pillY = 235 + Math.sin(t * 3.5) * 6;

  roundRect(ctx, pillX, pillY, pillW, pillH, 29);
  const pGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
  pGrad.addColorStop(0, '#ef394e');
  pGrad.addColorStop(1, '#ff6678');
  ctx.fillStyle = pGrad;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('مشاهده کالاهای منتخب 🔥', 0, pillY + 37);

  ctx.restore();
}

// Scene 2: Smartphone Feature (Frames 126 to 251)
function drawScene2(ctx, frame) {
  const localF = frame - 125;
  const progress = localF / 126;
  const t = localF / FPS;

  const alpha = clamp(progress / 0.12, 0, 1);
  const enterX = (1 - easeOutCubic(clamp(progress / 0.22, 0, 1))) * 180;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Left: Ultra-detailed Smartphone Vector Render
  ctx.save();
  const phoneX = 540 + enterX;
  const phoneY = 580 + Math.sin(t * 2) * 12;
  ctx.translate(phoneX, phoneY);
  ctx.rotate(-0.05 + Math.sin(t * 1.5) * 0.02);

  // Phone shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 360, 240, 42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Phone titanium body
  const pw = 300;
  const ph = 600;
  roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 46);
  const bodyGrad = ctx.createLinearGradient(-pw / 2, -ph / 2, pw / 2, ph / 2);
  bodyGrad.addColorStop(0, '#383e4a');
  bodyGrad.addColorStop(0.5, '#1b2028');
  bodyGrad.addColorStop(1, '#0e1217');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 57, 78, 0.7)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Glass Screen
  const sw = pw - 18;
  const sh = ph - 18;
  roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 38);
  const scrGrad = ctx.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
  scrGrad.addColorStop(0, '#ef394e');
  scrGrad.addColorStop(0.55, '#880016');
  scrGrad.addColorStop(1, '#1e0007');
  ctx.fillStyle = scrGrad;
  ctx.fill();

  // Glass specular highlight streak
  ctx.save();
  roundRect(ctx, -sw / 2, -sh / 2, sw, sh, 38);
  ctx.clip();
  const specGrad = ctx.createLinearGradient(-sw / 2, -sh / 2, sw / 2, sh / 2);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
  specGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.05)');
  specGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
  ctx.restore();

  // Screen UI: Top Search Mockup
  roundRect(ctx, -sw / 2 + 20, -sh / 2 + 40, sw - 40, 38, 12);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText('جستجو در دیجی‌کالا...', sw / 2 - 35, -sh / 2 + 65);

  // Dynamic Island
  roundRect(ctx, -45, -sh / 2 + 10, 90, 20, 10);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Screen Center Artwork
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(0, 20, 85, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('نسل جدید', 0, 15);

  ctx.fillStyle = '#ff8da1';
  ctx.font = 'bold 20px Vazirmatn';
  ctx.fillText('دوربین ۲۰۰ مگاپیکسل', 0, 52);

  // Home bar at bottom
  roundRect(ctx, -60, sh / 2 - 25, 120, 5, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();

  // Right Side: Product Card
  const cardX = 960 - enterX;
  const cardY = 260;
  const cardW = 780;
  const cardH = 560;

  drawProductDetailsCard(ctx, {
    category: 'کالای دیجیتال • گوشی موبایل هوشمند',
    title: 'گوشی موبایل هوشمند پرچمدار (۲۵۶ گیگابایت)',
    rating: '★ ۴.۸ (از ۱,۴۲۰ خریدار رضایتمند)',
    origPrice: '۶۵,۰۰۰,۰۰۰ تومان',
    discount: '۴۰٪ تخفیف',
    finalPrice: '۳۹,۰۰۰,۰۰۰ تومان',
    badges: ['گارانتی ۱۸ ماهه معتبر', 'ارسال فوری دیجی‌کالا', 'ضمانت هفت‌روزه'],
    highlightColor: '#ef394e'
  }, cardX, cardY, cardW, cardH, t);

  ctx.restore();
}

// Scene 3: Smartwatch Feature (Frames 252 to 377)
function drawScene3(ctx, frame) {
  const localF = frame - 251;
  const progress = localF / 126;
  const t = localF / FPS;

  const alpha = clamp(progress / 0.12, 0, 1);
  const enterX = (1 - easeOutCubic(clamp(progress / 0.22, 0, 1))) * 180;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Left: Smartwatch Vector Model
  ctx.save();
  const watchX = 540 + enterX;
  const watchY = 580 + Math.sin(t * 2) * 10;
  ctx.translate(watchX, watchY);

  // Watch shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 320, 200, 36, 0, 0, Math.PI * 2);
  ctx.fill();

  // Watch strap
  const strapW = 145;
  const strapH = 540;
  roundRect(ctx, -strapW / 2, -strapH / 2, strapW, strapH, 22);
  const strapGrad = ctx.createLinearGradient(-strapW / 2, 0, strapW / 2, 0);
  strapGrad.addColorStop(0, '#1c1f24');
  strapGrad.addColorStop(0.5, '#333a45');
  strapGrad.addColorStop(1, '#1c1f24');
  ctx.fillStyle = strapGrad;
  ctx.fill();

  // Watch Case
  const caseSize = 275;
  roundRect(ctx, -caseSize / 2, -caseSize / 2, caseSize, caseSize, 62);
  const caseGrad = ctx.createLinearGradient(-caseSize / 2, -caseSize / 2, caseSize / 2, caseSize / 2);
  caseGrad.addColorStop(0, '#505866');
  caseGrad.addColorStop(0.5, '#262a32');
  caseGrad.addColorStop(1, '#181b20');
  ctx.fillStyle = caseGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 57, 78, 0.6)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Crown button
  roundRect(ctx, caseSize / 2, -35, 18, 70, 8);
  ctx.fillStyle = '#ff5266';
  ctx.fill();

  // OLED Screen
  const scrR = 112;
  ctx.beginPath();
  ctx.arc(0, 0, scrR, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0d12';
  ctx.fill();

  // Activity rings
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';

  ctx.strokeStyle = '#ef394e';
  ctx.beginPath();
  ctx.arc(0, 0, 94, -Math.PI / 2, (t * 1.5) % (Math.PI * 2));
  ctx.stroke();

  ctx.strokeStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(0, 0, 78, -Math.PI / 2, (t * 1.8 + 1) % (Math.PI * 2));
  ctx.stroke();

  ctx.strokeStyle = '#00e676';
  ctx.beginPath();
  ctx.arc(0, 0, 62, -Math.PI / 2, (t * 2.2 + 2) % (Math.PI * 2));
  ctx.stroke();

  // Digital time
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText(toPersianDigits('10:45'), 0, 14);

  ctx.restore();

  // Right: Product Card
  const cardX = 960 - enterX;
  const cardY = 260;
  const cardW = 780;
  const cardH = 560;

  drawProductDetailsCard(ctx, {
    category: 'گجت‌های پوشیدنی • ساعت هوشمند اولترا',
    title: 'ساعت هوشمند پیشرفته با حسگر ضربان قلب و اکسیژن',
    rating: '★ ۴.۹ (از ۸۹۰ نظر مثبت خریداران)',
    origPrice: '۱۸,۵۰۰,۰۰۰ تومان',
    discount: '۴۵٪ تخفیف',
    finalPrice: '۱۰,۱۷۵,۰۰۰ تومان',
    badges: ['پایش ۲۴ ساعته سلامت', 'ضد آب تا عمق ۵۰ متر', 'باتری قدرتمند ۵ روزه'],
    highlightColor: '#ff5266'
  }, cardX, cardY, cardW, cardH, t);

  ctx.restore();
}

// Scene 4: Wireless Earbuds Feature (Frames 378 to 503)
function drawScene4(ctx, frame) {
  const localF = frame - 377;
  const progress = localF / 126;
  const t = localF / FPS;

  const alpha = clamp(progress / 0.12, 0, 1);
  const enterX = (1 - easeOutCubic(clamp(progress / 0.22, 0, 1))) * 180;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Left: Earbuds Vector Model with Sound Waves
  ctx.save();
  const earX = 540 + enterX;
  const earY = 580 + Math.sin(t * 2) * 10;
  ctx.translate(earX, earY);

  // Sound wave rings
  for (let w = 1; w <= 3; w++) {
    const waveR = 150 + ((t * 130 + w * 70) % 230);
    const waveA = 1 - (waveR - 150) / 230;
    ctx.strokeStyle = `rgba(239, 57, 78, ${waveA * 0.45})`;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(0, -25, waveR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Earbuds Case
  const caseW = 230;
  const caseH = 175;
  roundRect(ctx, -caseW / 2, -caseH / 2 + 50, caseW, caseH, 52);
  const caseGrad = ctx.createLinearGradient(-caseW / 2, 0, caseW / 2, 100);
  caseGrad.addColorStop(0, '#ffffff');
  caseGrad.addColorStop(0.5, '#e4e7eb');
  caseGrad.addColorStop(1, '#c5cbd4');
  ctx.fillStyle = caseGrad;
  ctx.fill();

  ctx.fillStyle = '#00e676';
  ctx.beginPath();
  ctx.arc(0, 100, 5, 0, Math.PI * 2);
  ctx.fill();

  // Left Bud (floating)
  ctx.save();
  ctx.translate(-72, -72 + Math.sin(t * 3) * 8);
  ctx.rotate(-0.2);
  roundRect(ctx, -20, -45, 40, 90, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(0, -25, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Bud (floating)
  ctx.save();
  ctx.translate(72, -72 + Math.cos(t * 3) * 8);
  ctx.rotate(0.2);
  roundRect(ctx, -20, -45, 40, 90, 20);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(0, -25, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  // Right: Product Card
  const cardX = 960 - enterX;
  const cardY = 260;
  const cardW = 780;
  const cardH = 560;

  drawProductDetailsCard(ctx, {
    category: 'صوتی و تصویری • هدفون بی‌سیم بلوتوثی',
    title: 'هدفون بی‌سیم حرفه‌ای با سیستم حذف نویز فعال',
    rating: '★ ۴.۷ (از ۲,۱۵۰ نظر کاربران)',
    origPrice: '۹,۸۰۰,۰۰۰ تومان',
    discount: '۵۰٪ تخفیف',
    finalPrice: '۴,۹۰۰,۰۰۰ تومان',
    badges: ['شارژدهی ۳۰ ساعته مداوم', 'کیفیت صدای شفاف و پرقدرت', 'اتصال سریع به تمام گوشی‌ها'],
    highlightColor: '#ef394e'
  }, cardX, cardY, cardW, cardH, t);

  ctx.restore();
}

// Clean, professional luxury product details card
function drawProductDetailsCard(ctx, p, x, y, w, h, t) {
  // Base glass card
  roundRect(ctx, x, y, w, h, 28);
  const cardBg = ctx.createLinearGradient(x, y, x + w, y + h);
  cardBg.addColorStop(0, 'rgba(38, 14, 19, 0.88)');
  cardBg.addColorStop(1, 'rgba(18, 6, 9, 0.94)');
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 57, 78, 0.38)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Category Pill Tag
  ctx.save();
  const catW = 320;
  roundRect(ctx, x + w - catW - 40, y + 36, catW, 40, 20);
  ctx.fillStyle = 'rgba(239, 57, 78, 0.2)';
  ctx.fill();
  ctx.fillStyle = '#ff7b8c';
  ctx.font = 'bold 17px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText(p.category, x + w - 55, y + 63);
  ctx.restore();

  // Product Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText(p.title, x + w - 40, y + 130);

  // Rating
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 20px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText(p.rating, x + w - 40, y + 175);

  // Subtle separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 40, y + 208);
  ctx.lineTo(x + w - 40, y + 208);
  ctx.stroke();

  // Inner Pricing Container Box
  const priceBoxX = x + 40;
  const priceBoxY = y + 230;
  const priceBoxW = w - 80;
  const priceBoxH = 195;
  roundRect(ctx, priceBoxX, priceBoxY, priceBoxW, priceBoxH, 20);
  ctx.fillStyle = 'rgba(20, 6, 9, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(239, 57, 78, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Row 1: Original Price & Discount Badge
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 20px Vazirmatn';
  ctx.textAlign = 'right';
  const fullOldPrice = `قیمت اولیه: ${p.origPrice}`;
  ctx.fillText(fullOldPrice, priceBoxX + priceBoxW - 25, priceBoxY + 45);

  // Strikethrough line strictly over the price digits
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const numW = ctx.measureText(p.origPrice).width;
  ctx.moveTo(priceBoxX + priceBoxW - 25 - numW - 90, priceBoxY + 38);
  ctx.lineTo(priceBoxX + priceBoxW - 25 - 90, priceBoxY + 38);
  ctx.stroke();

  // Animated Discount Pill Badge on left of Row 1
  const badgePulse = 1.0 + 0.04 * Math.sin(t * 4);
  ctx.save();
  ctx.translate(priceBoxX + 95, priceBoxY + 42);
  ctx.scale(badgePulse, badgePulse);
  roundRect(ctx, -80, -20, 160, 40, 20);
  const dGrad = ctx.createLinearGradient(-80, 0, 80, 0);
  dGrad.addColorStop(0, '#ef394e');
  dGrad.addColorStop(1, '#b71c2f');
  ctx.fillStyle = dGrad;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText(p.discount, 0, 7);
  ctx.restore();

  // Row 2: Final Special Price
  ctx.fillStyle = '#ff8595';
  ctx.font = 'bold 22px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.fillText('قیمت شگفت‌انگیز:', priceBoxX + priceBoxW - 25, priceBoxY + 115);

  ctx.fillStyle = '#00ff88';
  ctx.font = '900 48px Vazirmatn';
  ctx.textAlign = 'right';
  ctx.shadowColor = 'rgba(0, 255, 136, 0.4)';
  ctx.shadowBlur = 18;
  ctx.fillText(p.finalPrice, priceBoxX + priceBoxW - 25, priceBoxY + 168);
  ctx.shadowBlur = 0;

  // Trust Badges Pill Row
  const startBadgeX = x + w - 40;
  p.badges.forEach((bText, idx) => {
    const bw = 222;
    const bx = startBadgeX - (idx + 1) * bw - idx * 16;
    roundRect(ctx, bx, y + 455, bw, 44, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 16px Vazirmatn';
    ctx.textAlign = 'center';
    ctx.fillText(`✓ ${bText}`, bx + bw / 2, y + 482);
  });
}

// Scene 5: Outro & Call to Action (Frames 504 to 645)
function drawScene5(ctx, frame) {
  const localF = frame - 504;
  const progress = localF / 141;
  const t = localF / FPS;

  const alpha = clamp(progress / 0.12, 0, 1);
  const scale = easeOutBack(clamp(progress / 0.22, 0, 1));

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.translate(WIDTH / 2, HEIGHT / 2 + 30);
  ctx.scale(scale, scale);

  const glow = ctx.createRadialGradient(0, 0, 50, 0, 0, 620);
  glow.addColorStop(0, 'rgba(239, 57, 78, 0.42)');
  glow.addColorStop(0.7, 'rgba(239, 57, 78, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 620, 0, Math.PI * 2);
  ctx.fill();

  // Grand Digikala Logo
  ctx.save();
  ctx.translate(-180, -180);
  drawLogo(ctx, 0, 0, 1.8);
  ctx.restore();

  // Headline
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 56px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 25;
  ctx.fillText('تخفیف تا ۷۰٪ روی برترین کالاهای دیجیتال', 0, -30);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#ff7b8c';
  ctx.font = 'bold 32px Vazirmatn';
  ctx.fillText('فرصت را از دست ندهید! سفارش آنلاین با ارسال سریع', 0, 30);

  // Animated CTA Button
  const btnW = 480;
  const btnH = 80;
  const btnY = 90;
  const btnPulse = 1.0 + 0.03 * Math.sin(t * 5);

  ctx.save();
  ctx.translate(0, btnY + btnH / 2);
  ctx.scale(btnPulse, btnPulse);
  roundRect(ctx, -btnW / 2, -btnH / 2, btnW, btnH, 40);

  const btnGrad = ctx.createLinearGradient(-btnW / 2, -btnH / 2, btnW / 2, btnH / 2);
  btnGrad.addColorStop(0, '#ef394e');
  btnGrad.addColorStop(1, '#ff3b53');
  ctx.fillStyle = btnGrad;
  ctx.shadowColor = 'rgba(239, 57, 78, 0.6)';
  ctx.shadowBlur = 30;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('همین حالا خرید کنید 🛒', 0, 12);
  ctx.restore();

  // Domain
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Vazirmatn';
  ctx.textAlign = 'center';
  ctx.fillText('digikala.com', 0, 240);

  // App download badges
  ctx.fillStyle = '#9ca3af';
  ctx.font = 'bold 20px Vazirmatn';
  ctx.fillText('دانلود اپلیکیشن از بازار، سیب‌اپ و گوگل‌پلی', 0, 280);

  ctx.restore();
}

// Kinetic Red Flash Transition between scenes (during 6 frames of each transition)
function drawTransition(ctx, frame) {
  const transitionPoints = [125, 251, 377, 504];
  for (const tp of transitionPoints) {
    const diff = frame - tp;
    if (diff >= 0 && diff < 8) {
      const transAlpha = Math.sin((diff / 8) * Math.PI) * 0.45;
      const transX = (diff / 8) * WIDTH * 1.5 - WIDTH * 0.25;
      
      const tGrad = ctx.createLinearGradient(transX - 300, 0, transX + 300, HEIGHT);
      tGrad.addColorStop(0, 'rgba(239, 57, 78, 0)');
      tGrad.addColorStop(0.5, `rgba(255, 100, 120, ${transAlpha})`);
      tGrad.addColorStop(1, 'rgba(239, 57, 78, 0)');
      
      ctx.fillStyle = tGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      break;
    }
  }
}

// Master frame render function
function renderFrame(frame) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  drawBackground(ctx, frame);
  drawHeader(ctx, frame);

  if (frame < 126) {
    drawScene1(ctx, frame);
  } else if (frame < 252) {
    drawScene2(ctx, frame);
  } else if (frame < 378) {
    drawScene3(ctx, frame);
  } else if (frame < 504) {
    drawScene4(ctx, frame);
  } else {
    drawScene5(ctx, frame);
  }

  drawTransition(ctx, frame);

  return canvas;
}

module.exports = {
  renderFrame,
  TOTAL_FRAMES,
  FPS,
  WIDTH,
  HEIGHT
};

if (require.main === module) {
  const testFrames = [
    { frame: 60, name: 'scene1_intro.png' },
    { frame: 190, name: 'scene2_smartphone.png' },
    { frame: 315, name: 'scene3_smartwatch.png' },
    { frame: 440, name: 'scene4_earbuds.png' },
    { frame: 580, name: 'scene5_outro.png' }
  ];

  fs.mkdirSync('/home/antigravity/parhamamirpoor13860-hub/video/output', { recursive: true });

  testFrames.forEach(tf => {
    const cvs = renderFrame(tf.frame);
    const outPath = path.join('/home/antigravity/parhamamirpoor13860-hub/video/output', tf.name);
    fs.writeFileSync(outPath, cvs.toBuffer('image/png'));
    console.log(`Updated sample ${tf.name}`);
  });
}
