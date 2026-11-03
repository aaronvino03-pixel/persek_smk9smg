/**********************************************************************
 *  BACKEND PERSEKUTUAN SMKN 9 SEMARANG  —  Google Apps Script
 *  ------------------------------------------------------------------
 *  Berkas ini adalah "otak" situs: menyimpan data di Google Sheets dan
 *  melayani permintaan dari index.html, anggota.html, arsip.html, dan
 *  admin.html.
 *
 *  CARA PASANG (sekali saja):
 *   1. Buka https://script.google.com  →  New project
 *   2. Hapus isi Code.gs, tempel SELURUH isi berkas ini
 *   3. Ubah ADMIN_AWAL di bawah (username + sandi) sebelum menjalankan
 *   4. Pilih fungsi "siapkan" → Run → izinkan akses
 *   5. Deploy → New deployment → Web app
 *        Execute as : Me
 *        Who has access : Anyone
 *      Salin URL yang berakhiran /exec
 *   6. Tempel URL itu di berkas api.js pada baris API_URL
 *
 *  Setiap kali kode ini diubah: Deploy → Manage deployments → Edit →
 *  Version: New version → Deploy.
 **********************************************************************/

/* ====================== PENGATURAN AWAL ====================== */

/* Akun pertama (dibuat saat fungsi siapkan() dijalankan). GANTI SANDINYA! */
const ADMIN_AWAL = {
  username: 'admin',
  nama: 'Admin Persekutuan',
  sandi: 'ganti-sandi-ini'
};

/* Nama-nama tab di Google Sheets */
const TAB = {
  pengguna:   'Pengguna',
  sesi:       'Sesi',
  periode:    'Periode',
  orang:      'Orang',
  anggota:    'Anggota',
  pesan:      'Pesan',
  acara:      'Acara',
  renungan:   'Renungan',
  galeri:     'Galeri',
  pengaturan: 'Pengaturan'
};

const KEPALA = {
  pengguna:   ['id', 'username', 'nama', 'hash', 'salt', 'peran', 'aktif', 'dibuat'],
  sesi:       ['token', 'username', 'kedaluwarsa', 'dibuat'],
  periode:    ['id', 'periode', 'aktif', 'urutan'],
  orang:      ['id', 'periode', 'jenis', 'nama', 'jabatan', 'foto', 'urutan'],
  anggota:    ['id', 'periode', 'nama', 'kelas', 'jurusan', 'foto', 'urutan'],
  pesan:      ['id', 'pesan', 'kategori', 'status', 'waktu'],
  acara:      ['id', 'tanggal', 'judul', 'jam', 'lokasi'],
  renungan:   ['id', 'ref', 'ayat', 'isi', 'doa'],
  galeri:     ['id', 'file', 'caption'],
  pengaturan: ['kunci', 'nilai']
};

/* Pengaturan bawaan (dipakai kalau tab Pengaturan masih kosong) */
const PENGATURAN_AWAL = {
  tahun: '2013',
  wa: '6287840747799',
  waTampil: '087840747799',
  instagram: 'm.i.c_9',
  email: 'ministryinchrist9@gmail.com',
  lokasi: 'Ruang Persekutuan, SMKN 9 Semarang',
  ibadahRutin: 'Setiap Jumat, pukul 12.00 WIB, di Pos sekolah'
};

const UMUR_SESI_JAM = 3;

/* ====================== UTIL DASAR ====================== */

let _menyiapkan = false;

/**
 * Menyiapkan spreadsheet, semua tab, pengaturan awal, dan akun admin pertama.
 * Aman dijalankan berkali-kali: data yang sudah ada tidak dihapus.
 * Dipanggil otomatis oleh _ss() saat pertama kali dipakai.
 */
