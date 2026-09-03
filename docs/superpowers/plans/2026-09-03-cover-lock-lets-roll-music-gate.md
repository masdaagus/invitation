# Cover Lock + LET'S ROLL Music Gate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cover jadi gerbang satu layar penuh yang tidak bisa di-scroll sampai tombol LET'S ROLL diklik, dan klik itu menjadi satu-satunya pemicu scroll masuk + putar musik.

**Architecture:** Satu state `.lock` di `html` mengunci scroll (CSS `overflow:hidden` sebagai jaring pengaman + `preventDefault` di `wheel`/`touchmove`/`keydown`). Satu fungsi `unlock()` menghapus lock, smooth-scroll ke `#opening`, lalu memanggil `startMusic()`. Handler klik `#rollBtn` adalah satu-satunya pintu masuk — pemicu musik global lama (`pointerdown`/`keydown`) dihapus.

**Tech Stack:** Vanilla HTML/CSS/JS statis. Tanpa build, tanpa deps, tanpa framework test.

## Global Constraints

- Repo bukan git? — **catatan AGENTS.md usang**: repo KINI ada git (sudah ada commit). Tetap ikuti aturan yang berlaku: commit hanya bila diminta.
- **No build, no deps, no automated test.** Verifikasi manual lewat browser (`python3 -m http.server` lalu buka `localhost:8000`, atau `file://`).
- **Cache-busting wajib:** setiap edit CSS bump `style.css?v=`, setiap edit JS bump `script.js?v=` di `index.html`. Saat ini keduanya `1975f82`.
- Jangan hapus/ubah komentar referensi Elementor/WeddingPress & magic number (slide/ken burns/motion_fx).
- Jangan dedupe `<img>` duplikat carousel (sengaja).
- Bahasa `id`, guest dari `?guest=`/`?kepada=`, fallback `'Salindri'`.
- Kalau bunyi lagu tidak terdengar saat verifikasi, jangan anggap gagal — cek konsol & status tombol (blokir autoplay per-browser normal; tombol musik tetap muncul).

---
---

### Task 1: Button LET'S ROLL + CSS lock rule + cache-bump CSS

Ubah tombol LET'S ROLL dari anchor (`<a href="#opening">`) menjadi `<button>` dengan `id="rollBtn"`, tambahkan aturan lock di CSS, dan bump `style.css?v=`.

