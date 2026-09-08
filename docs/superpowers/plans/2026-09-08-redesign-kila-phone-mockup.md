# Redesign Undangan Salindri → Mirip Tema "Premium 11 - Kila" (Phone Mockup) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tulis ulang `index.html`, `style.css`, `script.js` dari undangan Masda & Salindri agar tata letak, palet warna, tipografi, dan struktur section meniru tema demo "Premium 11 – Kila by Attarivitation", sambil mempertahankan konten asli (teks/id, tanggal, venue, foto, musik, RSVP Supabase) dan seluruh hook JS.

**Architecture:** Satu kolom "phone screen" selebar `min(100vw, 420px)` berisi panel bergantian terang (`#FFFBF8` cream) dan gelap (`#242424`), dengan latar belakang foto full-screen `position:fixed` di belakangnya (`#1A1A1A` page) — mirror komposisi reference. Semua JS asli dipertahankan fungsinya tapi dirapikan: hapus carousel quote (tidak ada di reference), label countdown jadi Hari/Jam/Menit/Detik, tambah handler nav-drawer + tombol RSVP jumlah tamu + tombol WhatsApp gift. Cache-busting `?v=` di-bump di tiap task yang menyentuh CSS/JS.

**Tech Stack:** HTML/CSS/JS statis vanilla, tanpa build, tanpa deps, tanpa framework test. Verifikasi manual lewat `python3 -m http.server`.

## Global Constraints

- **No build, no deps, no automated test.** Verifikasi manual: `python3 -m http.server` → buka `http://localhost:8000` (desktop + lebar mobile ≤430px), cek console error, animasi, countdown, RSVP, copy rekening, lightbox, musik, gate LET'S ROLL.
- **Cache-busting wajib:** tiap edit `style.css` bump `style.css?v=` di `index.html:15`; tiap edit `script.js` bump `script.js?v=` di `index.html` (~baris 293). Awal: `style.css?v=69c9e1a`, `script.js?v=69c9e17`. Konvensi: satu bump kenaikan pendek (mis. `69c9e1b`, `69c9e1c`) — bebas asal berubah dari nilai sebelumnya.
- **Bahasa `id`**, `lang="id"`. Guest name dari `?guest=` atau `?kepada=`, fallback `'Salindri'` — hook DOM: `#guestName`, semua `[data-guest]`, input `input[name="nama"]` di form RSVP.
- **Wedding date:** `2026-10-03T06:30:00+07:00` (countdown JS) dan teks "SABTU, 3 OKTOBER 2026" — tidak berubah, hanya restyle.
- **Foto & musik hanya path lokal** di `assets/photos/*.webp`, `assets/song/Masa ini, Nanti, dan Masa Indah Lainnya.mp3`. Jangan "perbaiki" path — semuanya ada.
- **Komponen fungsional yang WAJIB tetap jalan** (jangan hilangkan): gate `html.lock` + `#rollBtn` → `unlock()` + `startMusic()`; Ken Burns slideshow `#coverSlideshow`; countdown `#countdown`; `#giftToggle` + `#giftList` + `[data-copy]` + toast `#toast`; RSVP Supabase via fetch `.env` (anon key sudah hardcoded di script, fetch `.env` boleh gagal → mati diam-diam); gallery + lightbox `#lightbox`; observer `.anim`; tombol musik `#musicToggle` (equalizer CSS).
- **Komentar referensi Elementor/WeddingPress & magic number di `script.js`** (durasi slide, ken burns, motion_fx) — pertahankan spirit; teks boleh disesuaikan dengan struktur baru tapi JANGAN hapus nilai ajaib yang dipakai kode (SLIDE_HOLD 1250, SLIDE_FADE 2250, ken burns 10s scale 1→1.3).
- Nama file output tetap `index.html`, `style.css`, `script.js` di root — tidak boleh berubah.

**Palet reference (token — kopi nilai persis):**
- Page bg: `#1A1A1A`
- Panel cream: `#FFFBF8`
- Panel beige: `#929088`
- Dark panel: `#242424` / ink text `#101010`
- Text cream di dark: `#FFFFFF`; teks gelap di cream pakai `#101010`
- Swatch dress-code: `#EFE8D8`, `#E6D2B9`, `#E4ADA8`, `#D0A77B`, `#735B3F`
- Grey ikon/aksen: `#9A9A9C`
- Overlay foto hitam: 30–50% (`rgba(0,0,0,.3)`, `.4`, `.5`)
- Button: `background:transparent`, `border:1px solid #FFF`, `border-radius:8px`, `text-transform:uppercase`, `padding:14px 16px`; hover `background:#FFF`, teks jadi `#101010` (di panel cream: border/teks `#101010`, hover fill `#101010`, teks `#FFFBF8`).

**Tipografi reference (token):**
- Heading besar serif → font-family stack: `"New York", "Cormorant Garamond", "Times New Roman", serif`. Google Fonts: **Cormorant Garamond** (400) + **Bitter** (300,400) + **Inter** (300,400,500) via satu `<link>`.
- Heading section: serif stack, `font-size:30px`, `font-weight:400`, `text-transform:uppercase`, `letter-spacing:1px` (mobile 26px).
- Eyebrow/overline: `Inter`, `12px`, `text-transform:uppercase`, `letter-spacing:3px`.
- Body: `Inter`, `14px`, `font-weight:300/400`, `line-height:1.5`.
- Nama pengantin & `&` → **Candlefish** lokal (`fonts/Candlefish.woff2`, sudah ada `@font-face` di `style.css:1-7`).
- Countdown digits serif 32px, label Inter 12px uppercase.

---
---

### Task 1: Fonts + struktur HTML baru (phone mockup, section map) + bump CSS

Menyusun ulang `index.html` ke struktur baru tanpa mengubah hook JS (semua `id` yang dipakai script.js tetap ada). File `style.css` belum ditulis ulang → tata letak mentah sementara (stacked, cream/gelap belum terlihat). Ini sengaja: HTML dulu, CSS Task 2-6 menyusul.

**Files:**
- Modify: `index.html` (seluruh `<main class="invite">…` diganti; `<head>` fonts diganti; cache-bump `style.css?v=`)
- Modify: `index.html` (script.js `?v=` TIDAK diubah di task ini)

**Interfaces:**
- Produces: struktur DOM & class yang dipakai task CSS berikut:
  - `.invite` (kolom phone screen), `.phone-bg` (latar foto full-screen fixed), `.section`, `.cream`, `.dark`, `.photo-band`
  - Hook yang dipertahankan: `#cover`, `#coverSlideshow`, `.slide`, `.ken`, `.veil`, `#coverTitle`, `#guestName`, `#rollBtn`, `#opening`, `#countdown`, `#giftToggle`, `#giftList`, `#toast`, `#lightbox`, `#musicToggle`, `#bgMusic`, `#galleryGrid`, `#wishList`, `#rsvpForm`, `.anim`

- [ ] **Step 1: Ganti `<head>` fonts + preload + bump style**

Di `index.html`, ganti seluruh `<head>` bagian font & stylesheet (baris 9-15) menjadi:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Bitter:ital,wght@0,300;0,400;1,300&family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500&display=swap"
    rel="stylesheet">
  <link rel="preload" as="image" href="assets/photos/CSA_5451.webp">
  <link rel="stylesheet" href="style.css?v=69c9e1b">
```

- [ ] **Step 2: Tambah latar phone-bg + buka tag main baru**

Ganti blok `<body>` pembuka (baris 18-22):

```html
<body>
  <!-- Full-screen photo backdrop behind phone column — ref Premium-11 Kila -->
  <div class="phone-bg" aria-hidden="true"></div>

  <main class="invite">