function _siapkanInti() {
  const props = PropertiesService.getScriptProperties();

  /* Cegah pemanggilan berulang dari dalam proses yang sama. */
  if (_menyiapkan) return SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));

  _menyiapkan = true;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    let id = props.getProperty('SPREADSHEET_ID');
    let ss;

    if (id) {
      ss = SpreadsheetApp.openById(id);
    } else {
      ss = SpreadsheetApp.create('Data Persekutuan SMKN 9 Semarang');
      props.setProperty('SPREADSHEET_ID', ss.getId());
    }

    /* buat tab yang belum ada beserta baris judulnya */
    Object.keys(TAB).forEach(k => {
      const nama = TAB[k];
      let sh = ss.getSheetByName(nama);
      if (!sh) sh = ss.insertSheet(nama);
      if (sh.getLastRow() === 0) sh.appendRow(KEPALA[k]);
      sh.setFrozenRows(1);
    });

    /* buang tab kosong bawaan spreadsheet baru */
    const kosong = ss.getSheetByName('Sheet1');
    if (kosong && ss.getSheets().length > 1) ss.deleteSheet(kosong);

    /* pengaturan awal */
    if (_baca(TAB.pengaturan).length === 0) {
      _tulisUlang(TAB.pengaturan, Object.keys(PENGATURAN_AWAL).map(k => [k, PENGATURAN_AWAL[k]]));
    }

    /* akun admin pertama */
    const pengguna = _baca(TAB.pengguna);
    const adaAdmin = pengguna.some(u => String(u.username).trim().toLowerCase() === ADMIN_AWAL.username);
    if (!adaAdmin) {
      const salt = _salt();
      pengguna.push({
        id: _id(),
        username: ADMIN_AWAL.username,
        nama: ADMIN_AWAL.nama,
        hash: _hash(ADMIN_AWAL.sandi, salt),
        salt: salt,
        peran: 'admin',
        aktif: true,
        dibuat: _waktu()
      });
      _tulisUlang(TAB.pengguna, pengguna.map(u => _objekKeBaris(TAB.pengguna, u)));
    }

    props.setProperty('SIAP', '1');
    return ss;
  } finally {
    _menyiapkan = false;
    lock.releaseLock();
  }
}

function _ss() {
  const props = PropertiesService.getScriptProperties().getProperties();
  if (props.SIAP !== '1') return _siapkanInti();
  return SpreadsheetApp.openById(props.SPREADSHEET_ID);
}

