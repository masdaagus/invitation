/* Guest personalization */
const guest = new URLSearchParams(location.search).get('guest') || new URLSearchParams(location.search).get('kepada') || 'Salindri';
document.querySelector('#guestName').textContent = guest;
document.querySelectorAll('[data-guest]').forEach((el) => { el.textContent = guest; });
document.querySelector('.wish-form input[name="nama"]').value = guest;

/* ===== Cover slideshow — Elementor-like fade + Ken Burns =====
   slide_duration: 1250ms hold after transition
   transition_duration: 2250ms fade
   ken_burns: in, scale 1 → 1.3 over 10s (ref computed transition)
*/
const slides = [...document.querySelectorAll('#coverSlideshow .slide')];
let slideIdx = 0;
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
  const prev = slides[slideIdx];
  slideIdx = (slideIdx + 1) % slides.length;
  const next = slides[slideIdx];
  prev.classList.remove('active');
  next.classList.add('active');
  armKen(next);
}
// kick first ken
if (slides[0]) armKen(slides[0]);
setInterval(nextSlide, SLIDE_HOLD + SLIDE_FADE);

/* ===== Cover title scroll motion FX — scale out-in =====
   motion_fx_scale_direction: out-in
   motion_fx_scale_speed: 3
   range start 20% → end 90% of viewport scroll on cover
*/
const coverTitle = document.querySelector('#coverTitle');
const cover = document.querySelector('#cover');
function updateTitleScale() {
  if (!coverTitle || !cover) return;
  const rect = cover.getBoundingClientRect();
  const viewH = window.innerHeight || 1;
  // progress 0 at top of cover fully visible, 1 as cover scrolls out
  const start = viewH * 0.2;
  const end = viewH * 0.9;
  const raw = (start - rect.top) / (end - start);
  const t = Math.min(1, Math.max(0, raw));
  // out-in: scale grows as you scroll (like ref ~1.0 → ~1.15+)
  const scale = 1 + t * 0.18 * 3 / 3; // speed size 3 → mild
  coverTitle.style.transform = `scale(${scale.toFixed(4)})`;
  coverTitle.style.transition = 'transform 100ms linear';
}
window.addEventListener('scroll', updateTitleScale, { passive: true });
updateTitleScale();

/* ===== Quote carousel — continuous, slides_to_show≈2, speed 2250, autoplay_speed 0 =====
   delay 0 = advance immediately after transition ends → seamless continuous
*/
const track = document.querySelector('#carouselTrack');
const imgs = track ? [...track.children] : [];
const realCount = 3; // unique images before duplicate
let carIdx = 0;
function slideWidth() {
  if (!imgs[0]) return 0;
  return imgs[0].getBoundingClientRect().width;
}
function setCarousel(instant) {
  if (!track) return;
  const w = slideWidth();
  track.style.transition = instant ? 'none' : 'transform 2.25s cubic-bezier(0.45, 0, 0.2, 1)';
  track.style.transform = `translate3d(${-carIdx * w}px,0,0)`;
}
function advanceCarousel() {
  carIdx += 1;
  setCarousel(false);
  if (carIdx >= realCount) {
    // after transition, snap back to clone start
    setTimeout(() => {
      carIdx = 0;
      setCarousel(true);
    }, 2300);
  }
}
window.addEventListener('resize', () => setCarousel(true));
setCarousel(true);
// autoplay_speed 0 + speed 2250 → next starts right after transition
setInterval(advanceCarousel, 2250);

/* ===== Countdown ===== */
const eventTime = new Date('2026-10-03T06:30:00+07:00').getTime();
const countdownBoxes = [...document.querySelectorAll('#countdown strong')];
function updateCountdown() {
  const distance = Math.max(0, eventTime - Date.now());
  const day = 86400000, hour = 3600000, minute = 60000;
  const values = [
    Math.floor(distance / day),
    Math.floor(distance % day / hour),
    Math.floor(distance % hour / minute),
    Math.floor(distance % minute / 1000)
  ];
  countdownBoxes.forEach((box, i) => { box.textContent = String(values[i]).padStart(2, '0'); });
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ===== Gift toggle ===== */
const giftToggle = document.querySelector('#giftToggle');
const giftList = document.querySelector('#giftList');
giftToggle?.addEventListener('click', () => {
  giftList.hidden = !giftList.hidden;
  giftToggle.textContent = giftList.hidden ? 'Lihat Rekening' : 'Sembunyikan Rekening';
});

/* ===== Toast + copy ===== */
const toast = document.querySelector('#toast');
function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}
window.showToast = showToast;

