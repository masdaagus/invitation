# Gallery Four Then Landscape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan empat foto grid dua kolom, lalu satu foto yang membentang dua kolom, berulang sampai galeri habis.

**Architecture:** Generator galeri menandai setiap item kelima dengan class `landscape`. CSS grid yang sudah ada memperlebar item tersebut ke dua kolom, tanpa mengubah array foto atau navigasi lightbox.

**Tech Stack:** HTML statis, CSS Grid, JavaScript browser native.

## Global Constraints

- Jangan ubah urutan `gallery`, perilaku lightbox, atau lazy loading.
- Jangan menambah dependensi atau file produksi.
- Bump query cache `style.css?v=` dan `script.js?v=` di `index.html` saat file terkait diedit.
- Tidak ada framework atau perintah test/lint; verifikasi dengan static server dan browser console.
- Jangan commit tanpa permintaan eksplisit pengguna.

---

### Task 1: Tandai dan bentangkan foto kelima

**Files:**
- Modify: `script.js:299-310`
- Modify: `style.css:324-333`
- Modify: `index.html:7-8`

**Interfaces:**
- Consumes: `gallery.forEach((src, index) => ...)` dan `.gallery-grid` dua kolom.
- Produces: Tombol item kelima memiliki class `landscape`; CSS membuatnya span dua kolom.

- [ ] **Step 1: Tambahkan class pada setiap item kelima**

Ubah assignment class tombol menjadi:

```js
button.className = `anim zoom-in slow${index % 5 === 4 ? ' landscape' : ''}`;
```

- [ ] **Step 2: Tambahkan aturan CSS span dua kolom**

Tambahkan setelah `.gallery-grid button`:

```css
.gallery-grid button.landscape{grid-column:span 2}
```

- [ ] **Step 3: Bump cache query**

Naikkan masing-masing versi query `style.css?v=` dan `script.js?v=` di `index.html` satu angka agar browser memuat aset baru.

- [ ] **Step 4: Verifikasi di browser**

Run: `python3 -m http.server`

Expected: Empat foto pertama tersusun 2×2, foto kelima memenuhi dua kolom, lalu pola berulang. Klik foto reguler dan landscape; counter serta tombol prev/next tetap sesuai urutan.

- [ ] **Step 5: Periksa console browser**

Expected: Tidak ada JavaScript error saat galeri dirender atau lightbox dibuka.