function _tab(nama) {
  const ss = _ss();
  let sh = ss.getSheetByName(nama);
  if (!sh) {
    sh = ss.insertSheet(nama);
    sh.appendRow(KEPALA[_kunciTab(nama)]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function _kunciTab(nama) {
  for (const k in TAB) if (TAB[k] === nama) return k;
  return null;
}

/* Baca seluruh tab menjadi array objek. */
function _baca(nama) {
  const sh = _tab(nama);
  const nilai = sh.getDataRange().getValues();
  if (nilai.length < 2) return [];
  const kepala = nilai[0].map(h => String(h).trim());
  return nilai.slice(1)
    .filter(r => r.some(v => String(v).trim() !== ''))
    .map(r => {
      const o = {};
      kepala.forEach((h, i) => { o[h] = r[i]; });
      return o;
    });
}

/* Tulis ulang satu tab (dipakai untuk operasi massal). */
function _tulisUlang(nama, baris) {
  const sh = _tab(nama);
  sh.clearContents();
  sh.appendRow(KEPALA[_kunciTab(nama)]);
  if (baris.length) {
    sh.getRange(2, 1, baris.length, baris[0].length).setValues(baris);
  }
  sh.setFrozenRows(1);
}

function _objekKeBaris(nama, o) {
  return KEPALA[_kunciTab(nama)].map(k => (o[k] === undefined || o[k] === null) ? '' : o[k]);
}

function _id() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

function _teks(v, maks) {
  return String(v === undefined || v === null ? '' : v).trim().slice(0, maks || 500);
}

/* Tanggal dari Sheet bisa tersimpan sebagai objek Date (mis. "2026-11-13"
   dianggap tanggal oleh Google Sheets). Kembalikan ke format YYYY-MM-DD. */
function _tanggal(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return Utilities.formatDate(v, 'Asia/Jakarta', 'yyyy-MM-dd');
  }
  const s = _teks(v, 40);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? m[1] + '-' + m[2] + '-' + m[3] : s;
}

/* "0878…" bisa tersimpan sebagai angka 878… oleh Google Sheets. */
function _rapikanWaTampil(v) {
  const s = _teks(v, 30);
  return /^8\d{8,12}$/.test(s) ? '0' + s : s;
}

/* Nomor untuk tautan wa.me: 08… / 8… → 62… */
function _rapikanWa(v) {
  let s = _teks(v, 30).replace(/[^0-9]/g, '');
  if (s.indexOf('0') === 0) s = '62' + s.slice(1);
  else if (s.indexOf('8') === 0) s = '62' + s;
  return s;
}

function _json(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function _hash(sandi, salt) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(sandi) + '|' + salt,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

function _salt() {
  return Utilities.getUuid().replace(/-/g, '');
}

function _waktu() {
  return new Date().toISOString();
}

/* ====================== SESI ====================== */

function _cekToken(token) {
  token = _teks(token, 100);
  if (!token) return null;
  const sekarang = Date.now();
  const sesi = _baca(TAB.sesi).find(s => s.token === token);
  if (!sesi) return null;
  if (new Date(sesi.kedaluwarsa).getTime() < sekarang) return null;
  const user = _baca(TAB.pengguna).find(u => u.username === sesi.username);
  if (!user || String(user.aktif).toUpperCase() === 'FALSE') return null;
  return { username: user.username, nama: user.nama, peran: user.peran };
}

function _buatToken(username) {
  const token = _salt() + _salt();
  const kedaluwarsa = new Date(Date.now() + UMUR_SESI_JAM * 3600 * 1000).toISOString();
  const sh = _tab(TAB.sesi);
  /* bersihkan sesi kedaluwarsa sekalian */
  const hidup = _baca(TAB.sesi).filter(s => new Date(s.kedaluwarsa).getTime() > Date.now());
  const baris = hidup.map(s => _objekKeBaris(TAB.sesi, s));
  baris.push(_objekKeBaris(TAB.sesi, { token, username, kedaluwarsa, dibuat: _waktu() }));
  _tulisUlang(TAB.sesi, baris);
  return token;
}

function _hapusToken(token) {
  const sisa = _baca(TAB.sesi).filter(s => s.token !== token);
  _tulisUlang(TAB.sesi, sisa.map(s => _objekKeBaris(TAB.sesi, s)));
}

function _wajibAdmin(user) {
  if (!user) throw new Error('Sesi berakhir. Silakan masuk lagi.');
  if (user.peran !== 'admin') throw new Error('Hanya admin yang boleh melakukan ini.');
  return true;
}

/* ====================== PENYIAPAN ====================== */

/**
 * Jalankan sekali dari editor Apps Script (opsional — penyiapan juga
 * berjalan otomatis saat halaman admin pertama kali memanggil server).
 * Membuat spreadsheet + semua tab + akun admin pertama.
 */
function siapkan() {
  const ss = _siapkanInti();
  Logger.log('SELESAI. Spreadsheet: ' + ss.getUrl());
  Logger.log('Login admin → username: ' + ADMIN_AWAL.username + ' | sandi: ' + ADMIN_AWAL.sandi);
  return ss.getUrl();
}

/* ====================== GET ====================== */

function doGet(e) {
  try {
    const aksi = (e && e.parameter && e.parameter.aksi) || 'konten';
    if (aksi === 'ping') return _json({ ok: true, waktu: _waktu() });
    if (aksi === 'konten') return _json(kontenPublik());
    return _json({ ok: false, pesan: 'Aksi tidak dikenal.' });
  } catch (err) {
    return _json({ ok: false, pesan: String(err && err.message || err) });
  }
}

function _pengaturan() {
  const isi = _baca(TAB.pengaturan);
  const o = Object.assign({}, PENGATURAN_AWAL);
  isi.forEach(r => {
    if (!r.kunci) return;
    const k = String(r.kunci);
    let v = r.nilai;
    if (k === 'waTampil') v = _rapikanWaTampil(v);
    if (k === 'wa') v = _rapikanWa(v);
    o[k] = v;
  });
  return o;
}

function _periodeLengkap() {
  const daftar = _baca(TAB.periode);
  const orang = _baca(TAB.orang);
  const anggota = _baca(TAB.anggota);
  const hasil = {};

  daftar
    .filter(p => String(p.periode || '').trim())
    .sort((a, b) => parseInt(a.periode, 10) - parseInt(b.periode, 10))
    .forEach(p => {
      const kunci = String(p.periode).trim();
      hasil[kunci] = {
        pembina: orang
          .filter(o => String(o.periode).trim() === kunci && String(o.jenis).toLowerCase() === 'pembina')
          .sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0))
          .map(o => ({ nama: _teks(o.nama, 120), jabatan: _teks(o.jabatan, 120), foto: _teks(o.foto, 45000) })),
        pengurus: orang
          .filter(o => String(o.periode).trim() === kunci && String(o.jenis).toLowerCase() === 'pengurus')
          .sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0))
          .map(o => ({ nama: _teks(o.nama, 120), jabatan: _teks(o.jabatan, 120), foto: _teks(o.foto, 45000) })),
        anggota: anggota
          .filter(a => String(a.periode).trim() === kunci)
          .sort((a, b) => (Number(a.urutan) || 0) - (Number(b.urutan) || 0))
          .map(a => ({ nama: _teks(a.nama, 120), kelas: _teks(a.kelas, 10), jurusan: _teks(a.jurusan, 120), foto: _teks(a.foto, 45000) }))
      };
    });

  return hasil;
}

