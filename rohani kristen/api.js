/* =====================================================================
   api.js — penghubung situs dengan Google Apps Script
   =====================================================================
   Tempel URL Web App (yang berakhiran /exec) di API_URL di bawah.
   Selama API_URL masih kosong (""), situs memakai data bawaan di
   data.js dan formulir kritik & saran menampilkan pesan "belum aktif".

   Berkas ini dipakai oleh index.html, anggota.html, arsip.html,
   dan admin.html.
   ===================================================================== */

const API_URL = "https://script.google.com/macros/s/AKfycbylS3Nj9VnlIT35zNUlw4Yqdl5Krk4ON4KoQWpDwnPMlz-oekuZSv2tRvN4VtDNQEE/exec";

/* Berapa lama hasil dibaca disimpan sementara di browser (milidetik).
   Cukup singkat supaya perubahan dari admin cepat terlihat. */
const API_CACHE_UMUR = 60000;
const API_CACHE_KUNCI = 'ps9-konten-v1';

let _apiCache = null;
let _apiPeriodeAktif = '';

/* Apakah alamat server sudah diisi? */
function apiAktif() {
  return typeof API_URL === 'string' && /^https?:\/\//.test(API_URL);
}

function _apiUrl(aksi) {
  return API_URL + (API_URL.indexOf('?') >= 0 ? '&' : '?') +
    'aksi=' + encodeURIComponent(aksi) + '&_=' + Date.now();
}

/* Baca data (GET). Melempar Error bila gagal. */
async function apiGet(aksi, batasMs) {
  if (!apiAktif()) throw new Error('Alamat server (API_URL) belum diisi.');
  const c = new AbortController();
  const to = setTimeout(() => c.abort(), batasMs || 9000);
  try {
    const r = await fetch(_apiUrl(aksi), { signal: c.signal, cache: 'no-store' });
    if (!r.ok) throw new Error('Server menjawab HTTP ' + r.status + '.');
    const j = await r.json();
    if (j && j.ok === false) throw new Error(j.pesan || 'Permintaan gagal.');
    return j;
  } finally {
    clearTimeout(to);
  }
}

/* Kirim perintah (POST). Melempar Error bila gagal.
   Content-Type text/plain sengaja dipakai supaya tidak perlu preflight CORS. */
async function apiPost(data, batasMs) {
  if (!apiAktif()) throw new Error('Alamat server (API_URL) belum diisi.');
  const c = new AbortController();
  const to = setTimeout(() => c.abort(), batasMs || 20000);
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      signal: c.signal,
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    });
    if (!r.ok) throw new Error('Server menjawab HTTP ' + r.status + '.');
    const j = await r.json();
    if (j && j.ok === false) throw new Error(j.pesan || 'Permintaan gagal.');
    return j;
  } finally {
    clearTimeout(to);
  }
}

/* Ambil semua konten publik. Mengembalikan null bila server mati/kosong
   supaya halaman tetap memakai data bawaan. */
async function ambilKonten(paksa) {
  if (!apiAktif()) return null;
  const kini = Date.now();

  if (!paksa && _apiCache && kini - _apiCache.waktu < API_CACHE_UMUR) return _apiCache.data;

  if (!paksa) {
    try {
      const s = JSON.parse(sessionStorage.getItem(API_CACHE_KUNCI) || 'null');
      if (s && s.data && kini - s.waktu < API_CACHE_UMUR) {
        _apiCache = s;
        return s.data;
      }
    } catch (e) { /* penyimpanan tidak tersedia — abaikan */ }
  }

  try {
    const data = await apiGet('konten', 9000);
    _apiCache = { waktu: kini, data };
    try {
      sessionStorage.setItem(API_CACHE_KUNCI, JSON.stringify(_apiCache));
    } catch (e) { /* kuota penuh — tidak masalah */ }
    return data;
  } catch (e) {
    console.warn('Konten server gagal dimuat, memakai data bawaan.', e);
    return null;
  }
}

/* Hapus simpanan sementara (dipanggil admin setelah menyimpan). */
function lupakanKonten() {
  _apiCache = null;
  try { sessionStorage.removeItem(API_CACHE_KUNCI); } catch (e) {}
}

/* Apakah satu periode punya isi? */
function periodeBerisi(d) {
  return !!(d && ((d.pembina && d.pembina.length) || (d.pengurus && d.pengurus.length) || (d.anggota && d.anggota.length)));
}

/* Ganti isi objek PERIODE dengan data dari server.
   Mengembalikan true bila isinya benar-benar berubah. */
function terapkanPeriode(konten) {
  if (!konten || !konten.periode) return false;
  const kunci = Object.keys(konten.periode).filter(k => periodeBerisi(konten.periode[k]));
  if (!kunci.length) return false;               /* server masih kosong → pakai data.js */

  const baru = {};
  kunci.forEach(k => {
    const d = konten.periode[k] || {};
    baru[k] = {
      pembina: Array.isArray(d.pembina) ? d.pembina : [],
      pengurus: Array.isArray(d.pengurus) ? d.pengurus : [],
      anggota: Array.isArray(d.anggota) ? d.anggota : []
    };
  });

  const aktifBaru = (konten.periodeAktif && baru[konten.periodeAktif]) ? konten.periodeAktif : '';
  const aktifBerubah = !!aktifBaru && aktifBaru !== _apiPeriodeAktif;
  if (aktifBaru) _apiPeriodeAktif = aktifBaru;

  let berubah = JSON.stringify(baru) !== JSON.stringify(PERIODE);
  if (berubah) {
    Object.keys(PERIODE).forEach(k => { delete PERIODE[k]; });
    Object.keys(baru).forEach(k => { PERIODE[k] = baru[k]; });
  }
  return berubah || aktifBerubah;
}

/* Periode yang ditandai "Aktif" di admin (kosong bila belum ada). */
function periodeAktifServer() {
  return _apiPeriodeAktif;
}

/* Periode yang harus dianggap aktif di halaman publik:
   pakai tanda dari admin; bila belum ada, pakai periode terbaru yang berisi. */
function periodeAktifTampil() {
  const aktif = periodeAktifServer();
  if (aktif && periodeBerisi(PERIODE[aktif])) return aktif;
  const kunci = Object.keys(PERIODE).filter(k => periodeBerisi(PERIODE[k]))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return kunci.length ? kunci[kunci.length - 1] : '';
}

/* Ganti isi array bawaan (ACARA, RENUNGAN, GALERI) bila server punya data. */
function terapkanDaftar(arr, baru) {
  if (!Array.isArray(baru) || !baru.length) return false;
  if (JSON.stringify(arr) === JSON.stringify(baru)) return false;
  arr.length = 0;
  arr.push(...baru);
  return true;
}

/* Format tanggal ISO dari server menjadi "1 Nov 2026". */
function tanggalPesan(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch (e) {
    return d.toLocaleDateString();
  }
}
