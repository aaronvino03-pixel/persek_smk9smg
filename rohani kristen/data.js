/* =====================================================================
   DATA PER PERIODE — dipakai bersama oleh index.html, anggota.html,
   arsip.html, dan admin.html (untuk impor data bawaan)
   =====================================================================
   Satu periode berisi: pembina, pengurus, anggota.
   - foto  : nama file/URL gambar. Kosongkan "" untuk ikon/inisial bawaan.
   - anggota: kelas "X", "XI", atau "XII" (kelas saat periode tersebut).
              jurusan ditulis SAMA PERSIS seperti pilihan di formulir pendaftaran.
   Foto pengurus: img/pengurus/   Foto anggota: img/anggota/
   Saran foto: persegi, 200x200 px, JPG, ±20 KB supaya ringan.
   Periode yang datanya masih [] akan menampilkan "belum diisi".

   CUKUP EDIT FILE INI. Perubahan otomatis muncul di halaman utama
   (struktur pengurus) dan di halaman Anggota.

   REGENERASI TAHUN AJARAN:
   Buka kelola.html → pilih periode sumber → "Buat data periode" →
   salin hasilnya ke file ini (atau unduh data.js baru).
   ===================================================================== */

/* Cadangan saja: halaman otomatis memilih periode TERBARU yang ada isinya.
   Nilai ini hanya dipakai kalau semua periode masih kosong. */
const PERIODE_BAWAAN = "2026/2027";