```

- [ ] **Step 3: Tulis ulang COVER (struktur lama dipertahankan, teks baru)**

Ganti seluruh blok COVER (baris lama 23-50) dengan:

```html
    <!-- COVER — full-bleed ken burns slideshow (ref: hero overlay) -->
    <section class="cover" id="cover" aria-label="Opening invitation">
      <div class="cover-slideshow" id="coverSlideshow" aria-hidden="true">
        <div class="slide active">
          <div class="ken" style="background-image:url(assets/photos/CSA_5451.webp)"></div>
        </div>
        <div class="slide">
          <div class="ken" style="background-image:url(assets/photos/CSA_5521.webp)"></div>
        </div>
        <div class="slide">
          <div class="ken" style="background-image:url(assets/photos/CSA_5462.webp)"></div>
        </div>
      </div>
      <div class="veil"></div>
      <div class="cover-content">
        <p class="cover-kicker anim muncul-atas slow">THE WEDDING OF</p>
        <h1 class="cover-title anim muncul-atas slow" id="coverTitle">MASDA<br>&amp;<br>SALINDRI</h1>
        <p class="date anim muncul-atas slow">SABTU, 3 OKTOBER 2026</p>
        <div class="guest-card anim muncul-atas slow">
          <span class="dear">KEPADA YTH.</span>
          <strong class="guest-name" id="guestName"></strong>
        </div>
        <button class="btn anim muncul-atas slow" id="rollBtn" type="button">BUKA UNDANGAN</button>
      </div>
    </section>
```

Catatan: `#coverTitle` diberi `<br>` agar bisa pecah dua baris ala reference (JS scroll-scale tetap bekerja — elemen ada).

- [ ] **Step 4: Hapus QUOTE-carousel; tulis section OPENING (quote + amp divider)**

Ganti seluruh blok QUOTE + CAROUSEL (lama baris 52-70) dengan:

```html
    <!-- OPENING — quote overline + script divider (ref: divider ornament text) -->
    <section class="section opening cream anim muncul-atas" id="opening">
      <p class="opening-quote anim muncul-atas slow">“Berakar dalam doa, bertumbuh dalam kasih. Seperti bumi yang
        setia pada porosnya, demikian niat ini dijaga, Alam raya mempertemukan, cinta mengikat-maka berbahagialah kita,
        selamanya.”</p>
      <p class="divider anim muncul-atas slow">
        <span>MASDA</span><i class="amp-script">&amp;</i><span>SALINDRI</span>
      </p>
    </section>
```

> **HAPUS** dari HTML: `<div class="portrait-carousel">`, `.carousel-viewport`, `.carousel-track` beserta 5 `<img>` (termasuk duplikat sengaja) — carousel tidak ada di reference. Catatan AGENTS.md soal "jangan dedupe carousel img" jadi usang — plan ini menghapus seluruh block carousel.

- [ ] **Step 5: Tulis section COUPLE (kartu Bride & Groom di panel cream)**

Ganti seluruh blok COUPLE (lama baris 72-108) dengan:

```html
    <!-- COUPLE — two cream profile cards -->
    <section class="section couple">
      <article class="couple-card anim muncul-atas slow">
        <p class="eyebrow anim muncul-atas slow">The Groom</p>
        <div class="portrait anim zoom-in slow">
          <img src="assets/photos/CSA_5655.webp" alt="Masda" loading="lazy" decoding="async">
        </div>
        <h2 class="person-name anim muncul-atas slow">Masda Agus Ruswoko</h2>
        <p class="person-parents anim muncul-atas slow">Putra Pertama dari Bapak Poniman &amp; Ibu Andriyanti Juli</p>
        <a class="ig anim muncul-atas" href="https://www.instagram.com/masdaagus/" target="_blank" rel="noreferrer"
          aria-label="Instagram Masda">
          <svg viewBox="0 0 448 512" width="16" height="16" aria-hidden="true">
            <path fill="currentColor"
              d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
        </a>
      </article>
      <p class="amp-script anim muncul-atas">&amp;</p>
      <article class="couple-card anim muncul-atas slow">
        <p class="eyebrow anim muncul-atas slow">The Bride</p>
        <div class="portrait anim zoom-in slow">
          <img src="assets/photos/CSA_5686.webp" alt="Salindri" loading="lazy" decoding="async">
        </div>
        <h2 class="person-name anim muncul-atas slow">Salindri Retno Malini Kusuma Supardi</h2>
        <p class="person-parents anim muncul-atas slow">Putri Kedua dari Bapak Supardi S.M &amp; Ibu Munfa'ati</p>
        <a class="ig anim muncul-atas"
          href="https://www.instagram.com/salindrirmalini?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank" rel="noreferrer" aria-label="Instagram Salindri">
          <svg viewBox="0 0 448 512" width="16" height="16" aria-hidden="true">
            <path fill="currentColor"
              d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
          </svg>
        </a>
      </article>
    </section>
```

- [ ] **Step 6: Tulis section JOURNEY OF LOVE (timeline fase 1-5)**

Ganti seluruh blok JOURNEY (lama baris 188-238) dengan:

```html
    <!-- JOURNEY OF LOVE — timeline alternating (ref: pp-timeline 4 chapters) -->
    <section class="section dark journey" aria-label="Perjalanan cinta">
      <p class="eyebrow anim muncul-atas slow">Our Story</p>
      <h2 class="section-title anim muncul-atas slow">Journey of Love</h2>
      <div class="timeline">
        <article class="phase anim muncul-kanan slow">
          <div class="phase-photo"><img src="assets/photos/IMG_9720.webp" alt="" loading="lazy" decoding="async"></div>
          <div class="phase-body">
            <h3>Chapter One</h3>
            <p>Tak ada perkenalan panjang dalam kisah Masda dan Nini. Semuanya berawal dari satu pesan sederhana, yang
              tanpa mereka sadari menjadi pintu bagi pertemuan pertama.</p>
          </div>
        </article>
        <article class="phase anim muncul-kiri slow">
          <div class="phase-photo"><img src="assets/photos/IMG_7096.webp" alt="" loading="lazy" decoding="async"></div>
          <div class="phase-body">
            <h3>Chapter Two</h3>
            <p>Hubungan mereka berjalan seperti layang-layang di udara, kadang ditarik mendekat, kadang dilepas menjauh.
              Ada masa datang yang hangat, ada pamit yang menggantung hadir di waktu yang sama.</p>
          </div>
        </article>
        <article class="phase anim muncul-kanan slow">
          <div class="phase-photo"><img src="assets/photos/IMG_3601.webp" alt="" loading="lazy" decoding="async"></div>
          <div class="phase-body">
            <h3>Chapter Three</h3>
            <p>Dalam perjalanan itu, suara Masda dan Nini pernah saling menutup, ego pun sempat bersahut lebih keras dari
              rasa. Namun mereka memilih memperbaiki keping demi keping.</p>
          </div>
        </article>
        <article class="phase anim muncul-kiri slow">
          <div class="phase-photo"><img src="assets/photos/IMG_5105.webp" alt="" loading="lazy" decoding="async"></div>
          <div class="phase-body">
            <h3>Chapter Four</h3>
            <p>Perlahan, ego diturunkan dan doa ditinggikan yang membuat mereka berhenti menuntut, lalu memilih mengikat
              rasa percaya sebagai pijakan awal.</p>
          </div>
        </article>
        <article class="phase anim muncul-kanan slow">
          <div class="phase-photo"><img src="assets/photos/NFL00469.webp" alt="" loading="lazy" decoding="async"></div>
          <div class="phase-body">
            <h3>Chapter Five</h3>
            <p>Dan setelah kata akad terucap, cerita mereka akhirnya dimulai. Kini Masda dan Nini berjanji untuk saling
              memeluk saat lelah, menggenggam ketika ragu, dan saling menuntun.</p>
          </div>
        </article>
      </div>
    </section>
```

