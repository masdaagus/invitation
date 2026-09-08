# Desain — Ikon Instagram Outline

## Tujuan

Mengganti dua ikon Instagram solid pada profil mempelai menjadi ikon outline tanpa mengubah tautan, label aksesibilitas, ukuran, atau warna.

## Perubahan

- `index.html`: ganti path SVG pada dua `.social-link` dengan SVG Instagram berbasis `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`.
- `style.css`: tidak diubah karena aturan ukuran SVG yang ada tetap berlaku.
- Cache key stylesheet tidak perlu diubah karena CSS tidak berubah.

## Verifikasi

- Kedua ikon tampil sebagai outline.
- Tautan Instagram dan teks handle tetap sama.
- Tidak ada SVG lama berbasis `fill="currentColor"` pada social link.