**Files:**
- Modify: `index.html:48` (tombol LET'S ROLL)
- Modify: `index.html:15` (bump `style.css?v=`)
- Modify: `style.css:29-33` (sisipkan aturan lock setelah blok `.invite`)

- [ ] **Step 1: Ganti anchor LET'S ROLL jadi button ber-id**

Di `index.html`, ganti baris 48:

```html
        <a class="btn anim muncul-atas slow" href="#opening">LET'S ROLL</a>
```

dengan:

```html
        <button class="btn anim muncul-atas slow" id="rollBtn" type="button">LET'S ROLL</button>
```

(Class `.btn`/`.anim` dipertahankan supaya gaya & animasi entri tetap sama; `.cover-content` punya `text-align:center`, jadi `<button>` inline-flex tetap di tengah seperti anchor dulu.)

- [ ] **Step 2: Sisipkan aturan lock di CSS**

Di `style.css`, tepat setelah blok `.invite{...}` (baris 29-33) dan sebelum komentar `/* Shared */`, tambahkan:

```css
/* Cover lock — freeze page until LET'S ROLL (ref cover gate) */
html.lock,html.lock body{overflow:hidden;height:100%}
```

Belum ada elemen ber-class `.lock` saat Task 1 — aturan ini inert sampai Task 2 menambah class-nya.

- [ ] **Step 3: Bump cache-bust style.css**

Di `index.html:15`, ganti `style.css?v=1975f82` → `style.css?v=1975f83`.

(`script.js?v=1975f82` di baris 293 TIDAK disentuh di Task 1 — file JS belum diubah.)

- [ ] **Step 4: Verifikasi manual**

Run: `python3 -m http.server` lalu buka `http://localhost:8000`.

Expected:
- Tombol LET'S ROLL tampil di cover, gaya & animasi masuk normal, ber-centering.
- Tidak ada error di console.
- Page masih bisa di-scroll bebas (Task 2 belum jalan), klik tombol saat ini belum melakukan apa-apa — wajar, karena handler baru datang di Task 2.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "feat: LET'S ROLL jadi button + css lock rule + cache-bump"
```

---
---

### Task 2: Scroll lock/unlock + musik gate via LET'S ROLL

Refactor blok musik jadi fungsi `startMusic()` (tanpa pemicu global), tambah mekanisme lock-jepit scroll, dan wire `#rollBtn` → `unlock()` (scroll smooth ke `#opening` + mulai musik + munculkan tombol musik). Bump `script.js?v=`.

**Files:**
- Modify: `script.js:206-237` (blok "Background music" → refactor jadi `startMusic()` + sisipkan blok cover gate setelahnya)
- Modify: `index.html:293` (bump `script.js?v=`)

**Interfaces:**
- Produces: `startMusic()` — dipanggil sekali oleh `unlock()`; `unlock()` — hapus lock, scroll ke `#opening`, panggil `startMusic()`. Dipakai handler klik `#rollBtn`.

- [ ] **Step 1: Refactor blok musik & tambah cover gate**

Di `script.js`, ganti seluruh blok berikut (mulai komentar `/* ===== Background music — start on first interaction =====` sampai dua baris `document.addEventListener(...keydown, musicOn...)` terakhir, kira-kira baris 206-237):

```js
/* ===== Background music — mulai hanya via LET'S ROLL =====
   Autoplay audio diblokir Chrome/Safari/iOS, jadi lagu hanya mulai
   dari gestur user: klik LET'S ROLL (unlock). Loop terus; floating
   button kanan-bawah untuk pause/resume setelah masuk.
*/
const bgMusic = document.querySelector('#bgMusic');
const musicToggle = document.querySelector('#musicToggle');

function startMusic() {
  musicToggle.hidden = false;
  if (!bgMusic) return;
  bgMusic.volume = 0.6;
  const tryPlay = () => {
    bgMusic.play().then(() => {
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.setAttribute('aria-label', 'Jeda musik latar');
    }).catch(() => { /* blokir sementara — biar tombol yang mulai */ });
  };
  tryPlay();
  bgMusic.addEventListener('pause', () => {
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.setAttribute('aria-label', 'Putar musik latar');
  });
  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) tryPlay();
    else bgMusic.pause();
  });
}

/* ===== Cover gate — scroll & musik terkunci sampai LET'S ROLL =====
   html.lock dipasang saat load: wheel/touch/keyboard navigasi di-jepit.
   Klik #rollBtn → unlock(): hapus lock, smooth-scroll ke #opening,
   lalu startMusic(). Satu-satunya pintu masuk musik.
*/
const rootEl = document.documentElement;
const rollBtn = document.querySelector('#rollBtn');
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);

rootEl.classList.add('lock');
window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

function onWheel(e) { e.preventDefault(); }
function onTouchMove(e) { e.preventDefault(); }
function onKeyScroll(e) {
  if (e.target.closest && e.target.closest('#rollBtn')) return;
  if (SCROLL_KEYS.has(e.key)) e.preventDefault();
}

window.addEventListener('wheel', onWheel, { passive: false });
window.addEventListener('touchmove', onTouchMove, { passive: false });
window.addEventListener('keydown', onKeyScroll);

function unlock() {
  if (!rootEl.classList.contains('lock')) return;
  rootEl.classList.remove('lock');
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('keydown', onKeyScroll);
  document.querySelector('#opening').scrollIntoView({ behavior: 'smooth' });
  startMusic();
}

rollBtn?.addEventListener('click', (event) => {
  event.preventDefault();
  unlock();
});
```

Catatan implementasi (jangan dihapus logikanya):
- Handler `wheel`/`touchmove` dipasang dengan `{ passive:false }` karena butuh `preventDefault`.
- `onKeyScroll` mengecualikan event dari dalam `#rollBtn` agar tombol tetap bisa diaktifkan lewat keyboard (Enter/Space).
- Listener jepit di-*remove* SEBELUM `scrollIntoView`, sehingga auto-scroll smooth tidak ikut ter-jepit.
- `unlock()` idempotent (guard class `lock`) → klik ganda tidak menggandakan efek.
- Elemen lama `<a href="#opening">` sudah jadi `<button>` di Task 1 → `event.preventDefault()` di sini hanya mencegah perilaku default apa pun; scroll ditangani sendiri oleh `scrollIntoView`.

- [ ] **Step 2: Bump cache-bust script.js**

Di `index.html:293`, ganti `script.js?v=1975f82` → `script.js?v=1975f84`.

- [ ] **Step 3: Verifikasi manual**

Run: `python3 -m http.server` lalu buka `http://localhost:8000` di desktop (mouse) dan coba emulasi mobile (DevTools device toolbar) kalau ada.

Expected:
1. **Locked state:** halaman terbuka di cover. Wheel/scroll sentuh/Panah/PageUp/PageDown/Home/End/Space TIDAK menggerakkan halaman. Tidak ada error console. Slideshow + Ken Burns tetap berjalan.
2. **Klik LET'S ROLL:** halaman smooth-scroll ke section quote (`#opening`), lagu mulai berbunyi, tombol musik floating muncul kanan-bawah dengan equalizer animasi.
3. **Tombol musik:** klik = pause (icon berubah), klik lagi = resume. `aria-pressed` berubah benar.
4. **Setelah unlock:** halaman bisa di-scroll normal ke bawah (events/couple/journey/dst) — tidak ada sisa lock.
5. **Kebalikan:** muat ulang halaman → cover terkunci lagi (state reset). Klik LET'S ROLL sekali saja, tidak dobel-fire.

- [ ] **Step 4: Commit**

```bash
git add script.js index.html
git commit -m "feat: kunci cover + buka scroll & musik via LET'S ROLL"
```