function _periodeAktif(periode) {
  const aktif = _baca(TAB.periode).find(p => String(p.aktif).toUpperCase() === 'TRUE');
  if (aktif && periode[String(aktif.periode).trim()]) return String(aktif.periode).trim();
  const kunci = Object.keys(periode).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  return kunci.length ? kunci[kunci.length - 1] : '';
}

function _pesanPublik() {
  return _baca(TAB.pesan)
    .filter(p => String(p.status).toLowerCase() === 'tampil')
    .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
    .slice(0, 60)
    .map(p => ({ id: String(p.id), pesan: _teks(p.pesan, 800), kategori: _teks(p.kategori, 40), waktu: String(p.waktu) }));
}

function _acara() {
  return _baca(TAB.acara).map(a => ({
    id: String(a.id),
    tanggal: _tanggal(a.tanggal),
    judul: _teks(a.judul, 160),
    jam: _teks(a.jam, 40),
    lokasi: _teks(a.lokasi, 160)
  }));
}

function _renungan() {
  return _baca(TAB.renungan).map(r => ({
    id: String(r.id),
    ref: _teks(r.ref, 80),
    ayat: _teks(r.ayat, 1200),
    isi: _teks(r.isi, 2000),
    doa: _teks(r.doa, 800)
  }));
}

function _galeri() {
  return _baca(TAB.galeri).map(g => ({
    id: String(g.id),
    src: _teks(g.file, 500),
    caption: _teks(g.caption, 200)
  }));
}

/** Data untuk semua pengunjung (tanpa nama pengirim pesan). */
function kontenPublik() {
  const periode = _periodeLengkap();
  return {
    ok: true,
    waktu: _waktu(),
    pengaturan: _pengaturan(),
    periode: periode,
    periodeAktif: _periodeAktif(periode),
    acara: _acara(),
    renungan: _renungan(),
    galeri: _galeri(),
    pesan: _pesanPublik()
  };
}

/* ====================== POST ====================== */

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return _json({ ok: false, pesan: 'Data tidak terbaca.' });
  }

  const aksi = _teks(data.aksi, 40);

  try {
    /* ---------- publik ---------- */
    if (aksi === 'kirim') return _json(kirimPesan(data));

    /* ---------- sesi ---------- */
    if (aksi === 'login') return _json(masuk(data));
    if (aksi === 'keluar') { _hapusToken(data.token); return _json({ ok: true }); }

    /* ---------- admin ---------- */
    const user = _cekToken(data.token);
    if (!user) return _json({ ok: false, pesan: 'Sesi berakhir. Silakan masuk lagi.' });

    if (aksi === 'admin')          return _json(adminKonten(user));
    if (aksi === 'simpan_periode') return _json(simpanPeriode(user, data));
    if (aksi === 'hapus_periode')  return _json(hapusPeriode(user, data));
    if (aksi === 'set_aktif')      return _json(setAktif(user, data));
    if (aksi === 'simpan_item')    return _json(simpanItem(user, data));
    if (aksi === 'hapus_item')     return _json(hapusItem(user, data));
    if (aksi === 'impor_bawaan')   return _json(imporBawaan(user, data));
    if (aksi === 'moderasi')       return _json(moderasi(user, data));
    if (aksi === 'hapus_pesan')    return _json(hapusPesan(user, data));
    if (aksi === 'simpan_pengaturan') return _json(simpanPengaturan(user, data));
    if (aksi === 'simpan_pengguna')   return _json(simpanPengguna(user, data));
    if (aksi === 'hapus_pengguna')    return _json(hapusPengguna(user, data));
    if (aksi === 'ganti_sandi')       return _json(gantiSandi(user, data));

    return _json({ ok: false, pesan: 'Aksi tidak dikenal.' });
  } catch (err) {
    return _json({ ok: false, pesan: String(err && err.message || err) });
  }
}

/* ---------- kirim kritik & saran (publik) ---------- */