/* ===== RSVP + Wishes (Supabase) =====
   ponytail: anon key di-fetch dari .env via HTTP — works on static hosting
   yang serve dotfile (python http.server, dll). Kalau fetch gagal (file://
   atau host blokir dotfile), RSVP mati diam-diam. Upgrade path: inject key
   via build/deploy step.
*/
const wishList = document.querySelector('#wishList');
const rsvpForm = document.querySelector('#rsvpForm');
let supabaseClient = null;

function addWishItem({ nama, ucapan }) {
  const item = document.createElement('div');
  item.className = 'wish-item';
  const strong = document.createElement('strong');
  strong.textContent = nama;
  const span = document.createElement('span');
  span.textContent = ucapan;
  item.append(strong, span);
  wishList.prepend(item);
  while (wishList.children.length > 6) wishList.lastChild.remove();
}

async function initRsvp() {
  try {
    const env = Object.fromEntries(
      (await (await fetch('.env')).text()).split('\n')
        .filter((line) => line.includes('='))
        .map((line) => line.split('=').map((s) => s.trim()))
    );
    // if (!env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY.includes('tempel')) return;
    supabaseClient = supabase.createClient("https://xsabqeuxmokwcthokfwz.supabase.co", "sb_publishable_WAm14zb2mQyOFxjAijqYDg_C_xP9-Lf");

    const { data, error } = await supabaseClient
      .from('rsvp')
      .select('nama, ucapan')
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) throw error;
    data.reverse().forEach(addWishItem);
  } catch {
    /* .env tidak terjangkau atau Supabase down — biarkan form tanpa storage */
  }
}

rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!supabaseClient) {
    showToast('RSVP belum aktif');
    return;
  }
  const row = {
    nama: rsvpForm.nama.value.trim(),
    ucapan: rsvpForm.ucapan.value.trim(),
    kehadiran: rsvpForm.kehadiran.value,
  };
  const button = rsvpForm.querySelector('button');
  button.disabled = true;
  const { error } = await supabaseClient.from('rsvp').insert(row);
  button.disabled = false;
  if (error) {
    showToast('Gagal menyimpan, coba lagi');
    return;
  }
  addWishItem(row);
  rsvpForm.ucapan.value = '';
  showToast('Terima kasih atas konfirmasinya');
});

initRsvp();
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    showToast('Nomor rekening disalin');
  });
});

/* ===== Gallery 9:16 grid ===== */

const gallery = [
  'CSA_5462', 'CSA_5474',
  'CSA_5503', 'CSA_5468', 
  'CSA_5539', 'CSA_5554', 
  'CSA_5725', 'CSA_5575', 
  'CSA_5587', 'CSA_5646',
  'CSA_5679', 'CSA_5672',
  'CSA_5643', 'CSA_5716',
  'CSA_5734', 'NFL00479',
  'NFL00510', 'NFL00497',
  'NFL00461', 'NFL00034',
].map((name) => `assets/photos/${name}.webp`);
const galleryGrid = document.querySelector('#galleryGrid');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCounter = document.querySelector('#lightboxCounter');
let currentIndex = 0;
function showSlide(index) {
  currentIndex = (index + gallery.length) % gallery.length;
  lightboxImage.src = gallery[currentIndex];
  lightboxCounter.textContent = `${currentIndex + 1} / ${gallery.length}`;
}
gallery.forEach((src, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'anim zoom-in slow';
  button.innerHTML = `<img src="${src}" alt="Gallery ${index + 1}" loading="lazy">`;
  button.addEventListener('click', () => {
    showSlide(index);
    lightbox.showModal();
    new Image().src = gallery[(index + 1) % gallery.length];
  });
  galleryGrid.append(button);
});
document.querySelector('#closeLightbox').addEventListener('click', () => lightbox.close());
document.querySelector('#prevLightbox').addEventListener('click', () => showSlide(currentIndex - 1));
document.querySelector('#nextLightbox').addEventListener('click', () => showSlide(currentIndex + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showSlide(currentIndex - 1);
  if (event.key === 'ArrowRight') showSlide(currentIndex + 1);
});

/* ===== Entrance animations — WeddingPress wdpal style =====
   class .anim + direction; add .active on intersect
*/
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('active');
    animObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.anim').forEach((el) => animObserver.observe(el));

/* Activate cover anims on load (stagger via CSS delay) */
requestAnimationFrame(() => {
  document.querySelectorAll('.cover .anim').forEach((el) => el.classList.add('active'));
});