const PERIODE = {
  "2025/2026": {   // periode sebelumnya — isinya disalin sama persis dari 2026/2027
    pembina: [
      { nama: "Andrias Sis Andi", jabatan: "Guru Pembina", foto: "img/pengurus/pak-andi.jpg" },
      { nama: "Pak Indra", jabatan: "Guru Pembina Agama Katolik", foto: "img/pengurus/pak-indra.jpg" }
    ],
    pengurus: [
      { nama: "Priscilla Tirza Huwae",       jabatan: "Ketua",                foto: "img/pengurus/tirza.jpg" },
      { nama: "Sevi Eliya Purwastuti", jabatan: "Wakil Ketua",          foto: "img/pengurus/sevi.jpg" },
      { nama: "Marcellyne El Fabian",  jabatan: "Sekretaris",           foto: "img/pengurus/cellyne.jpg" },
      { nama: "Anindita Putri Prasetyani",   jabatan: "Bendahara 1",            foto: "img/pengurus/tata.jpg" },
      { nama: "A. Ardayoshi Eka Kaloka",   jabatan: "Bendahara 2",            foto: "img/pengurus/yoshi.jpg" },
      { nama: "Dinda Ayu Syfa",             jabatan: "Seksi Ibadah",         foto: "img/pengurus/dinda.jpg" },
      { nama: "Machiko Yoshe Gabriela Wijaya",             jabatan: "Seksi Musik & Pujian 1", foto: "img/pengurus/yoshe.jpg" },
      { nama: "Feren Christiana Maendro",             jabatan: "Seksi Musik & Pujian 2", foto: "img/pengurus/feren.jpg" },
      { nama: "Bernadetta Sekar Ayu Graciasetya",             jabatan: "Seksi Humas",    foto: "img/pengurus/gres.jpg" },
      { nama: "Michael Krishna Ega Jeremia",             jabatan: "Seksi Dokumentasi",foto: "img/pengurus/michael.jpg" }
    ],
    anggota: [
      { nama: "Contoh Nama Satu", kelas: "X",   jurusan: "Pemasaran 1",                          foto: "" },
      { nama: "Contoh Nama Dua",  kelas: "XI",  jurusan: "Akuntansi dan Keuangan Lembaga 2",     foto: "" },
      { nama: "Contoh Nama Tiga", kelas: "XII", jurusan: "Pengembangan Perangkat Lunak dan Gim", foto: "" }
    ]
  },
  "2026/2027": {
    pembina: [
      { nama: "Andrias Sis Andi", jabatan: "Guru Pembina", foto: "img/pengurus/pak-andi.jpg" },
      { nama: "Pak Indra", jabatan: "Guru Pembina Agama Katolik", foto: "img/pengurus/pak-indra.jpg" }
    ],
    pengurus: [
      { nama: "Priscilla Tirza Huwae",       jabatan: "Ketua",                foto: "img/pengurus/tirza.jpg" },
      { nama: "Sevi Eliya Purwastuti", jabatan: "Wakil Ketua",          foto: "img/pengurus/sevi.jpg" },
      { nama: "Marcellyne El Fabian",  jabatan: "Sekretaris",           foto: "img/pengurus/cellyne.jpg" },
      { nama: "Anindita Putri Prasetyani",   jabatan: "Bendahara 1",            foto: "img/pengurus/tata.jpg" },
      { nama: "A. Ardayoshi Eka Kaloka",   jabatan: "Bendahara 2",            foto: "img/pengurus/yoshi.jpg" },
      { nama: "Dinda Ayu Syfa",             jabatan: "Seksi Ibadah",         foto: "img/pengurus/dinda.jpg" },
      { nama: "Machiko Yoshe Gabriela Wijaya",             jabatan: "Seksi Musik & Pujian 1", foto: "img/pengurus/yoshe.jpg" },
      { nama: "Feren Christiana Maendro",             jabatan: "Seksi Musik & Pujian 2", foto: "img/pengurus/feren.jpg" },
      { nama: "Bernadetta Sekar Ayu Graciasetya",             jabatan: "Seksi Humas",    foto: "img/pengurus/gres.jpg" },
      { nama: "Michael Krishna Ega Jeremia",             jabatan: "Seksi Dokumentasi",foto: "img/pengurus/michael.jpg" }
    ],
    anggota: [   // GANTI 3 contoh ini dengan data asli. Kosongkan [] untuk menampilkan "belum diisi".
      { nama: "Contoh Nama Satu", kelas: "X",   jurusan: "Pemasaran 1",                          foto: "" },
      { nama: "Contoh Nama Dua",  kelas: "XI",  jurusan: "Akuntansi dan Keuangan Lembaga 2",     foto: "" },
      { nama: "Contoh Nama Tiga", kelas: "XII", jurusan: "Pengembangan Perangkat Lunak dan Gim", foto: "" }
    ]
  },
  "2027/2028": { pembina: [], pengurus: [], anggota: [] },
  "2028/2029": { pembina: [], pengurus: [], anggota: [] },
  "2029/2030": { pembina: [], pengurus: [], anggota: [] }
};

/* =====================================================================
   KONTEN BAWAAN — acara, galeri, renungan
   ---------------------------------------------------------------------
   Dipakai halaman utama selama server (Google Sheets) belum berisi data,
   dan bisa disalin sekali ke server lewat admin.html → Impor data bawaan.
   Setelah itu, ubah isinya lewat admin.html (tidak perlu unggah ulang).
   ===================================================================== */

/* --- Acara khusus (Natal, Retret, Baksos, dll): tanggal format "TAHUN-BULAN-HARI". Yang sudah lewat otomatis disembunyikan. ---
   Ibadah Jumat TIDAK perlu ditulis di sini karena sudah otomatis. --- */
const ACARA = [                                                                      // EDIT (contoh)
  { tanggal: "2026-11-13", judul: "Persekutuan Gabungan Sekota",               jam: "08.00 WIB", lokasi: "Lokasi Menyusul" },
  { tanggal: "2026-12-11", judul: "Retreat", jam: "13.00 WIB", lokasi: "Votel De Bandungan" }
];