function kirimPesan(data) {
  const pesan = _teks(data.pesan, 800);
  const kategori = _teks(data.kategori, 40) || 'Umum';

  if (_teks(data.situs, 100)) return { ok: true, pesan: 'Terima kasih.' };  /* jebakan bot */
  if (pesan.length < 10) return { ok: false, pesan: 'Tulis minimal 10 huruf supaya jelas.' };

  /* batasi 40 pesan per jam untuk mencegah spam */
  const cache = CacheService.getScriptCache();
  const kunci = 'kirim-' + Math.floor(Date.now() / 3600000);
  const jumlah = Number(cache.get(kunci) || 0);
  if (jumlah >= 40) return { ok: false, pesan: 'Terlalu banyak pesan masuk. Coba lagi nanti.' };
  cache.put(kunci, String(jumlah + 1), 3600);

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    _tab(TAB.pesan).appendRow(_objekKeBaris(TAB.pesan, {
      id: _id(),
      pesan: pesan,
      kategori: kategori,
      status: 'menunggu',
      waktu: _waktu()
    }));
  } finally {
    lock.releaseLock();
  }

  return { ok: true, pesan: 'Terima kasih! Pesanmu akan tampil setelah diperiksa pengurus.' };
}

/* ---------- login ---------- */

function masuk(data) {
  const username = _teks(data.username, 60).toLowerCase();
  const sandi = String(data.sandi || '');
  if (!username || !sandi) return { ok: false, pesan: 'Username dan sandi wajib diisi.' };

  const user = _baca(TAB.pengguna).find(u => String(u.username).toLowerCase() === username);
  if (!user) return { ok: false, pesan: 'Username atau sandi salah.' };
  if (String(user.aktif).toUpperCase() === 'FALSE') return { ok: false, pesan: 'Akun ini dinonaktifkan.' };
  if (_hash(sandi, user.salt) !== String(user.hash)) return { ok: false, pesan: 'Username atau sandi salah.' };

  const token = _buatToken(user.username);
  return { ok: true, token, nama: user.nama, username: user.username, peran: user.peran };
}

/* ---------- data untuk admin ---------- */

function adminKonten(user) {
  return {
    ok: true,
    nama: user.nama,
    peran: user.peran,
    pengaturan: _pengaturan(),
    periode: _periodeLengkap(),
    periodeAktif: _periodeAktif(_periodeLengkap()),
    acara: _acara(),
    renungan: _renungan(),
    galeri: _galeri(),
    pesan: _baca(TAB.pesan)
      .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
      .map(p => ({
        id: String(p.id),
        pesan: _teks(p.pesan, 800),
        kategori: _teks(p.kategori, 40),
        status: _teks(p.status, 20),
        waktu: String(p.waktu)
      })),
    pengguna: user.peran === 'admin'
      ? _baca(TAB.pengguna).map(u => ({
          username: String(u.username),
          nama: _teks(u.nama, 120),
          peran: _teks(u.peran, 20),
          aktif: String(u.aktif).toUpperCase() !== 'FALSE'
        }))
      : []
  };
}

/* ---------- periode ---------- */

function simpanPeriode(user, data) {
  const nama = _teks(data.periode, 20);
  if (!/^\d{4}\/\d{4}$/.test(nama)) throw new Error('Nama periode harus TAHUN/TAHUN, contoh 2027/2028.');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    /* pastikan periode terdaftar */
    const daftar = _baca(TAB.periode);
    if (!daftar.some(p => String(p.periode).trim() === nama)) {
      daftar.push({ id: _id(), periode: nama, aktif: false, urutan: parseInt(nama, 10) });
    }
    _tulisUlang(TAB.periode, daftar.map(p => _objekKeBaris(TAB.periode, p)));

    /* ganti seluruh orang & anggota periode ini */
    const orangLain = _baca(TAB.orang).filter(o => String(o.periode).trim() !== nama);
    const anggotaLain = _baca(TAB.anggota).filter(a => String(a.periode).trim() !== nama);

    const orangBaru = [];
    ['pembina', 'pengurus'].forEach(jenis => {
      (data[jenis] || []).forEach((o, i) => {
        const nm = _teks(o.nama, 120);
        if (!nm) return;
        orangBaru.push(_objekKeBaris(TAB.orang, {
          id: _id(), periode: nama, jenis,
          nama: nm,
          jabatan: _teks(o.jabatan, 120),
          foto: _teks(o.foto, 45000),
          urutan: i
        }));
      });
    });

    const anggotaBaru = (data.anggota || [])
      .map((a, i) => ({ a, i }))
      .filter(x => _teks(x.a.nama, 120))
      .map(x => _objekKeBaris(TAB.anggota, {
        id: _id(), periode: nama,
        nama: _teks(x.a.nama, 120),
        kelas: _teks(x.a.kelas, 10),
        jurusan: _teks(x.a.jurusan, 120),
        foto: _teks(x.a.foto, 45000),
        urutan: x.i
      }));

    _tulisUlang(TAB.orang, orangLain.map(o => _objekKeBaris(TAB.orang, o)).concat(orangBaru));
    _tulisUlang(TAB.anggota, anggotaLain.map(a => _objekKeBaris(TAB.anggota, a)).concat(anggotaBaru));
  } finally {
    lock.releaseLock();
  }

  return { ok: true, pesan: 'Periode ' + nama + ' disimpan.', konten: adminKonten(user) };
}

