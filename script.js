/* Guest personalization */
const guest = new URLSearchParams(location.search).get('guest') || new URLSearchParams(location.search).get('kepada') || 'Salindri';
document.querySelector('#guestName').textContent = guest;
document.querySelectorAll('[data-guest]').forEach((el) => { el.textContent = guest; });

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
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(button.dataset.copy);
    showToast('Nomor rekening disalin');
  });
});

/* ===== Gallery 9:16 grid ===== */
const gallery = [
  'NFL00024', 'NFL00028', 'NFL00245', 'NFL00466', 'NFL00481',
  'NFL00484', 'NFL00495', 'NFL00511', 'NFL00543', 'NFL00593',
  'NFL00611', 'NFL00660', 'NFL00675', 'NFL00703', 'NFL00718'
].map((name) => `https://xsabqeuxmokwcthokfwz.supabase.co/storage/v1/object/public/wedding/salindri/${name}.webp`);
const galleryGrid = document.querySelector('#galleryGrid');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = lightbox.querySelector('img');
gallery.forEach((src, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'anim zoom-in slow';
  button.innerHTML = `<img src="${src}" alt="Gallery ${index + 1}" loading="lazy">`;
  button.addEventListener('click', () => {
    lightboxImage.src = src;
    lightbox.showModal();
  });
  galleryGrid.append(button);
});
document.querySelector('#closeLightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

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