/* --- Galeri: src = nama file foto (mis. "img/galeri/natal1.jpg"). Kosong "" = kotak placeholder. --- */
const GALERI = [                                                                     // EDIT
  { src: "img/galeri/doa-pagi.jpg", caption: "Doa Pagi" },
  { src: "img/galeri/doa-rutin.jpg", caption: "Doa Rutin" },
  { src: "img/galeri/persekutuan-history-maker.jpg", caption: "Persekutuan Bersama History Maker" },
  { src: "img/galeri/persekutuan-kelas-x-hm.jpg", caption: "Persekutuan Kelas X" },
  { src: "img/galeri/persekutuan-rutin.jpg", caption: "Persekutuan Rutin" },
  { src: "img/galeri/toleransi-hari-santri.jpg", caption: "Memperingati Hari Santri" },
  { src: "img/galeri/foto-bersama-kelas-x.jpg", caption: "Anggota Kelas X" },
  { src: "img/galeri/retreat.jpg", caption: "Retreat" }
];

/* --- Renungan harian: 30 renungan (satu bulan), berganti otomatis tiap hari lalu berulang.
   Tambah/ubah sesuka hati — urutan bebas, jumlahnya boleh berapa saja. --- */
const RENUNGAN = [                                                                   // EDIT
  { ref: "Amsal 3:5", ayat: "Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.",
    isi: "Kadang kita merasa harus mengatur semuanya sendiri: nilai, masa depan, pertemanan. Hari ini, serahkan satu kekhawatiranmu kepada Tuhan dan percayalah, Dia tahu jalan terbaik.",
    doa: "Tuhan, ajar aku percaya kepada-Mu lebih dari rencanaku sendiri. Amin." },
  { ref: "Filipi 4:13", ayat: "Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku.",
    isi: "Tugas menumpuk, praktik yang melelahkan, atau ujian yang menegangkan? Kekuatanmu bukan hanya dari dirimu. Tuhan menyertai setiap langkahmu hari ini.",
    doa: "Tuhan, kuatkan aku menghadapi hari ini. Amin." },
  { ref: "Yosua 1:9", ayat: "Bukankah telah Kuperintahkan kepadamu: kuatkan dan teguhkanlah hatimu? Janganlah kecut dan tawar hati, sebab TUHAN, Allahmu, menyertai engkau, ke mana pun engkau pergi.",
    isi: "Kamu tidak pernah berjalan sendirian, entah di kelas, di bengkel, saat PKL, maupun di rumah. Beranilah, karena Tuhan menyertaimu.",
    doa: "Tuhan, terima kasih Engkau selalu menyertaiku. Amin." },
  { ref: "1 Timotius 4:12", ayat: "Jangan seorangpun menganggap engkau rendah karena engkau muda. Jadilah teladan bagi orang-orang percaya dalam perkataanmu, tingkah lakumu, kasihmu, kesetiaanmu dan kesucianmu.",
    isi: "Usia muda bukan alasan untuk menunggu. Kamu bisa jadi teladan sekarang lewat kata-kata yang baik, kejujuran, dan sikap yang menghormati orang lain.",
    doa: "Tuhan, pakai aku menjadi teladan di sekolahku. Amin." },
  { ref: "Matius 5:16", ayat: "Demikianlah hendaknya terangmu bercahaya di depan orang, supaya mereka melihat perbuatanmu yang baik dan memuliakan Bapamu yang di sorga.",
    isi: "Terang tidak perlu berisik. Senyum, bantuan kecil, dan kejujuran sederhana bisa membuat orang di sekitarmu melihat kasih Tuhan.",
    doa: "Tuhan, biarlah hidupku menjadi terang bagi teman-temanku. Amin." },
  { ref: "Mazmur 119:105", ayat: "Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.",
    isi: "Saat bingung menentukan pilihan, firman Tuhan menjadi lampu kecil yang menerangi langkah berikutnya. Luangkan beberapa menit untuk membacanya hari ini.",
    doa: "Tuhan, tuntun langkahku lewat firman-Mu. Amin." },
  { ref: "Yohanes 13:34", ayat: "Perintah baru Kuberikan kepadamu, yaitu supaya kamu saling mengasihi; sama seperti Aku telah mengasihi kamu demikian pula kamu harus saling mengasihi.",
    isi: "Mengasihi bisa dimulai dari hal kecil: menyapa teman yang sendirian, mendoakan yang sedang sedih, atau mau mengalah. Siapa yang bisa kamu kasihi hari ini?",
    doa: "Tuhan, ajar aku mengasihi seperti Engkau mengasihiku. Amin." },
  { ref: "Yohanes 3:16", ayat: "Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal.",
    isi: "Kasih Tuhan bukan hadiah karena kita sudah baik, tapi karena Dia memang mengasihi. Hari ini kamu tidak perlu membuktikan apa pun untuk dicintai.",
    doa: "Tuhan, terima kasih atas kasih-Mu yang tidak bersyarat. Amin." },
  { ref: "Roma 8:28", ayat: "Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.",
    isi: "Tidak semua yang terjadi hari ini menyenangkan. Tapi kalau kamu mengasihi Tuhan, Dia bisa memakai bahkan hal yang sulit untuk membentukmu jadi lebih baik.",
    doa: "Tuhan, tolong aku melihat kebaikan-Mu bahkan di hari yang berat. Amin." },
  { ref: "Yeremia 29:11", ayat: "Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan.",
    isi: "Masa depanmu tidak ditentukan oleh satu nilai jelek atau satu kesalahan. Tuhan sudah menyiapkan rencana yang baik, dan langkah kecil hari ini adalah bagian dari rencana itu.",
    doa: "Tuhan, aku percaya masa depanku ada di tangan-Mu. Amin." },
  { ref: "Yesaya 41:10", ayat: "Janganlah takut, sebab Aku menyertai engkau, janganlah bimbang, sebab Aku ini Allahmu; Aku akan meneguhkan, bahkan akan menolong engkau; Aku akan memegang engkau dengan tangan kanan-Ku yang membawa kemenangan.",
    isi: "Rasa takut itu wajar, terutama sebelum ujian atau saat harus tampil. Yang membedakan: kamu tidak menghadapinya sendiri. Tuhan memegang tanganmu.",
    doa: "Tuhan, genggam tanganku saat aku takut. Amin." },
  { ref: "Matius 11:28", ayat: "Marilah kepada-Ku, semua yang letih lesu dan berbeban berat, Aku akan memberi kelegaan kepadamu.",
    isi: "Kalau hari ini terasa berat, kamu tidak perlu pura-pura kuat. Datang kepada Tuhan apa adanya, termasuk dengan lelahmu.",
    doa: "Tuhan, aku datang membawa lelahku. Beri aku kelegaan. Amin." },
  { ref: "1 Petrus 5:7", ayat: "Serahkanlah segala kekuatiranmu kepada-Nya, sebab Ia yang memelihara kamu.",
    isi: "Kekhawatiran yang dipendam sendiri makin berat. Ceritakan kepada Tuhan, lalu lakukan satu hal kecil yang bisa kamu lakukan hari ini.",
    doa: "Tuhan, aku serahkan kekhawatiranku kepada-Mu. Amin." },
  { ref: "Filipi 4:6", ayat: "Janganlah hendaknya kamu kuatir tentang apapun juga, tetapi nyatakanlah dalam segala hal keinginanmu kepada Allah dalam doa dan permohonan dengan ucapan syukur.",
    isi: "Doa bukan hanya untuk hal besar. Nilai, keluarga, pertemanan—semua boleh kamu bawa kepada Tuhan, disertai ucapan syukur.",
    doa: "Tuhan, terima kasih. Aku membawa semua keinginanku kepada-Mu. Amin." },
  { ref: "Mazmur 23:1", ayat: "TUHAN adalah gembalaku, takkan kekurangan aku.",
    isi: "Kalau Tuhan adalah gembalaku, kamu tidak akan kekurangan yang benar-benar kamu butuhkan. Fokus pada apa yang ada, bukan hanya pada apa yang belum ada.",
    doa: "Tuhan, cukupkan aku dan ajarkan aku bersyukur. Amin." },
  { ref: "Yesaya 40:31", ayat: "Tetapi orang-orang yang menanti-nantikan TUHAN mendapat kekuatan baru: mereka seumpama rajawali yang naik terbang dengan kekuatan sayapnya; mereka berlari dan tidak menjadi lesu, mereka berjalan dan tidak menjadi lelah.",
    isi: "Kekuatan baru tidak datang dari memaksakan diri terus-menerus, tapi dari menanti Tuhan. Beri waktu untuk diam dan berdoa sebelum kembali berjuang.",
    doa: "Tuhan, perbarui kekuatanku hari ini. Amin." },
  { ref: "Roma 12:2", ayat: "Janganlah kamu menjadi serupa dengan dunia ini, tetapi berubahlah oleh pembaharuan budimu, sehingga kamu dapat membedakan manakah kehendak Allah: apa yang baik, yang berkenan kepada Allah dan yang sempurna.",
    isi: "Mengikuti arus itu mudah: ikut cara bicara teman, ikut standar media sosial. Berubah berarti memilih cara berpikir yang berbeda—dan itu butuh keberanian.",
    doa: "Tuhan, perbarui cara pikirku agar sesuai kehendak-Mu. Amin." },
  { ref: "Kolose 3:23", ayat: "Apapun juga yang kamu perbuat, perbuatlah dengan segenap hatimu seperti untuk Tuhan dan bukan untuk manusia.",
    isi: "Tugas sekolah, piket kelas, atau pekerjaan rumah bisa terasa membosankan. Kerjakan dengan sungguh-sungguh, karena yang kamu layani adalah Tuhan.",
    doa: "Tuhan, aku bekerja untuk-Mu, bukan hanya untuk dilihat orang. Amin." },
  { ref: "Amsal 16:3", ayat: "Serahkanlah perbuatanmu kepada TUHAN, maka terlaksanalah segala rencanamu.",
    isi: "Rencana tanpa doa sering hanya jadi keinginan. Bawa rencanamu kepada Tuhan, lalu kerjakan bagianmu dengan setia.",
    doa: "Tuhan, aku menyerahkan rencanaku kepada-Mu. Amin." },
  { ref: "Yakobus 1:5", ayat: "Tetapi apabila di antara kamu ada yang kekurangan hikmat, hendaklah ia memintakannya kepada Allah, yang memberikan kepada semua orang dengan murah hati dan dengan tidak membangkit-bangkit, maka hal itu akan diberikan kepadanya.",
    isi: "Bingung memilih jurusan, teman, atau keputusan kecil? Minta hikmat kepada Tuhan—Dia memberi dengan murah hati, tanpa mengungkit.",
    doa: "Tuhan, beri aku hikmat untuk memilih dengan benar. Amin." },
  { ref: "1 Korintus 10:13", ayat: "Pencobaan-pencobaan yang kamu alami ialah pencobaan-pencobaan biasa, yang tidak melebihi kekuatan manusia. Sebab Allah setia dan karena itu Ia tidak akan membiarkan kamu dicobai melampaui kekuatanmu. Pada waktu kamu dicobai Ia akan memberikan kepadamu jalan ke luar, sehingga kamu dapat menanggungnya.",
    isi: "Godaan tidak akan melebihi kekuatanmu, dan selalu ada jalan keluar. Sering jalan keluarnya sederhana: pergi dari situasi itu, atau bilang tidak.",
    doa: "Tuhan, tunjukkan jalan keluar saat aku dicobai. Amin." },
  { ref: "2 Timotius 1:7", ayat: "Sebab Allah memberikan kepada kita bukan roh ketakutan, melainkan roh yang membangkitkan kekuatan, kasih dan ketertiban.",
    isi: "Rasa takut bukan berasal dari Tuhan. Yang Dia beri adalah kekuatan, kasih, dan pikiran yang tertib—mulai dari satu langkah kecil hari ini.",
    doa: "Tuhan, ganti takutku dengan keberanian dari-Mu. Amin." },
  { ref: "Ibrani 11:1", ayat: "Iman adalah dasar dari segala sesuatu yang kita harapkan dan bukti dari segala sesuatu yang tidak kita lihat.",
    isi: "Iman bukan berarti tidak punya pertanyaan, tapi tetap melangkah meski belum melihat hasilnya. Percaya bahwa Tuhan bekerja di balik layar.",
    doa: "Tuhan, kuatkan imanku meski aku belum melihat hasilnya. Amin." },
  { ref: "Yakobus 1:22", ayat: "Tetapi hendaklah kamu menjadi pelaku firman dan bukan hanya pendengar saja; sebab jika tidak demikian kamu menipu diri sendiri.",
    isi: "Mendengar firman itu awal; melakukannya itu bukti. Pilih satu hal kecil dari renungan hari ini, lalu lakukan sebelum malam.",
    doa: "Tuhan, jadikan aku pelaku firman, bukan hanya pendengar. Amin." },
  { ref: "Efesus 4:32", ayat: "Tetapi hendaklah kamu ramah seorang terhadap yang lain, penuh kasih mesra dan saling mengampuni, sebagaimana Allah di dalam Kristus telah mengampuni kamu.",
    isi: "Memaafkan bukan berarti melupakan luka, tapi melepaskan hak untuk membalas. Mulai dari orang yang paling dekat: teman sekelas atau saudara di rumah.",
    doa: "Tuhan, ajar aku mengampuni seperti Engkau mengampuniku. Amin." },
  { ref: "Matius 6:33", ayat: "Tetapi carilah dahulu Kerajaan Allah dan kebenarannya, maka semuanya itu akan ditambahkan kepadamu.",
    isi: "Kita sibuk mengejar nilai, pengakuan, dan popularitas. Semua itu tidak salah, tapi bukan yang utama. Cari Tuhan dulu, sisanya Dia tambahkan.",
    doa: "Tuhan, Engkau yang utama dalam hidupku. Amin." },
  { ref: "Yohanes 14:6", ayat: 'Kata Yesus kepadanya: "Akulah jalan dan kebenaran dan hidup. Tidak ada seorangpun yang datang kepada Bapa, kalau tidak melalui Aku."',
    isi: "Banyak jalan terlihat menarik, tapi hanya satu yang membawa kepada Bapa. Yesus bukan sekadar contoh—Dia jalan itu sendiri.",
    doa: "Yesus, terima kasih Engkau jalan bagiku. Amin." },
  { ref: "Mazmur 34:19", ayat: "TUHAN itu dekat kepada orang-orang yang patah hati, dan Ia menyelamatkan orang-orang yang remuk jiwanya.",
    isi: "Kalau hari ini hatimu patah—karena keluarga, teman, atau harapan yang gagal—Tuhan tidak menjauh. Dia justru paling dekat saat kita remuk.",
    doa: "Tuhan, dekatilah aku saat hatiku patah. Amin." },
  { ref: "Zefanya 3:17", ayat: "TUHAN, Allahmu, ada di tengah-tengahmu, Dia yang gagah perkasa, yang akan menyelamatkan engkau; Ia akan bersukacita karena engkau, Ia akan memperbaharui engkau dalam kasih-Nya, Ia akan bersorak-sorai karena engkau dengan sorak-sorai.",
    isi: "Tuhan bukan hanya mengawasi dari jauh; Dia bersukacita karena kamu. Kamu berharga bukan karena prestasi, tapi karena kamu milik-Nya.",
    doa: "Tuhan, terima kasih Engkau bersukacita karena aku. Amin." },
  { ref: "Ratapan 3:22-23", ayat: "Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu!",
    isi: "Kemarin mungkin kamu gagal. Pagi ini kasih Tuhan masih baru—selalu ada kesempatan untuk mulai lagi, tanpa membawa beban kemarin.",
    doa: "Tuhan, terima kasih untuk pagi yang baru. Amin." }
];