function hapusPeriode(user, data) {
  _wajibAdmin(user);
  const nama = _teks(data.periode, 20);
  if (!nama) throw new Error('Periode tidak disebutkan.');

  _tulisUlang(TAB.periode, _baca(TAB.periode)
    .filter(p => String(p.periode).trim() !== nama)
    .map(p => _objekKeBaris(TAB.periode, p)));
  _tulisUlang(TAB.orang, _baca(TAB.orang)
    .filter(o => String(o.periode).trim() !== nama)
    .map(o => _objekKeBaris(TAB.orang, o)));
  _tulisUlang(TAB.anggota, _baca(TAB.anggota)
    .filter(a => String(a.periode).trim() !== nama)
    .map(a => _objekKeBaris(TAB.anggota, a)));

  return { ok: true, pesan: 'Periode ' + nama + ' dihapus.', konten: adminKonten(user) };
}

function setAktif(user, data) {
  const nama = _teks(data.periode, 20);
  if (!nama) throw new Error('Periode tidak disebutkan.');
  const daftar = _baca(TAB.periode).map(p => {
    p.aktif = String(p.periode).trim() === nama;
    return p;
  });
  _tulisUlang(TAB.periode, daftar.map(p => _objekKeBaris(TAB.periode, p)));
  return { ok: true, pesan: 'Periode aktif: ' + nama, konten: adminKonten(user) };
}

/* ---------- acara / renungan / galeri ---------- */

const IZIN_ITEM = { acara: true, renungan: true, galeri: true };

function simpanItem(user, data) {
  const bagian = _teks(data.bagian, 20);
  if (!IZIN_ITEM[bagian]) throw new Error('Bagian tidak dikenal.');
  const tab = TAB[bagian];

  const bersih = {};
  KEPALA[_kunciTab(tab)].forEach(k => { if (k !== 'id') bersih[k] = _teks(data.data && data.data[k], 2000); });
  /* Formulir galeri memakai "src", sedangkan kolom Sheet bernama "file". */
  if (bagian === 'galeri' && data.data && data.data.src !== undefined) {
    bersih.file = _teks(data.data.src, 500);
  }
  if (!Object.keys(bersih).some(k => bersih[k])) throw new Error('Isian masih kosong.');

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const baris = _baca(tab);
    const id = _teks(data.id, 40);
    if (id) {
      const i = baris.findIndex(b => String(b.id) === id);
      if (i < 0) throw new Error('Data tidak ditemukan.');
      baris[i] = Object.assign({}, baris[i], bersih);
    } else {
      baris.push(Object.assign({ id: _id() }, bersih));
    }
    _tulisUlang(tab, baris.map(b => _objekKeBaris(tab, b)));
  } finally {
    lock.releaseLock();
  }

  return { ok: true, pesan: 'Tersimpan.', konten: adminKonten(user) };
}

function hapusItem(user, data) {
  const bagian = _teks(data.bagian, 20);
  if (!IZIN_ITEM[bagian]) throw new Error('Bagian tidak dikenal.');
  const tab = TAB[bagian];
  const id = _teks(data.id, 40);
  const sisa = _baca(tab).filter(b => String(b.id) !== id);
  _tulisUlang(tab, sisa.map(b => _objekKeBaris(tab, b)));
  return { ok: true, pesan: 'Dihapus.', konten: adminKonten(user) };
}

/* ---------- impor konten bawaan (data.js) ---------- */

