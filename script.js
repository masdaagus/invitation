const params = new URLSearchParams(location.search);
const guest = params.get('guest') || params.get('kepada') || 'Salindri';
const guestName = document.querySelector('#guestName');
const rsvpName = document.querySelector('#rsvpForm input[name="nama"]');

if (guestName) guestName.textContent = guest;
document.querySelectorAll('[data-guest]').forEach((element) => { element.textContent = guest; });
if (rsvpName) rsvpName.value = guest;

const slides = [...document.querySelectorAll('#coverSlideshow .slide')];
let slideIndex = 0;
const SLIDE_HOLD = 1250;
const SLIDE_FADE = 2250;

function armKen(slide) {
  const ken = slide.querySelector('.ken');
  if (!ken) return;
  ken.style.transition = 'none';
  ken.style.transform = 'scale(1)';
  void ken.offsetWidth;
  ken.style.transition = 'transform 10s linear';
  ken.style.transform = 'scale(1.3)';
}

function nextSlide() {
  if (slides.length < 2) return;
  const previous = slides[slideIndex];
  slideIndex = (slideIndex + 1) % slides.length;
  const next = slides[slideIndex];
  previous.classList.remove('active');
  next.classList.add('active');
  armKen(next);
}

if (slides[0]) {
  armKen(slides[0]);
  window.setInterval(nextSlide, SLIDE_HOLD + SLIDE_FADE);
}

const coverTitle = document.querySelector('#coverTitle');
const cover = document.querySelector('#cover');

function updateTitleScale() {
  if (!coverTitle || !cover) return;
  const rect = cover.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  const start = viewportHeight * .2;
  const end = viewportHeight * .9;
  const progress = Math.min(1, Math.max(0, (start - rect.top) / (end - start)));
  coverTitle.style.transform = `scale(${(1 + progress * .12).toFixed(4)})`;
}

window.addEventListener('scroll', updateTitleScale, { passive: true });
updateTitleScale();

const eventTime = new Date('2026-10-03T06:30:00+07:00').getTime();
const countdownBoxes = [...document.querySelectorAll('#countdown strong')];

function updateCountdown() {
  const distance = Math.max(0, eventTime - Date.now());
  const day = 86400000;
  const hour = 3600000;
  const minute = 60000;
  const values = [
    Math.floor(distance / day),
    Math.floor(distance % day / hour),
    Math.floor(distance % hour / minute),
    Math.floor(distance % minute / 1000),
  ];
  countdownBoxes.forEach((box, index) => { box.textContent = String(values[index]).padStart(2, '0'); });
}

updateCountdown();
window.setInterval(updateCountdown, 1000);

const toast = document.querySelector('#toast');

function showToast(text) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

const saveDateBtn = document.querySelector('#saveDateBtn');
saveDateBtn?.addEventListener('click', () => {
  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'DTSTART:20261003T020000Z',
    'DTEND:20261003T090000Z',
    'SUMMARY:Pernikahan Masda & Salindri',
    'LOCATION:Ds. Wonokupang RT.08/04\\, Balongbendo\\, Sidoarjo',
    'DESCRIPTION:Pernikahan Masda Agus Ruswoko & Salindri Retno Malini Kusuma Supardi.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pernikahan-masda-salindri.ics';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast('File kalender berhasil diunduh');
});

const giftToggle = document.querySelector('#giftToggle');
const giftList = document.querySelector('#giftList');

giftToggle?.setAttribute('aria-expanded', String(!giftList?.hidden));
giftToggle?.addEventListener('click', () => {
  if (!giftList) return;
  giftList.hidden = !giftList.hidden;
  giftToggle.textContent = giftList.hidden ? 'LIHAT REKENING' : 'SEMBUNYIKAN REKENING';
  giftToggle.setAttribute('aria-expanded', String(!giftList.hidden));
});

async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Clipboard tidak tersedia');
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await copyText(button.dataset.copy || '');
      showToast('Nomor rekening disalin');
    } catch {
      showToast('Gagal menyalin nomor rekening');
    }
  });
});

const wishList = document.querySelector('#wishList');
const rsvpForm = document.querySelector('#rsvpForm');
let supabaseClient = null;

function addWishItem({ nama, ucapan }) {
  if (!wishList || !nama || !ucapan) return;
  const item = document.createElement('article');
  const name = document.createElement('strong');
  const message = document.createElement('span');
  item.className = 'wish-item';
  name.textContent = nama;
  message.textContent = ucapan;
  item.append(name, message);
  wishList.prepend(item);
  while (wishList.children.length > 6) wishList.lastChild.remove();
}

async function initRsvp() {
  if (!window.supabase?.createClient) return;
  supabaseClient = window.supabase.createClient(
    'https://xsabqeuxmokwcthokfwz.supabase.co',
    'sb_publishable_WAm14zb2mQyOFxjAijqYDg_C_xP9-Lf',
  );
  try {
    const { data, error } = await supabaseClient
      .from('rsvp')
      .select('nama, ucapan')
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    [...data].reverse().forEach(addWishItem);
  } catch {
    supabaseClient = null;
  }
}

rsvpForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const nama = rsvpForm.nama.value.trim();
  const ucapan = rsvpForm.ucapan.value.trim();
  const kehadiran = new FormData(rsvpForm).get('kehadiran');
  if (!nama || !ucapan || !['Hadir', 'Tidak hadir'].includes(kehadiran)) {
    showToast('Lengkapi nama, kehadiran, dan ucapan');
    return;
  }
  if (nama.length > 100 || ucapan.length > 500) {
    showToast('Isian melebihi batas karakter');
    return;
  }
  if (!supabaseClient) {
    showToast('RSVP belum aktif');
    return;
  }
  const button = rsvpForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const { error } = await supabaseClient.from('rsvp').insert({ nama, ucapan, kehadiran });
    if (error) throw error;
    addWishItem({ nama, ucapan });
    rsvpForm.ucapan.value = '';
    showToast('Terima kasih atas konfirmasinya');
  } catch {
    showToast('Gagal menyimpan RSVP, coba lagi');
  } finally {
    button.disabled = false;
  }
});

initRsvp();

const gallery = [
  'CSA_5462', 'CSA_5474', 'CSA_5503', 'CSA_5468', 'CSA_5539', 'CSA_5554', 'CSA_5725',
  'CSA_5575', 'CSA_5587', 'CSA_5716', 'CSA_5679', 'CSA_5672', 'CSA_5643', 'CSA_5646',
].map((name) => `assets/photos/${name}.webp`);
const galleryGrid = document.querySelector('#galleryGrid');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCounter = document.querySelector('#lightboxCounter');
let currentIndex = 0;

function showSlide(index) {
  if (!lightboxImage || !lightboxCounter) return;
  currentIndex = (index + gallery.length) % gallery.length;
  lightboxImage.src = gallery[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${gallery.length}`;
}

if (galleryGrid && lightbox) {
  gallery.forEach((source, index) => {
    const button = document.createElement('button');
    const image = document.createElement('img');
    button.type = 'button';
    button.className = 'anim zoom-in slow';
    image.src = source;
    image.alt = `Foto galeri ${index + 1}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image);
    button.addEventListener('click', () => {
      showSlide(index);
      lightbox.showModal();
      new Image().src = gallery[(index + 1) % gallery.length];
    });
    galleryGrid.append(button);
  });
}

document.querySelector('#closeLightbox')?.addEventListener('click', () => lightbox?.close());
document.querySelector('#prevLightbox')?.addEventListener('click', () => showSlide(currentIndex - 1));
document.querySelector('#nextLightbox')?.addEventListener('click', () => showSlide(currentIndex + 1));
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
  if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
});

const bgMusic = document.querySelector('#bgMusic');
const musicToggle = document.querySelector('#musicToggle');
let musicInitialized = false;

function setMusicState(isPlaying) {
  if (!musicToggle) return;
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Jeda musik latar' : 'Putar musik latar');
}

function playMusic() {
  if (!bgMusic) return;
  bgMusic.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
}

function startMusic() {
  if (!bgMusic || !musicToggle) return;
  musicToggle.hidden = false;
  if (!musicInitialized) {
    musicInitialized = true;
    bgMusic.volume = .6;
    bgMusic.addEventListener('pause', () => setMusicState(false));
    bgMusic.addEventListener('play', () => setMusicState(true));
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) playMusic();
      else bgMusic.pause();
    });
  }
  playMusic();
}

const root = document.documentElement;
const rollBtn = document.querySelector('#rollBtn');
const opening = document.querySelector('#opening');
const siteNav = document.querySelector('#siteNav');
const scrollKeys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);

function preventWheel(event) { event.preventDefault(); }
function preventTouchMove(event) { event.preventDefault(); }
function preventKeyScroll(event) {
  if (event.target.closest?.('#rollBtn')) return;
  if (scrollKeys.has(event.key)) event.preventDefault();
}

function lockInvitation() {
  root.classList.add('lock');
  window.scrollTo(0, 0);
  window.addEventListener('wheel', preventWheel, { passive: false });
  window.addEventListener('touchmove', preventTouchMove, { passive: false });
  window.addEventListener('keydown', preventKeyScroll);
}

function unlockInvitation() {
  if (!root.classList.contains('lock')) return;
  root.classList.remove('lock');
  window.removeEventListener('wheel', preventWheel);
  window.removeEventListener('touchmove', preventTouchMove);
  window.removeEventListener('keydown', preventKeyScroll);
  if (siteNav) siteNav.hidden = false;
  startMusic();
  opening?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

lockInvitation();
rollBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  unlockInvitation();
});

const requiredHooks = ['cover', 'coverSlideshow', 'coverTitle', 'rollBtn', 'opening', 'countdown', 'galleryGrid', 'giftToggle', 'giftList', 'rsvpForm', 'wishList', 'lightbox', 'toast', 'musicToggle', 'bgMusic'];
console.assert(requiredHooks.every((id) => document.getElementById(id)), 'Invitation markup hooks missing');

const animationTargets = () => document.querySelectorAll('.anim');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('active');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -7% 0px' });
  animationTargets().forEach((element) => observer.observe(element));
} else {
  animationTargets().forEach((element) => element.classList.add('active'));
}

requestAnimationFrame(() => {
  document.querySelectorAll('.cover .anim').forEach((element) => element.classList.add('active'));
});