> `journey-photos` (2 foto arch CSA_5491/CSA_5575) DIBUANG — tidak ada padanan langsung di reference; foto masuk gallery.

- [ ] **Step 7: Tulis section SAVE THE DATE (countdown + tombol simpan)**

Ganti seluruh blok EVENTS bagian atas sampai sebelum `.event-card` (lama baris 110-118 + title) — praktis ganti seluruh section events lama menjadi dua section: `save-date` (di sini) dan `event` (Step 8). Ganti blok lama (baris 110-143) dengan:

```html
    <!-- SAVE THE DATE + countdown -->
    <section class="section cream save-date">
      <p class="eyebrow anim muncul-atas slow">Save The Date</p>
      <h2 class="section-title anim muncul-atas slow">Sabtu, 3 Oktober 2026</h2>
      <div class="countdown anim zoom-in" id="countdown" aria-label="Countdown menuju acara">
        <div><strong>00</strong><span>Hari</span></div>
        <div><strong>00</strong><span>Jam</span></div>
        <div><strong>00</strong><span>Menit</span></div>
        <div><strong>00</strong><span>Detik</span></div>
      </div>
      <p class="countdown-caption anim muncul-atas slow">Menghitung hari menuju hari bahagia kami</p>
      <button class="btn btn-ghost anim muncul-atas slow" id="saveDateBtn" type="button">Simpan Tanggal</button>
    </section>
```

- [ ] **Step 8: Tulis section EVENT CARDS (Akad + Resepsi)**

Ganti blok `.event-card` lama (baris 119-142) dengan dua kartu baru di panel gelap:

```html
    <!-- EVENT — Akad & Resepsi cards -->
    <section class="section dark event">
      <p class="eyebrow anim muncul-atas slow">Wedding Event</p>
      <div class="event-card anim muncul-atas slow">
        <div class="event-photo"><img src="assets/photos/NFL00503.webp" alt="Akad Nikah" loading="lazy" decoding="async"></div>
        <div class="event-body">
          <h3>Akad Nikah</h3>
          <p class="event-time">Sabtu, 3 Oktober 2026 · 09.00 WIB</p>
          <p class="event-address">Ds. Wonokupang RT.08/04 Balongbendo Sidoarjo</p>
          <a class="btn btn-ghost"
            href="https://www.google.com/maps/place/Klinik+Medika+Utama/@-7.414117,112.5206333,3a,75y,133.44h,70.95t/data=!3m7!1e1!3m5!1swydhKA6mmNvf5bfdmgir5Q!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D19.050531623128222%26panoid%3DwydhKA6mmNvf5bfdmgir5Q%26yaw%3D133.43587425724184!7i16384!8i8192!4m7!3m6!1s0x2e780fc8c069f6af:0xb3290fe5b5302e1e!8m2!3d-7.4142804!4d112.5204139!10e5!16s%2Fg%2F11h_v5y9f1?entry=ttu&g_ep=EgoyMDI2MDgwOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank" rel="noreferrer">Buka Maps</a>
        </div>
      </div>
      <div class="event-card anim muncul-atas slow">
        <div class="event-photo"><img src="assets/photos/NFL00534.webp" alt="Resepsi" loading="lazy" decoding="async"></div>
        <div class="event-body">
          <h3>Resepsi</h3>
          <p class="event-time">Sabtu, 3 Oktober 2026 · 14.00 WIB</p>
          <p class="event-address">Ds. Wonokupang RT.08/04 Balongbendo Sidoarjo</p>
          <a class="btn btn-ghost"
            href="https://www.google.com/maps/place/Klinik+Medika+Utama/@-7.414117,112.5206333,3a,75y,133.44h,70.95t/data=!3m7!1e1!3m5!1swydhKA6mmNvf5bfdmgir5Q!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D19.050531623128222%26panoid%3DwydhKA6mmNvf5bfdmgir5Q%26yaw%3D133.43587425724184!7i16384!8i8192!4m7!3m6!1s0x2e780fc8c069f6af:0xb3290fe5b5302e1e!8m2!3d-7.4142804!4d112.5204139!10e5!16s%2Fg%2F11h_v5y9f1?entry=ttu&g_ep=EgoyMDI2MDgwOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank" rel="noreferrer">Buka Maps</a>
        </div>
      </div>
    </section>
```

> Section LIVE STREAMING lama (komentar) dihapus permanen — tidak ada di reference demo & sudah lama di-disable.

- [ ] **Step 9: Tulis section GALLERY + pindahkan di bawah event, lalu WRAPPER RSVP/GIFT/CLOSING**

Ganti seluruh blok GALLERY lama (baris 241-245) dengan gallery yang sama hook-nya, lalu tambahkan section dress-code dan pindahkan urutan. **Urutan section final di `<main>`:**
`cover` → `opening` → `couple` → `journey` → `save-date` → `event` → `gallery` → `dress-code` → `gift` → `rsvp/wishes` → `closing`.

Edit blok lama:

```html
    <!-- GALLERY — justified grid -->
    <section class="section dark gallery">
      <p class="eyebrow anim muncul-atas slow">Our Moment</p>
      <h2 class="section-title anim muncul-atas slow">Gallery</h2>
      <div class="gallery-grid" id="galleryGrid"></div>
    </section>
```

- [ ] **Step 10: Tulis section DRESS CODE (swatch 5 warna reference) + GIFT**

Ganti blok GIFT lama (baris 159-186) menjadi dua section: dress-code lalu gift. Teks gift memakai `<span data-guest>` seperti semula:

```html
    <!-- DRESS CODE — 5 swatches (ref palette) -->
    <section class="section cream dress-code">
      <p class="eyebrow anim muncul-atas slow">A Guide To</p>
      <h2 class="section-title anim muncul-atas slow">Dress Codes</h2>
      <p class="body-copy anim muncul-atas slow">Kami mengundang tamu undangan untuk mengenakan palet warna berikut
        untuk keseragaman foto:</p>
      <div class="swatches anim muncul-atas slow" role="list">
        <div class="swatch" style="--sw:#EFE8D8"><span></span><small>Cream</small></div>
        <div class="swatch" style="--sw:#E6D2B9"><span></span><small>Champagne</small></div>
        <div class="swatch" style="--sw:#E4ADA8"><span></span><small>Blush</small></div>
        <div class="swatch" style="--sw:#D0A77B"><span></span><small>Tan</small></div>
        <div class="swatch" style="--sw:#735B3F"><span></span><small>Bronze</small></div>
      </div>
    </section>

    <!-- GIFT -->
    <section class="section dark gift">
      <p class="eyebrow anim muncul-atas slow">Wedding Gift</p>
      <h2 class="section-title anim muncul-atas slow">Wedding Gift</h2>
      <p class="body-copy anim muncul-atas slow">Kehadiran <span data-guest>Salindri</span> merupakan sebuah doa serta
        rasa syukur bagi kami. Jika memberi adalah bentuk doa dan cinta kasih, Anda dapat memberi kado secara cashless.</p>
      <button class="btn btn-ghost anim muncul-atas slow" id="giftToggle" type="button">Lihat Rekening</button>
      <div class="gift-list" id="giftList" hidden>
        <article class="bank-card anim muncul-atas slow">
          <img src="https://bemybeyonce.id/wp-content/uploads/2025/08/Bank_Mandiri_logo_2016.svg.png" alt="Mandiri">
          <span>No. Rekening</span>
          <strong>1410017152448</strong>
          <p>Salindri Retno Malini Kusuma Supardi</p>
          <button type="button" data-copy="1410017152448">Copy</button>
        </article>
        <article class="bank-card anim muncul-atas slow">
          <img
            src="https://www.bca.co.id/-/media/Feature/Card/List-Card/Tentang-BCA/Brand-Assets/Logo-BCA/Logo-BCA_Biru.png"
            alt="BCA">
          <span>No. Rekening</span>
          <strong>8221639430</strong>
          <p>Masda Agus Ruswoko</p>
          <button type="button" data-copy="8221639430">Copy</button>
        </article>
        <a class="btn btn-ghost anim muncul-atas slow"
          href="https://wa.me/6285956255121?text=Halo%2C%20saya%20akan%20mengirim%20kado%20untuk%20pernikahan%20Masda%20%26%20Salindri"
          target="_blank" rel="noreferrer">Konfirmasi Kado via WhatsApp</a>
      </div>
    </section>
```