/* Menyalin periode + acara + renungan + galeri dari data.js ke Sheets.
   Periode dengan nama yang sama ditimpa. Acara/renungan/galeri hanya diisi
   bila tab-nya masih kosong, supaya perubahan admin tidak hilang. */
function imporBawaan(user, data) {
  const masuk = data.periode || {};
  const namaPeriode = Object.keys(masuk)
    .filter(n => /^\d{4}\/\d{4}$/.test(n))
    .slice(0, 20);
  if (!namaPeriode.length) throw new Error('Tidak ada periode untuk diimpor.');

  const jumlah = { periode: 0, orang: 0, anggota: 0, acara: 0, renungan: 0, galeri: 0 };
  const dilewati = [];

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const daftarPeriode = _baca(TAB.periode);
    const periodeAwalKosong = daftarPeriode.length === 0;
    let orang = _baca(TAB.orang);
    let anggota = _baca(TAB.anggota);

    namaPeriode.forEach(nama => {
      if (!daftarPeriode.some(p => String(p.periode).trim() === nama)) {
        daftarPeriode.push({ id: _id(), periode: nama, aktif: false, urutan: parseInt(nama, 10) });
      }
      orang = orang.filter(o => String(o.periode).trim() !== nama);
      anggota = anggota.filter(a => String(a.periode).trim() !== nama);

      const d = masuk[nama] || {};
      ['pembina', 'pengurus'].forEach(jenis => {
        (Array.isArray(d[jenis]) ? d[jenis] : []).slice(0, 1000).forEach((o, i) => {
          const nm = _teks(o && o.nama, 120);
          if (!nm) return;
          orang.push({
            id: _id(), periode: nama, jenis: jenis, nama: nm,
            jabatan: _teks(o.jabatan, 120), foto: _teks(o.foto, 45000), urutan: i
          });
          jumlah.orang++;
        });
      });

      (Array.isArray(d.anggota) ? d.anggota : []).slice(0, 3000).forEach((a, i) => {
        const nm = _teks(a && a.nama, 120);
        if (!nm) return;
        anggota.push({
          id: _id(), periode: nama, nama: nm,
          kelas: _teks(a.kelas, 10), jurusan: _teks(a.jurusan, 120),
          foto: _teks(a.foto, 45000), urutan: i
        });
        jumlah.anggota++;
      });
      jumlah.periode++;
    });

    const aktif = _teks(data.aktif, 20);
    if (periodeAwalKosong && aktif && namaPeriode.includes(aktif)) {
      daftarPeriode.forEach(p => { p.aktif = String(p.periode).trim() === aktif; });
    }

    _tulisUlang(TAB.periode, daftarPeriode.map(p => _objekKeBaris(TAB.periode, p)));
    _tulisUlang(TAB.orang, orang.map(o => _objekKeBaris(TAB.orang, o)));
    _tulisUlang(TAB.anggota, anggota.map(a => _objekKeBaris(TAB.anggota, a)));

    const isiItem = (bagian, daftar) => {
      if (!Array.isArray(daftar) || !daftar.length) return;
      if (_baca(TAB[bagian]).length) { dilewati.push(bagian); return; }
      const kunci = KEPALA[_kunciTab(TAB[bagian])];
      const baris = [];
      daftar.slice(0, 500).forEach(x => {
        const o = { id: _id() };
        kunci.forEach(k => {
          if (k === 'id') return;
          o[k] = (bagian === 'galeri' && k === 'file') ? _teks(x && x.src, 500) : _teks(x && x[k], 2000);
        });
        if (kunci.some(k => k !== 'id' && String(o[k] || '').trim())) {
          baris.push(_objekKeBaris(TAB[bagian], o));
        }
      });
      _tulisUlang(TAB[bagian], baris);
      jumlah[bagian] = baris.length;
    };
    isiItem('acara', data.acara);
    isiItem('renungan', data.renungan);
    isiItem('galeri', data.galeri);
  } finally {
    lock.releaseLock();
  }

  let pesan = jumlah.periode + ' periode diimpor (' + jumlah.orang + ' pembina/pengurus, ' +
    jumlah.anggota + ' anggota).';
  if (jumlah.acara || jumlah.renungan || jumlah.galeri) {
    pesan += ' Acara: ' + jumlah.acara + ', renungan: ' + jumlah.renungan + ', galeri: ' + jumlah.galeri + '.';
  }
  if (dilewati.length) {
    pesan += ' Dilewati karena sudah berisi: ' + dilewati.join(', ') + '.';
  }
  return { ok: true, pesan: pesan, konten: adminKonten(user), dilewati: dilewati };
}

