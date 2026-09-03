# Desain — Kunci Scroll Cover + Pintu Masuk Tunggal via LET'S ROLL

## Ringkasan

Cover saat ini menjadi bagian dari satu halaman yang bisa di-scroll langsung. Tujuan:

1. Cover dijadikan "gerbang" satu layar penuh yang **tidak bisa di-scroll** sebelum aksi.
2. Scroll hanya terbuka ketika user mengklik tombol **LET'S ROLL**.
3. Klik LET'S ROLL sekaligus menjadi **satu-satunya pemicu** untuk mulai memutar lagu latar (syarat autoplay browser: butuh gestur user).

## Konteks yang sudah ada

- Satu halaman statis (Indonesian), `index.html` / `style.css` / `script.js`, no-build, hotlink gambar Supabase.
- Infrastruktur musik **sudah ada** dan tidak perlu dibuat dari nol:
  - `<audio id="bgMusic">` memutar `assets/song/Masa ini, Nanti, dan Masa Indah Lainnya.mp3` (`loop`, `preload="metadata"`).
  - Tombol floating `#musicToggle` kanan-bawah + CSS `.music-btn`, equalizer, status `aria-pressed`.
  - `musicOn()` di `script.js` mulai dari interaksi pertama global (`pointerdown`/`keydown`).
- Tombol `LET'S ROLL` saat ini anchor `href="#opening"`, cover adalah section pertama `.cover` dengan slideshow (fade + Ken Burns).
- CSS memakai `html{scroll-behavior:smooth}`.
- Cache-busting wajib: setiap edit CSS/JS harus bump `?v=` di `index.html`.

## Keputusan desain (sudah disepakati)

| Aspek | Keputusan |
|---|---|
| Kunci scroll | Cover = satu layar penuh, tidak bisa scroll sebelum LET'S ROLL |
| Pendekatan kunci | `.lock` di `html` + jepit scroll (wheel/touch/keyboard) — deterministik |
| Setelah klik | Hapus lock + auto-scroll smooth ke `#opening` |
| Feedback saat terkunci | Tidak ada indikator tambahan — cover diam saja |
| Musik | Klik LET'S ROLL langsung putar lagu |
| Tombol musik | `#musicToggle` disembunyikan sampai unlock |
| Pemicu musik | LET'S ROLL = satu-satunya pemicu (hapus `pointerdown`/`keydown` global) |

## Arsitektur

Konsep tunggal "gerbang masuk": satu state `.lock` pada `html` mengendalikan **dua hal sekaligus** — kemampuan scroll dan musik. Unlock hanya terjadi di **satu tempat** (handler klik LET'S ROLL), dan di tempat itu dilakukan empat hal sekaligus:

1. Hapus class `.lock` → scroll boleh berjalan.
2. Auto-scroll smooth ke `#opening`.
3. Mulai putar lagu (`bgMusic.play()`).
4. Tampilkan tombol musik `#musicToggle`.

## Perubahan per file

### 1. `index.html`

- Ubah `LET'S ROLL` dari anchor `href="#opening"` menjadi tombol (`<button type="button" id="rollBtn">LET'S ROLL</button>`) agar tidak ada lompatan hash bawaan browser sebelum unlock. (Style `.btn` sudah cocok untuk `<button>`.)
- Bump `?v=` untuk `style.css` dan `script.js`.

### 2. `style.css`

- Tambahkan blok kecil:
  ```css
  html.lock, html.lock body { overflow: hidden; }
  ```
  Ini jaring pengaman utama; jepit scroll via JS sebagai kontrol utama.
- Tidak perlu CSS baru untuk tombol musik: `[hidden]` sudah `display:none`.

### 3. `script.js`

- Saat load: `document.documentElement.classList.add('lock')`.
- **Jepit scroll** selama `.lock` aktif (pasif tapi `preventDefault`):
  - `wheel` → `preventDefault`.
  - `touchmove` → `preventDefault`.
  - `keydown` untuk tombol navigasi scroll (ArrowUp/ArrowDown/PageUp/PageDown/Home/End/Space) → `preventDefault`.
  - Kecualikan event yang berasal dari dalam area tombol LET'S ROLL supaya klik tidak tertelan.
- Pertahankan posisi di top: `window.scrollTo(0,0)` dipanggil dalam handler jepit/interval ringan, supaya tidak ada offset dari scroll yang "nyangkut".
- Buat fungsi `unlock()`:
  - Hapus `.lock`.
  - `#opening.scrollIntoView({ behavior: 'smooth' })`.
  - Panggil logika `musicOn()` (mulai lagu + tampilkan `#musicToggle`).
  - Lepas listener jepit.
- **LET'S ROLL** (`#rollBtn`): listener `click` → `preventDefault` + `unlock()`.
- **Hapus/ubah** pemicu musik global lama (`document.addEventListener('pointerdown'/'keydown', musicOn, { once:true })`) menjadi hanya dipanggil oleh `unlock()`.

## Alur perilaku

```
Page load → html.classList.add('lock')
            scroll diam di 0; slideshow + Ken Burns tetap berjalan

User klik LET'S ROLL → unlock()
                       ├─ hapus .lock
                       ├─ smooth-scroll ke #opening
                       ├─ bgMusic.play()  (volume 0.6, loop)
                       ├─ #musicToggle.hidden = false
                       └─ lanjut normal; tombol musik untuk pause/resume
```

## Kasus tepi & penanganan

- **Autoplay diblokir browser:** klik LET'S ROLL adalah gestur user yang sah → kebanyakan browser mengizinkan `play()`. Jika tetap `.catch` (jarang), tombol musik sudah tampil dan user bisa mulai manual.
- **iOS Safari:** jepit via `touchmove` `preventDefault`; `overflow:hidden` sebagai cadangan.
- **Anchor default `#opening`:** dihindari karena tombol diganti jadi `<button>` dan scroll ditangani sendiri oleh `unlock()`.
- **Klik tidak tertelan:** handler jepit mengecualikan event dari dalam `#rollBtn`.
- **Aksesibilitas:** `#rollBtn` tetap `<button>` yang bisa di-focus; jepit keydown mengecualikan target tombol supaya Enter/Space di tombol tetap berfungsi.

## Cache-busting

Bump `style.css?v=` dan `script.js?v=` di `index.html` ke nilai baru setelah edit.

## Testing manual

- Buka halaman: cover diam, tidak bisa scroll di desktop (wheel) maupun mobile (sentuh).
- Klik LET'S ROLL → scroll halus ke quote, musik mulai, tombol musik muncul.
- Tombol musik: pause ↔ play berfungsi.
- Tidak ada error di console.