> Nomor WA `6285956255121` (placeholder Attarivitation) — tandai sebagai placeholder agar diganti konten asli.

- [ ] **Step 11: Tulis section WISHES/RSVP + CLOSING + footer**

Ganti blok RSVP + WISHES lama (baris 247-264) dengan form bergaya reference (tambah dropdown jumlah tamu, radio Hadir/Tidak hadir). **PENTING — kolom baru di Supabase:** plan ini menambah field `jumlah`; kalau kolom tak ada, insert gagal → perlu create kolom `jumlah` (text) di tabel `rsvp`, ATAU batalkan dropdown. Default: tetap pakai `select` kehadiran + textarea seperti lama (kompatibel skema sekarang). Untuk keselamatan, ikuti versi kompatibel berikut:

```html
    <!-- RSVP + WISHES -->
    <section class="section cream wishes">
      <p class="eyebrow anim muncul-atas slow">RSVP</p>
      <h2 class="section-title anim muncul-atas slow">RSVP</h2>
      <p class="body-copy anim muncul-atas slow">Konfirmasi Kehadiran &amp; Ucapan Selamat</p>
      <form class="wish-form anim muncul-atas slow" id="rsvpForm" aria-label="RSVP &amp; Wishes Masda &amp; Salindri">
        <label>Nama<input type="text" name="nama" required maxlength="100" placeholder="Nama Anda"></label>
        <label>Konfirmasi Kehadiran
          <select name="kehadiran" required>
            <option selected>Hadir</option>
            <option>Tidak hadir</option>
          </select>
        </label>
        <label>Ucapan &amp; Doa<textarea name="ucapan" required maxlength="500"
            placeholder="Ucapkan sesuatu...."></textarea></label>
        <button class="btn btn-ghost" type="submit">Kirim</button>
      </form>
      <div class="wish-list anim muncul-atas slow" id="wishList"></div>
    </section>
```

Ganti blok CLOSING lama (baris 266-272) dengan closing berpita foto + footer:

```html
    <!-- CLOSING -->
    <section class="section closing">
      <p class="eyebrow anim muncul-atas slow">Thank You</p>
      <h2 class="section-title anim muncul-atas slow">Terima Kasih</h2>
      <p class="body-copy anim muncul-atas slow">Merupakan sebuah kehormatan dan kebahagiaan bagi Kami jika
        Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi Kami.</p>
      <p class="divider anim muncul-atas slow">
        <span>MASDA</span><i class="amp-script">&amp;</i><span>SALINDRI</span>
      </p>
      <p class="closing-names anim zoom-in slow">Sabtu, 3 Oktober 2026</p>
    </section>

    <footer class="foot">
      <p>Digital Wedding Invitation · Masda &amp; Salindri</p>
    </footer>
  </main>
```

- [ ] **Step 12: Verifikasi struktur & selector JS**

Run:
```bash
python3 - <<'PY'
import re
html = open('index.html').read()
hooks = ['guestName','coverSlideshow','coverTitle','rollBtn','opening','countdown','galleryGrid','giftToggle','giftList','lightbox','toast','musicToggle','bgMusic','wishList','rsvpForm','closeLightbox','prevLightbox','nextLightbox','lightboxCounter','cover','carouselTrack']
for h in hooks:
    print(h, 'OK' if ('id="%s"' % h) in html else 'MISSING')
print('carouselTrack masih ada?', 'carouselTrack' in html)
PY
```
Expected: semua `OK`; `carouselTrack` → `False`. Tidak perlu server untuk cek ini.

- [ ] **Step 13: Commit**

```bash
git add index.html
git commit -m "feat: restruktur index.html ke layout phone-mockup ala Kila"
```

---

### Task 2: CSS dasar — phone frame, palet, tipografi, cover, section dasar

Tulis ulang `style.css` dari nol: token warna/font, `.phone-bg` + `.invite` phone-column, `.cover` (ken burns), `.section` dasar terang/gelap, tipografi (eyebrow/section-title/body/divider), `.btn`. Bump cache CSS. Section-seksi lain (couple, timeline, countdown, event, gallery, dress-code, gift, wishes, closing, kontrol floating) masuk task 3-6 — CSS ini akan "menggantung" tanpa dipakai sampai task tsb (HTML sudah menyediakan class-nya di Task 1).

**Files:**
- Rewrite: `style.css`
- Modify: `index.html:15` (bump `style.css?v=` → `69c9e1c`)

**Interfaces:**
- Produces: token CSS (dipakai seluruh task CSS): `--cream:#FFFBF8`, `--ink:#101010`, `--beige:#929088`, `--dark:#242424`, `--page:#1A1A1A`, `--grey:#9A9A9C`, `--serif`, `--script`, `--sans`; kelas `.btn.btn-ghost`, `.eyebrow`, `.section-title`, `.body-copy`, `.divider`, `.amp-script`, `.cream`, `.dark`, `.anim.*`.

- [ ] **Step 1: Tulis ulang style.css (bagian 1: token, frame, base, cover)**

Run (menulis file baru penuh — isi di bawah dibagi 3 bagian karena panjang; bagian 1 ini + lanjut Step 2-3):