/* ---------- pesan ---------- */

function moderasi(user, data) {
  const id = _teks(data.id, 40);
  const status = _teks(data.status, 20).toLowerCase();
  if (!['tampil', 'sembunyi', 'menunggu'].includes(status)) throw new Error('Status tidak dikenal.');

  const baris = _baca(TAB.pesan).map(p => {
    if (String(p.id) === id) p.status = status;
    return p;
  });
  _tulisUlang(TAB.pesan, baris.map(p => _objekKeBaris(TAB.pesan, p)));
  return { ok: true, pesan: 'Status pesan diperbarui.', konten: adminKonten(user) };
}

function hapusPesan(user, data) {
  _wajibAdmin(user);
  const id = _teks(data.id, 40);
  _tulisUlang(TAB.pesan, _baca(TAB.pesan)
    .filter(p => String(p.id) !== id)
    .map(p => _objekKeBaris(TAB.pesan, p)));
  return { ok: true, pesan: 'Pesan dihapus.', konten: adminKonten(user) };
}

/* ---------- pengaturan ---------- */

function simpanPengaturan(user, data) {
  const masuk = data.data || {};
  const lama = _pengaturan();
  const gabung = Object.assign({}, lama, masuk);
  const baris = Object.keys(gabung).map(k => [k, _teks(gabung[k], 500)]);
  _tulisUlang(TAB.pengaturan, baris);
  return { ok: true, pesan: 'Pengaturan disimpan.', konten: adminKonten(user) };
}

/* ---------- akun ---------- */

function simpanPengguna(user, data) {
  _wajibAdmin(user);
  const username = _teks(data.username, 60).toLowerCase();
  const nama = _teks(data.nama, 120);
  const peran = _teks(data.peran, 20) === 'admin' ? 'admin' : 'pengurus';
  const sandi = String(data.sandi || '');
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) throw new Error('Username 3–30 huruf kecil/angka/titik.');

  const daftar = _baca(TAB.pengguna);
  const ada = daftar.find(u => String(u.username).toLowerCase() === username);

  if (ada) {
    ada.nama = nama || ada.nama;
    ada.peran = peran;
    ada.aktif = data.aktif === false ? false : true;
    if (sandi) {
      ada.salt = _salt();
      ada.hash = _hash(sandi, ada.salt);
    }
  } else {
    if (sandi.length < 6) throw new Error('Sandi minimal 6 huruf.');
    const salt = _salt();
    daftar.push({
      id: _id(), username, nama: nama || username,
      hash: _hash(sandi, salt), salt,
      peran, aktif: true, dibuat: _waktu()
    });
  }

  _tulisUlang(TAB.pengguna, daftar.map(u => _objekKeBaris(TAB.pengguna, u)));
  return { ok: true, pesan: 'Akun ' + username + ' disimpan.', konten: adminKonten(user) };
}

function hapusPengguna(user, data) {
  _wajibAdmin(user);
  const username = _teks(data.username, 60).toLowerCase();
  if (username === user.username) throw new Error('Tidak bisa menghapus akun sendiri.');
  const sisa = _baca(TAB.pengguna).filter(u => String(u.username).toLowerCase() !== username);
  if (sisa.filter(u => String(u.peran) === 'admin' && String(u.aktif).toUpperCase() !== 'FALSE').length === 0) {
    throw new Error('Harus ada minimal satu admin.');
  }
  _tulisUlang(TAB.pengguna, sisa.map(u => _objekKeBaris(TAB.pengguna, u)));
  return { ok: true, pesan: 'Akun dihapus.', konten: adminKonten(user) };
}

function gantiSandi(user, data) {
  const lama = String(data.lama || '');
  const baru = String(data.baru || '');
  if (baru.length < 6) throw new Error('Sandi baru minimal 6 huruf.');

  const daftar = _baca(TAB.pengguna);
  const saya = daftar.find(u => String(u.username) === user.username);
  if (!saya) throw new Error('Akun tidak ditemukan.');
  if (_hash(lama, saya.salt) !== String(saya.hash)) throw new Error('Sandi lama salah.');

  saya.salt = _salt();
  saya.hash = _hash(baru, saya.salt);
  _tulisUlang(TAB.pengguna, daftar.map(u => _objekKeBaris(TAB.pengguna, u)));
  return { ok: true, pesan: 'Sandi diperbarui.' };
}