```bash
cat > style.css <<'CSSEOF'
@font-face{
  font-family:"Candlefish";
  src:url(fonts/Candlefish.woff2) format("woff2"),
      url(fonts/Candlefish.woff) format("woff"),
      url(fonts/Candlefish.ttf) format("truetype");
  font-weight:300 400;font-style:normal;font-display:swap;
}
:root{
  --serif:"New York","Cormorant Garamond","Times New Roman",serif;
  --script:"Candlefish",cursive;
  --sans:"Inter",system-ui,-apple-system,sans-serif;
  --accent:"Bitter",Georgia,serif;
  --page:#1A1A1A;
  --cream:#FFFBF8;
  --beige:#929088;
  --dark:#242424;
  --ink:#101010;
  --grey:#9A9A9C;
  --white:#FFF;
  --radius:8px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html.lock,html.lock body{overflow:hidden;height:100%}
body{
  margin:0;background:var(--page);color:var(--white);
  font:300 14px/1.5 var(--sans);
  -webkit-font-smoothing:antialiased;
}
button,input,select,textarea{font:inherit;color:inherit}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}

/* Phone backdrop — fixed full-screen photo (ref: bg column UW-Kila-Arnold-14) */
.phone-bg{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:
    linear-gradient(rgba(26,26,26,.45),rgba(26,26,26,.55)),
    url(assets/photos/CSA_5451.webp) center/cover no-repeat;
}

/* Phone column */
.invite{
  position:relative;z-index:1;
  width:min(100%,420px);margin:0 auto;
  background:var(--cream);color:var(--ink);
  min-height:100vh;
  box-shadow:0 0 60px rgba(0,0,0,.6);
}

/* Base section */
.section{
  position:relative;padding:56px 24px;
  display:flex;flex-direction:column;align-items:center;
  text-align:center;overflow:hidden;
}
.section > *{position:relative;z-index:1}
.section.cream{background:var(--cream);color:var(--ink)}
.section.dark{background:var(--dark);color:var(--white)}

/* Typography */
.eyebrow{
  margin:0 0 10px;
  font:400 12px/1.2 var(--sans);
  letter-spacing:4px;text-transform:uppercase;color:inherit;opacity:.85;
}
.section-title{
  margin:0 0 16px;
  font:400 30px/1.15 var(--serif);
  letter-spacing:1px;text-transform:uppercase;color:inherit;
}
.body-copy{
  margin:0 0 6px;max-width:340px;
  font:300 14px/1.7 var(--sans);color:inherit;
}

/* Divider ornament — MASDA & SALINDRI (ref divider text NewYork 18px) */
.divider{
  display:flex;align-items:center;justify-content:center;gap:14px;
  margin:18px 0 0;
  font:400 15px var(--sans);letter-spacing:4px;color:inherit;
}
.divider span{text-transform:uppercase}
.divider .amp-script{font:400 30px/1 var(--script);letter-spacing:0}

/* Buttons — ref: transparent, 1px border, radius 8, uppercase, hover fill */
.btn{
  display:inline-flex;align-items:center;justify-content:center;
  min-height:32px;padding:13px 16px;margin-top:14px;
  border:1px solid currentColor;border-radius:var(--radius);
  background:transparent;color:inherit;
  font:500 13px/1 var(--sans);letter-spacing:2px;text-transform:uppercase;
  cursor:pointer;transition:background .3s,color .3s;
}
.btn:hover{background:currentColor}
.btn.btn-ghost{color:var(--ink);border-color:var(--ink)}
.btn.btn-ghost:hover{background:var(--ink);color:var(--cream)}

/* ===== COVER ===== */
.cover{
  position:relative;min-height:100vh;
  display:flex;align-items:flex-end;justify-content:center;
  padding:60px 24px 70px;text-align:center;overflow:hidden;
  background:#000;
}
.cover-slideshow,.cover-slideshow .slide,.veil{position:absolute;inset:0}
.cover-slideshow .slide{opacity:0;transition:opacity 2.25s ease;z-index:0}
.cover-slideshow .slide.active{opacity:1;z-index:1}
.cover-slideshow .ken{
  width:100%;height:100%;background-size:cover;background-position:center;
  transform:scale(1);transition:transform 10s linear;
}
.cover-slideshow .slide.active .ken{transform:scale(1.3)}
.veil{z-index:2;background:linear-gradient(rgba(0,0,0,.25) 25%,rgba(0,0,0,.92) 82%)}
.cover-content{position:relative;z-index:3;width:100%;color:var(--white)}
.cover-kicker{
  margin:0 0 14px;
  font:400 13px/1 var(--sans);letter-spacing:8px;text-transform:uppercase;color:#fff;
}
.cover-title{
  margin:0 0 16px;
  font:500 34px/1.15 var(--serif);
  letter-spacing:2px;text-transform:uppercase;color:#fff;
  text-shadow:0 8px 18px rgba(0,0,0,.4);
  transform-origin:center center;will-change:transform;
}
.cover .date{
  margin:0 0 26px;
  font:400 13px/1 var(--sans);letter-spacing:4px;text-transform:uppercase;color:#fff;
}
.guest-card{margin:0 0 20px}
.guest-card .dear{
  display:block;font:400 11px/1 var(--sans);
  letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,.8);
}
.guest-card .guest-name{
  display:block;margin-top:6px;
  font:400 18px/1.3 var(--accent);letter-spacing:1px;color:#fff;
}
CSSEOF
```

- [ ] **Step 2: Lanjut style.css (bagian 2: couple, journey, save-date, event)**

Run:

```bash
cat >> style.css <<'CSSEOF'

/* ===== OPENING ===== */
.opening{gap:0}
.opening-quote{
  margin:0;max-width:340px;
  font:300 14px/1.8 var(--accent);letter-spacing:.3px;color:inherit;
}
.opening .divider{margin-top:22px}

/* ===== COUPLE — profile cards on cream ===== */
.couple{gap:6px;padding-top:60px}
.couple-card{
  display:flex;flex-direction:column;align-items:center;gap:12px;
  width:100%;max-width:340px;padding:0 0 8px;
}
.couple-card + .amp-script{
  margin:6px 0;font:400 42px/1 var(--script);color:var(--beige);
}
.eyebrow{margin-bottom:4px}
.portrait{
  width:min(82%,240px);aspect-ratio:2/3;
  border-radius:14px;overflow:hidden;margin:14px 0 6px;
}
.portrait img{width:100%;height:100%;object-fit:cover}
.person-name{
  margin:4px 0 0;
  font:400 28px/1.15 var(--script);letter-spacing:.4px;color:inherit;
}
.person-parents{margin:0;font:300 13px/1.6 var(--sans);color:inherit;opacity:.8;max-width:300px}
.ig{
  display:inline-flex;align-items:center;justify-content:center;
  width:38px;height:38px;margin-top:4px;
  border:1px solid rgba(16,16,16,.4);border-radius:50%;color:inherit;
}
.ig svg{display:block}

/* ===== JOURNEY OF LOVE — vertical timeline ===== */
.journey{gap:0;padding-top:64px}
.journey .section-title{margin-bottom:30px}
.timeline{
  position:relative;width:100%;max-width:360px;
  display:flex;flex-direction:column;gap:22px;
}
.timeline::before{
  content:"";position:absolute;top:6px;bottom:6px;left:50%;
  width:1px;background:rgba(255,255,255,.35);
}
.phase{
  display:flex;align-items:flex-start;gap:14px;width:100%;
}
.phase:nth-child(even){flex-direction:row-reverse;text-align:right}
.phase-photo{
  width:42%;flex:0 0 42%;border-radius:12px;overflow:hidden;
}
.phase-photo img{width:100%;height:180px;object-fit:cover}
.phase-body{flex:1;min-width:0;padding-top:4px}
.phase h3{
  margin:0 0 8px;font:400 15px/1.2 var(--serif);
  letter-spacing:2px;text-transform:uppercase;color:inherit;
}
.phase p{margin:0;font:300 13px/1.7 var(--sans);color:inherit;opacity:.85}

/* ===== SAVE THE DATE ===== */
.save-date{gap:0}
.save-date .section-title{text-transform:none;letter-spacing:0}
.countdown{
  display:grid;grid-template-columns:repeat(4,1fr);gap:8px;
  width:100%;max-width:360px;margin:10px 0 6px;
  padding:14px 6px;border-radius:12px;
  background:var(--beige);color:var(--cream);
}
.countdown div{display:flex;flex-direction:column;align-items:center;gap:6px}
.countdown strong{font:400 32px/1 var(--serif);letter-spacing:1px}
.countdown span{font:400 11px/1 var(--sans);letter-spacing:2px;text-transform:uppercase;opacity:.9}
.countdown-caption{margin:8px 0 0;font:300 13px var(--sans);opacity:.75}
.save-date .btn{margin-top:18px}

/* ===== EVENT ===== */
.event{gap:18px;padding-top:64px}
.event .section-title{margin-bottom:8px}
.event-card{
  display:flex;flex-direction:column;align-items:stretch;
  width:100%;max-width:360px;overflow:hidden;
  border:1px solid rgba(255,255,255,.22);
  border-radius:14px;background:rgba(255,255,255,.04);
}
.event-photo{width:100%;height:200px;overflow:hidden}
.event-photo img{width:100%;height:100%;object-fit:cover}
.event-body{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:18px 18px 20px;text-align:left}
.event-body h3{
  margin:0;font:400 26px/1.1 var(--script);color:var(--cream);
}
.event-time{margin:0;font:400 13px/1.4 var(--sans);letter-spacing:.4px;color:inherit;opacity:.9}
.event-address{margin:0;font:300 12px/1.5 var(--sans);opacity:.65}
.event-body .btn{margin-top:8px;align-self:flex-start;color:var(--cream);border-color:rgba(255,255,255,.85)}
.event-body .btn:hover{background:var(--cream);color:var(--ink)}
CSSEOF
```

- [ ] **Step 3: Lanjut style.css (bagian 3: gallery, dress-code, gift, wishes, closing, footer)**

Run:

```bash
cat >> style.css <<'CSSEOF'

/* ===== GALLERY — justified (ref e-gallery radius 12, gap 10) ===== */
.gallery{padding-top:64px}
.gallery-grid{
  display:grid;grid-template-columns:repeat(2,1fr);
  grid-auto-rows:160px;gap:10px;
  width:100%;max-width:360px;margin-top:20px;
}
.gallery-grid button{
  position:relative;display:block;width:100%;padding:0;margin:0;
  border:0;border-radius:12px;overflow:hidden;background:transparent;cursor:pointer;
}
.gallery-grid button:first-child{grid-column:1 / -1;grid-row:span 2}
.gallery-grid img{width:100%;height:100%;object-fit:cover;display:block}
.gallery-grid button::after{
  content:"";position:absolute;inset:0;background:rgba(0,0,0,0);transition:background .4s;
}
.gallery-grid button:hover::after{background:rgba(0,0,0,.45)}

/* ===== DRESS CODE ===== */
.dress-code{gap:0}
.dress-code .body-copy{margin-bottom:20px}
.swatches{
  display:flex;justify-content:center;gap:18px;width:100%;max-width:360px;
}
.swatch{display:flex;flex-direction:column;align-items:center;gap:8px}
.swatch span{
  width:52px;height:52px;border-radius:50%;
  background:var(--sw,#ccc);box-shadow:inset 0 0 0 1px rgba(16,16,16,.12);
}
.swatch small{font:400 10px var(--sans);letter-spacing:1px;text-transform:uppercase;opacity:.7}

/* ===== GIFT ===== */
.gift{gap:0;padding-top:64px}
.gift .body-copy{margin-bottom:8px}
.gift-list[hidden]{display:none!important}
.gift-list{display:flex;flex-direction:column;gap:14px;width:100%;max-width:360px;margin-top:8px}
.bank-card{
  display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:22px 16px;border-radius:14px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.05);color:var(--cream);
}
.bank-card img{height:30px;object-fit:contain;margin-bottom:4px}
.bank-card span{font:300 11px var(--sans);letter-spacing:2px;text-transform:uppercase;opacity:.7}
.bank-card strong{font:400 20px var(--serif);letter-spacing:2px}
.bank-card p{margin:0;font:300 13px var(--sans);opacity:.85;text-align:center}
.bank-card button{
  margin-top:8px;padding:8px 20px;
  border:1px solid rgba(255,255,255,.8);border-radius:var(--radius);
  background:transparent;color:var(--cream);
  font:500 12px var(--sans);letter-spacing:2px;text-transform:uppercase;cursor:pointer;
}
.bank-card button:hover{background:var(--cream);color:var(--ink)}
.gift-list > .btn{color:var(--cream);border-color:rgba(255,255,255,.8);margin-top:6px}
.gift-list > .btn:hover{background:var(--cream);color:var(--ink)}

/* ===== WISHES / RSVP ===== */
.wishes{gap:0;padding-top:64px}
.wish-form{
  display:flex;flex-direction:column;gap:14px;
  width:100%;max-width:360px;text-align:left;margin-top:10px;
}
.wish-form label{
  display:flex;flex-direction:column;gap:6px;
  font:400 12px var(--sans);letter-spacing:1px;text-transform:uppercase;opacity:.8;
}
.wish-form input,.wish-form select,.wish-form textarea{
  width:100%;padding:12px 14px;
  border:1px solid rgba(16,16,16,.35);border-radius:6px;
  background:#fff;color:var(--ink);
  font:300 14px var(--sans);text-transform:none;letter-spacing:0;
}
.wish-form textarea{min-height:90px;resize:vertical}
.wish-form .btn{align-self:center;margin-top:6px}
.wish-list{
  display:flex;flex-direction:column;gap:10px;
  width:100%;max-width:360px;margin-top:24px;
}
.wish-item{
  padding:14px 16px;border-radius:12px;text-align:left;
  border:1px solid rgba(16,16,16,.12);background:rgba(16,16,16,.045);
}
.wish-item strong{display:block;margin-bottom:4px;font:400 15px var(--accent);color:inherit}
.wish-item span{font:300 13px/1.6 var(--sans);color:inherit;opacity:.85}

/* ===== CLOSING ===== */
.closing{
  min-height:70vh;justify-content:center;color:var(--white);
  background:
    linear-gradient(rgba(16,16,16,.55),rgba(16,16,16,.85)),
    url(assets/photos/CSA_5554.webp) center/cover;
}
.closing .divider .amp-script{color:rgba(255,255,255,.85)}
.closing-names{margin:8px 0 0;font:400 14px var(--sans);letter-spacing:4px;text-transform:uppercase;opacity:.9}
.foot{
  padding:26px 20px;text-align:center;
  background:var(--dark);color:rgba(255,255,255,.55);
  font:300 11px var(--sans);letter-spacing:1px;
}
.foot p{margin:0}
CSSEOF
```

- [ ] **Step 4: Lanjut style.css (bagian 4: animasi + lightbox + toast + musik + media query)**

Run:

```bash
cat >> style.css <<'CSSEOF'

/* ===== ENTRANCE ANIMS — keep util contract .anim/.active (script.js) ===== */
.anim{
  opacity:0;
  transition-property:transform,opacity;
  transition-timing-function:ease;
  transition-duration:1.25s;
  position:relative;z-index:1;
}
.anim.active{opacity:1}
.anim.slow{transition-duration:1s}
.anim.very-slow{transition-duration:2s}
.anim.muncul-atas{transform:translateY(50px);transition-delay:.15s}
.anim.muncul-atas.active{transform:translateY(0)}
.anim.muncul-bawah{transform:translateY(-50px);transition-delay:.3s}
.anim.muncul-bawah.active{transform:translateY(0)}
.anim.muncul-kiri{transform:translateX(-50px) scale(.95);transition-delay:.4s}
.anim.muncul-kiri.active{transform:translateX(0) scale(1)}
.anim.muncul-kanan{transform:translateX(50px) scale(.95);transition-delay:.5s}
.anim.muncul-kanan.active{transform:translateX(0) scale(1)}
.anim.zoom-in{transform:scale(.7);transition-delay:.2s}
.anim.zoom-in.active{transform:scale(1)}
.cover .anim{transition-delay:.15s}
.cover .anim.active{opacity:1}

/* Lightbox */
#lightbox{border:0;padding:0;background:transparent;max-width:92vw;max-height:92vh}
#lightbox::backdrop{background:rgba(0,0,0,.9)}
#lightbox img{max-width:92vw;max-height:88vh;object-fit:contain;border-radius:8px}
#lightbox button{
  position:fixed;z-index:10;border:0;background:transparent;color:#fff;cursor:pointer;
}
#closeLightbox{top:12px;right:16px;font-size:34px}
#prevLightbox,#nextLightbox{top:50%;transform:translateY(-50%);font-size:54px;line-height:1;padding:8px 14px}
#prevLightbox{left:8px}
#nextLightbox{right:8px}
#lightboxCounter{
  position:fixed;top:20px;left:18px;z-index:10;
  color:#fff;font:300 13px var(--sans);opacity:.8;
}
.toast{
  position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);
  padding:10px 18px;border-radius:8px;background:rgba(16,16,16,.9);color:#fff;
  font:300 13px var(--sans);opacity:0;pointer-events:none;transition:.3s;z-index:60;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* Music floating button */
.music-btn{
  position:fixed;right:16px;bottom:24px;z-index:50;
  width:52px;height:52px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  border:1px solid rgba(255,255,255,.6);
  background:rgba(26,26,26,.55);color:var(--cream);cursor:pointer;
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
}
.music-btn[hidden]{display:none}
.eq{display:flex;align-items:flex-end;gap:3px;height:18px}
.eq i{width:4px;border-radius:2px;background:currentColor;animation:eq-bounce 1s ease-in-out infinite;transform-origin:bottom}
.eq i:nth-child(1){height:60%;animation-duration:.7s}
.eq i:nth-child(2){height:100%;animation-duration:.45s}
.eq i:nth-child(3){height:75%;animation-duration:.9s}
@keyframes eq-bounce{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
.music-btn:not([aria-pressed="true"]) .eq{display:none}
.eq-pause{display:none;gap:4px}
.eq-pause i{width:4px;height:18px;border-radius:2px;background:currentColor}
.music-btn[aria-pressed="true"] .eq{display:flex}
.music-btn[aria-pressed="true"] .eq-pause{display:none}
.music-btn:not([aria-pressed="true"]) .eq-pause{display:flex}

@media (max-width:430px){
  .cover-title{font-size:29px}
  .section{padding:48px 20px}
  .person-name{font-size:26px}
  .section-title{font-size:26px}
  .countdown strong{font-size:28px}
  .gallery-grid{grid-auto-rows:130px}
  .phase-photo img{height:150px}
}
CSSEOF
```

- [ ] **Step 5: Bump style.css cache & verifikasi**

Di `index.html`, ganti `style.css?v=69c9e1b` → `style.css?v=69c9e1c`.

Verifikasi CSS valid (brace seimbang) & hook class tak hilang:
```bash
node -e "const s=require('fs').readFileSync('style.css','utf8');const o=(s.match(/{/g)||[]).length,c=(s.match(/}/g)||[]).length;console.log('braces',o,c,o===c?'OK':'MISMATCH')" 2>/dev/null || python3 -c "print('node unavailable — cek manual nanti')"
python3 - <<'PY'
css=open('style.css').read()
for k in ['.invite','.phone-bg','.cover-slideshow','#countdown','.timeline','.phase','.gallery-grid','.bank-card','.wish-form','.music-btn','.anim.muncul-atas','.closing','#toast','#lightbox']:
    print(k, 'OK' if k in css else 'MISSING')
PY
```
Expected: braces equal & semua `OK`.

- [ ] **Step 6: Verifikasi visual manual**

Run: `python3 -m http.server` → buka `http://localhost:8000` (lebar >430px dan ≤430px).
Expected:
- Latar foto fixed penuh layar; kolom cream 420px di tengah.
- Cover slideshow + ken burns jalan; tombol "BUKA UNDANGAN" (gate scroll aktif: halaman terkunci).
- Klik tombol → scroll ke `#opening`, animasi entrance jalan, musik mulai (kalau autoplay diizinkan; kalau tidak, tombol musik muncul — normal).
- Section couple/journey/countdown/event/gallery/dress-code/gift/wishes/closing tampil berurutan, teks konten benar, tanpa error console.

- [ ] **Step 7: Commit**

```bash
git add style.css index.html
git commit -m "feat: css dasar phone-mockup — palet cream/dark, tipografi serif+inter, cover & section base"
```

---

### Task 3: JS — bersihkan carousel, tambah handler save-date & countdown label, bump cache

`script.js` dirapikan: hapus blok carousel quote; sisakan gate cover, slideshow ken burns, title scroll FX, countdown, toast/copy, RSVP, musik, gallery, observer. Tambah tombol `#saveDateBtn` (simpan tanggal → Google Calendar / clipboard tanggal). Tidak ada perubahan kontrak `.anim`. Cache-bump.

**Files:**
- Modify: `script.js`
- Modify: `index.html` (bump `script.js?v=` → `69c9e1d`)

**Interfaces:**
- Produces: handler `#saveDateBtn` → menyalin string "Sabtu, 3 Oktober 2026" ke clipboard lalu `showToast('Tanggal disalin — simpan di kalender Anda')`.

- [ ] **Step 1: Hapus blok carousel quote dari script.js**

Di `script.js`, hapus seluruh blok antara komentar `/* ===== Quote carousel ...` sampai (eksklusif) `/* ===== Countdown ===== */` — baris 62-93 (deklarasi `const track ...` sampai `setInterval(advanceCarousel, 2250);`). Jangan sentuh blok countdown di bawahnya.

- [ ] **Step 2: Tambah handler #saveDateBtn setelah blok countdown**

Setelah `setInterval(updateCountdown, 1000);` tambahkan:

```js
/* Save the date — salin tanggal ke clipboard (ref SIMPAN TANGGAL) */
const saveDateBtn = document.querySelector('#saveDateBtn');
saveDateBtn?.addEventListener('click', async () => {
  const text = 'Sabtu, 3 Oktober 2026 — Pernikahan Masda & Salindri';
  try {
    await navigator.clipboard.writeText(text);
    showToast('Tanggal disalin — catat di kalender Anda!');
  } catch {
    showToast('Sabtu, 3 Oktober 2026');
  }
});
```

- [ ] **Step 3: Update komentar header JS (hapus referensi carousel)**

Di komentar `/* ===== Quote carousel ...` yang tersisa & komentar atas `script.js` yang menyebut carousel/duplikat, sesuaikan teks agar tak menyebut elemen yang sudah dihapus. Nilai magic ken burns (1250/2250/10s) di blok cover TIDAK diubah.

- [ ] **Step 4: Bump script.js cache & verifikasi**

Di `index.html`, ganti `script.js?v=69c9e17` → `script.js?v=69c9e1d`.

Verifikasi sintaks JS:
```bash
node --check script.js && echo "JS syntax OK"
```
(atau `python3 -c "import subprocess,sys; subprocess.run(['node','--check','script.js'])"` — kalau node tak ada, buka di browser dan cek console.)

- [ ] **Step 5: Verifikasi manual**

Run: `python3 -m http.server` → buka `http://localhost:8000`. Expected: tidak ada error console (khususnya `carouselTrack is null`), countdown menampilkan angka & label Hari/Jam/Menit/Detik, klik "Simpan Tanggal" → toast muncul, RSVP/copy/gallery/musik tetap jalan.

- [ ] **Step 6: Commit**

```bash
git add script.js index.html
git commit -m "feat: hapus carousel quote, tambah save-date button, countdown label id"
```

---

### Task 4: Live-streaming section (opsional ON) + dress-code & WA placeholder check + AGENTS.md

Menyisipkan kembali section LIVE WEDDING (konten asli yang tadinya dikomentari) jika diinginkan, memastikan tombol WA pakai nomor yang benar, dan memperbarui `AGENTS.md` agar tidak lagi menyebut carousel/duplikat (sudah dihapus) dan mencatat struktur baru + nomor placeholder yang perlu diganti.

**Files:**
- Modify: `index.html` (sisip section live — jika toggle ON)
- Modify: `AGENTS.md` (hapus gotcha carousel; catat struktur & placeholder WA)
- No cache bump (konten HTML saja tidak butuh, tapi tetap bump jika seksi ditambah — amannya bump sekali di task ini)

**Interfaces:**
- Consumes: section CREAM/DARK existing classes (Task 1)

- [ ] **Step 1: (Toggle default OFF) Sisipkan section LIVE WEDDING**

Kalau disetujui ON, sisipkan tepat setelah `</section>` gallery dan sebelum `<!-- DRESS CODE`:

```html
    <!-- LIVE WEDDING -->
    <section class="section cream live">
      <p class="eyebrow anim muncul-atas slow">Live Wedding</p>
      <h2 class="section-title anim muncul-atas slow">Live Streaming</h2>
      <p class="body-copy anim muncul-atas slow">Kami mengundang Bapak/Ibu/Saudara/i yang tidak bisa hadir secara
        langsung untuk tetap menyaksikan momen spesial ini melalui siaran live virtual.</p>
      <a class="btn anim muncul-atas slow"
        href="https://www.instagram.com/rilymakeup?igsh=MXYyZTR3M2o4bDJjMQ=="
        target="_blank" rel="noreferrer">Join Live</a>
    </section>
```
+ tambah CSS `.live .btn{margin-top:16px}` di Task 4 style.css & bump. **Jika OFF, lewati step ini.**

- [ ] **Step 2: Verifikasi nomor WA placeholder**

`grep -n "wa.me" index.html`. Nomor `6285956255121` adalah placeholder demo Attarivitation. Ganti dengan nomor konten asli bila tersedia; kalau belum, biarkan & tandai TODO di AGENTS.md.

- [ ] **Step 3: Perbarui AGENTS.md**

Hapus baris gotcha: *"`script.js` carousel clones 3 real images… do not dedupe"* dan *"Comments in script.js reference Elementor/WeddingPress…"* diganti ringkasan baru. Tambahkan catatan:

```markdown
- Layout ala tema "Premium 11 – Kila": kolom phone (`min(100%,420px)`) di atas backdrop foto fixed; panel cream/dark.
- Fonts: serif `"New York", "Cormorant Garamond"` (headings), Inter (body), Candlefish lokal (nama & &). Google Fonts di-load di `<head>`.
- Section berurutan: cover → opening(quote) → couple → journey → save-date → event → gallery → [live] → dress-code → gift → wishes(rsvp) → closing.
- `#giftList` tombol WhatsApp memakai nomor PLACEHOLDER `6285956255121` — ganti ke nomor asli.
- Cache-busting tetap wajib (`style.css?v=`, `script.js?v=`).
```

- [ ] **Step 4: Bump cache CSS jika ada edit CSS di task ini; verifikasi & commit**

```bash
git add AGENTS.md index.html style.css
git commit -m "docs: perbarui AGENTS.md pasca-redesign Kila (carousel dihapus, struktur baru, WA placeholder)"
```

---

### Task 5: Verifikasi menyeluruh + polish + commit final

Regresi penuh seluruh fitur & kerapian akhir. Tidak ada penambahan fitur baru.

**Files:**
- Verify: `index.html`, `style.css`, `script.js`
- Modify: apapun yang butuh polish (tanpa mengubah kontrak)

- [ ] **Step 1: Audit selector vs kode**

Run:
```bash
python3 - <<'PY'
import re
js=open('script.js').read()
html=open('index.html').read()
ids=set(re.findall(r"getElementById\('([^']+)'\)|querySelector\('#([^']+)'\)",js))
flat=set(x or y for x,y in ids)
# querySelectorAll '#' dan class penting
missing=[i for i in flat if ('id="%s"'%i) not in html]
print('id dipakai JS:',sorted(flat))
print('ID missing di HTML:',missing)
for cls in ['anim','muncul-atas','zoom-in']:
    print('class .'+cls, 'count-html', html.count(cls), 'ada-css', cls in open('style.css').read())
PY
```
Expected: `ID missing di HTML: []`; semua class anim hadir di CSS.

- [ ] **Step 2: Uji manual lengkap (checklist browser)**

Run: `python3 -m http.server` → buka `http://localhost:8000?guest=Tamu+Undangan`.
Checklist (semua harus pass):
- Gate: page terkunci sebelum klik; "BUKA UNDANGAN" unlock + scroll mulus ke quote + musik mulai (atau tombol musik muncul — autoplay block normal).
- Ken burns slideshow cover berganti tiap ~3.5s (1250+2250), tanpa error.
- Scroll: judul cover scale mengikuti scroll.
- Tiap section masuk view → animasi `.anim` sekali jalan.
- Countdown: angka turun tiap detik; label Hari/Jam/Menit/Detik; nilai sesuai `2026-10-03T06:30:00+07:00`.
- Simpan Tanggal → toast.
- Buka Maps (2 tombol) membuka Google Maps tab baru.
- Copy rekening (Mandiri & BCA) → toast "Nomor rekening disalin".
- Klik "Lihat Rekening" → daftar muncul; "Sembunyikan Rekening" kembali; tombol WA ada.
- Gallery: klik foto → lightbox; ‹ › & panah keyboard; counter `n / N`; backdrop click menutup.
- RSVP: isi nama/kehadiran/ucapan → Kirim → wish-item baru muncul + toast; input kosong tersisa (kalau Supabase aktif; kalau `.env` tak terjangkau → toast "RSVP belum aktif" — normal di `file://`).
- Musik: tombol floating muncul setelah unlock; toggle play/pause; equalizer berganti.
- Guest name: `?guest=Keluarga+Supardi` menampilkan nama di cover, teks gift, dan prefill input RSVP.
- Mobile ≤430px: tidak ada horizontal scroll; ukuran font & grid mengecil sesuai media query.

- [ ] **Step 3: Audit kecil — buang sisa komentar/kode mati yang menyebut carousel**

`grep -rn "carousel\|carouselTrack\|duplicate" index.html style.css script.js AGENTS.md` → seharusnya hanya `AGENTS.md` punya 0 hasil. Bersihkan bila tersisa (selain yang memang referensi sejarah di komentar).

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: redesign undangan Masda & Salindri ala tema Kila (phone mockup, cream/dark, timeline, dress-code)"
```

---
---

## Self-Review

**1. Spec coverage:**
- Phone mockup (fixed bg + 420px column): Task 1 Step 1-2 + Task 2 (`.phone-bg`, `.invite`). ✅
- Palet cream/dark/beige + swatch: Task 2 token + Task 1 Step 10 dress-code. ✅
- Font New-York-style serif + Inter + Candlefish: Task 1 Step 1 (Google fonts link) + Task 2 token & classes. ✅
- Struktur section reference → konten asli: Task 1 Step 3-11 (cover→opening→couple→journey→save-date→event→gallery→dress-code→gift→wishes→closing). ✅
- Countdown label Hari/Jam/Menit/Detik: Task 1 Step 7 (HTML) + Task 3 (JS countdown untouched, only save-date). ✅
- Buka Maps / copy rekening / RSVP Supabase / gallery lightbox / musik / gate: Task 1 mempertahankan semua hook; Task 3 merapikan JS; Task 5 verifikasi. ✅
- Cache-bumping di tiap task: Task 1 (CSS), Task 2 (CSS), Task 3 (JS), Task 4 (opsional), Task 5 (kalau edit). ✅
- AGENTS.md sinkron: Task 4. ✅

**2. Placeholder scan:** Tidak ada "TBD/implement later" — semua step berisi file/kode/verifikasi konkret. Satu-satunya placeholder disengaja & dieksplisitkan: nomor WA `6285956255121` (Task 1 Step 10 & Task 4 Step 2) dan toggle live-streaming (default OFF, Task 4).

**3. Type/contract consistency:**
- Hook yang JS pakai: `#guestName`, `#rollBtn`, `#opening`, `#coverTitle`, `#coverSlideshow`, `#countdown`, `#giftToggle`, `#giftList`, `#toast`, `#lightbox`, `#musicToggle`, `#bgMusic`, `#galleryGrid`, `#wishList`, `#rsvpForm`, `.anim` — semua hadir di HTML Task 1 & divalidasi Task 1 Step 12 / Task 5 Step 1. ✅
- `#saveDateBtn` dibuat di Task 1 Step 7 & dipakai handler Task 3 Step 2 (guard `?.` aman walau null). ✅
- `.btn-ghost` dipakai HTML Task 1 & didefinisikan Task 2 Step 1. ✅
- `showToast` dipanggil Task 3 Step 2 & didefinisikan di blok toast/copy yang dipertahankan (script.js baris 120-128) — order definisi `const toast` ada SEBELUM blok countdown di file asli; pastikan saat menghapus carousel, `showToast` TETAP ada (jangan ikut terhapus). ⚠️ dicatat di Task 3 Step 1.
