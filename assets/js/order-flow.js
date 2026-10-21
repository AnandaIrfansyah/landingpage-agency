/* ============================================
   PLAN B — ORDER FLOW (Mock/Dummy)
   ============================================ */

(function () {
  'use strict';

  // ============================================================
  // MOCK DATA
  // ============================================================
  const MOCK = {
    validCodes: {
      'PLANB-ABCD-1234': {
        nama: 'Andi Pratama',
        kampus: 'Universitas Indonesia',
        layanan: 'Paket Website + Foto',
        items: [
          { nama: 'Landing Page Company Profile', harga: 1500000 },
          { nama: 'Foto Produk 20 SKU', harga: 800000 },
          { nama: 'Editing & Retouch', harga: 300000 }
        ],
        total: 2600000,
        skema: 'dp',
        dpPersen: 50,
        kesepakatan: 'Pengerjaan 14 hari kerja. Revisi 3x. File source diserahkan setelah pelunasan.',
        tahapAktif: 'dp'
      },
      'PLANB-EXPD-9999': { _expired: true },
      'PLANB-USED-8888': { _used: true }
    },
    uniqueCode: 137,
    qrDuration: 30 * 60
  };

  // ============================================================
  // STATE
  // ============================================================
  const state = {
    currentScreen: 'form',
    currentStep: 1,
    redeemCode: null,
    redeemData: null,
    paymentAmount: 0,
    timerInterval: null,
    timerRemaining: 0,
    proofFile: null
  };

  // ============================================================
  // ELEMENT REFS
  // ============================================================
  const $ = (id) => document.getElementById(id);

  const screens = {
    form: $('screenForm'),
    redeem: $('screenRedeem'),
    payment: $('screenPayment'),
    result: $('screenResult')
  };

  const stepItems = document.querySelectorAll('.step-item');

  // ============================================================
  // SCREEN NAVIGATION
  // ============================================================
  function showScreen(name, step) {
    Object.keys(screens).forEach(key => {
      if (screens[key]) screens[key].classList.remove('is-active');
    });
    if (screens[name]) screens[name].classList.add('is-active');

    state.currentScreen = name;
    state.currentStep = step;

    stepItems.forEach(item => {
      const itemStep = parseInt(item.dataset.step, 10);
      item.classList.remove('is-active', 'is-done');
      if (itemStep < step) item.classList.add('is-done');
      if (itemStep === step) item.classList.add('is-active');
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================================
  // LAYAR 1: FORM CEK KODE
  // ============================================================
  const form = $('redeemForm');
  if (!form) return; // guard kalau di halaman lain

  function showError(field, message) {
    const el = document.querySelector(`[data-error="${field}"]`);
    if (el) {
      el.textContent = message;
      el.classList.add('is-visible');
    }
    const input = document.getElementById(field);
    if (input) input.classList.add('is-invalid');
  }

  function clearError(field) {
    const el = document.querySelector(`[data-error="${field}"]`);
    if (el) {
      el.textContent = '';
      el.classList.remove('is-visible');
    }
    const input = document.getElementById(field);
    if (input) input.classList.remove('is-invalid');
  }

  function isValidWA(val) {
    const clean = val.replace(/\D/g, '');
    return /^(08|62)\d{8,13}$/.test(clean);
  }

  function isValidEmail(val) {
    if (!val) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    ['nama', 'wa', 'email', 'redeemCode'].forEach(clearError);

    if (!form.nama.value.trim()) {
      showError('nama', 'Nama wajib diisi.');
      valid = false;
    }

    if (!form.wa.value.trim()) {
      showError('wa', 'Nomor WhatsApp wajib diisi.');
      valid = false;
    } else if (!isValidWA(form.wa.value)) {
      showError('wa', 'Format nomor harus 08xxx atau 62xxx (angka).');
      valid = false;
    }

    if (!isValidEmail(form.email.value.trim())) {
      showError('email', 'Format email tidak valid.');
      valid = false;
    }

    if (!form.redeemCode.value.trim()) {
      showError('redeemCode', 'Kode redeem wajib diisi.');
      valid = false;
    }

    if (!valid) {
      const firstError = form.querySelector('.form-error.is-visible');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    checkRedeemCode(form.redeemCode.value.trim().toUpperCase());
  });

  // ============================================================
  // LAYAR 2: CEK KODE REDEEM
  // ============================================================
  const btnCheckCode = $('btnCheckCode');

  function checkRedeemCode(code) {
    if (btnCheckCode) {
      btnCheckCode.disabled = true;
      btnCheckCode.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengecek...';
    }

    setTimeout(() => {
      if (btnCheckCode) {
        btnCheckCode.disabled = false;
        btnCheckCode.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cek Kode & Lanjut';
      }

      const data = MOCK.validCodes[code];

      if (!data) {
        showRedeemError('not-found', 'Kode Tidak Ditemukan', 'Kode tidak ditemukan. Cek lagi ya.');
        return;
      }

      if (data._expired) {
        showRedeemError('expired', 'Kode Kedaluwarsa', 'Kode ini sudah kedaluwarsa. Hubungi admin lewat WhatsApp untuk mendapatkan kode baru.');
        return;
      }

      if (data._used) {
        showRedeemError('used', 'Sudah Dibayar', 'Tahap ini sudah dibayar. Tidak perlu membayar lagi.');
        return;
      }

      state.redeemCode = code;
      state.redeemData = data;
      renderRedeemCard(data);
      showScreen('redeem', 2);
    }, 800);
  }

  function showRedeemError(type, title, message) {
    const card = $('redeemCard');
    if (card) card.style.display = 'none';

    const errBox = $('redeemStatusError');
    if (errBox) errBox.hidden = false;

    const tEl = $('statusTitle');
    const mEl = $('statusMessage');
    if (tEl) tEl.textContent = title;
    if (mEl) mEl.textContent = message;

    const icon = $('statusIcon');
    if (icon) {
      icon.className = 'status-icon';
      if (type === 'not-found') icon.classList.add('is-danger');
      if (type === 'expired') icon.classList.add('is-warning');
      if (type === 'used') icon.classList.add('is-info');
    }

    showScreen('redeem', 2);
  }

  const btnBackToForm = $('btnBackToForm');
  if (btnBackToForm) {
    btnBackToForm.addEventListener('click', () => {
      const errBox = $('redeemStatusError');
      const card = $('redeemCard');
      if (errBox) errBox.hidden = true;
      if (card) card.style.display = '';
      showScreen('form', 1);
    });
  }

  function renderRedeemCard(data) {
    const card = $('redeemCard');
    if (!card) return;
    card.style.display = '';

    const nominalTahap = data.skema === 'dp'
      ? Math.round(data.total * data.dpPersen / 100)
      : data.total;

    const tahapLabel = data.skema === 'dp'
      ? (data.tahapAktif === 'dp' ? 'DP (50%)' : 'Pelunasan (50%)')
      : 'Lunas';

    const sisa = data.skema === 'dp' ? data.total - nominalTahap : 0;

    const samarNama = data.nama.split(' ').map(w => {
      return w[0] + '*'.repeat(Math.max(1, w.length - 1));
    }).join(' ');

    const itemsHtml = data.items.map(item => `
      <li class="redeem-item">
        <span>${item.nama}</span>
        <span>Rp ${formatRupiah(item.harga)}</span>
      </li>
    `).join('');

    card.innerHTML = `
      <div class="redeem-customer">
        <div class="redeem-customer-icon">
          <i class="fa-solid fa-user"></i>
        </div>
        <div>
          <span class="redeem-customer-label">Pemesan</span>
          <span class="redeem-customer-name">${samarNama}</span>
          <span class="redeem-customer-meta">${data.kampus || '—'}</span>
        </div>
      </div>

      <div class="redeem-section">
        <h3><i class="fa-solid fa-list-check"></i> Rincian Item</h3>
        <ul class="redeem-items">
          ${itemsHtml}
        </ul>
      </div>

      <div class="redeem-totals">
        <div class="redeem-total-row">
          <span>Total Project</span>
          <strong>Rp ${formatRupiah(data.total)}</strong>
        </div>
        <div class="redeem-total-row muted">
          <span>Skema Bayar</span>
          <span>${data.skema === 'dp' ? 'DP 50% + Pelunasan 50%' : 'Lunas'}</span>
        </div>
        ${data.skema === 'dp' ? `
        <div class="redeem-total-row muted">
          <span>Sisa (dibayar nanti)</span>
          <span>Rp ${formatRupiah(sisa)}</span>
        </div>` : ''}
      </div>

      <div class="redeem-active">
        <span class="redeem-active-label">Yang perlu dibayar sekarang</span>
        <span class="redeem-active-phase">${tahapLabel}</span>
        <span class="redeem-active-amount">Rp ${formatRupiah(nominalTahap)}</span>
      </div>

      <div class="redeem-agreement">
        <h3><i class="fa-solid fa-file-contract"></i> Ringkasan Kesepakatan</h3>
        <p>${data.kesepakatan}</p>
      </div>

      <label class="redeem-check">
        <input type="checkbox" id="agreeCheck">
        <span>Saya setuju dengan rincian dan kesepakatan di atas.</span>
      </label>

      <div class="redeem-actions">
        <button type="button" class="btn btn-primary" id="btnGoToPayment" disabled>
          Lanjut ke Pembayaran <i class="fa-solid fa-arrow-right"></i>
        </button>
        <a href="https://wa.me/6281234567890?text=Halo%20Plan%20B,%20saya%20mau%20tanya%20soal%20kode%20redeem" class="btn btn-ghost" target="_blank">
          <i class="fa-brands fa-whatsapp"></i> Chat Admin
        </a>
      </div>
    `;

    state.paymentAmount = nominalTahap;

    const check = $('agreeCheck');
    const btnPay = $('btnGoToPayment');

    if (check && btnPay) {
      check.addEventListener('change', () => {
        btnPay.disabled = !check.checked;
      });
      btnPay.addEventListener('click', () => {
        startPayment();
      });
    }
  }

  // ============================================================
  // LAYAR 3: PEMBAYARAN QRIS
  // ============================================================
  function startPayment() {
    const amount = state.paymentAmount + MOCK.uniqueCode;

    const qrAmount = $('qrAmount');
    if (qrAmount) qrAmount.textContent = `Rp ${formatRupiah(amount)}`;

    const qrExpired = $('qrExpired');
    const qrTimer = $('qrTimer');
    if (qrExpired) qrExpired.hidden = true;
    if (qrTimer) qrTimer.hidden = false;

    const qrBox = document.querySelector('.qr-box');
    const qrAmountBox = document.querySelector('.qr-amount-box');
    if (qrBox) qrBox.style.display = '';
    if (qrAmountBox) qrAmountBox.style.display = '';

    startTimer(MOCK.qrDuration);
    showScreen('payment', 3);
  }

  function startTimer(seconds) {
    clearInterval(state.timerInterval);
    state.timerRemaining = seconds;
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timerRemaining--;
      updateTimerDisplay();

      if (state.timerRemaining <= 0) {
        clearInterval(state.timerInterval);
        const qrTimer = $('qrTimer');
        const qrExpired = $('qrExpired');
        if (qrTimer) qrTimer.hidden = true;
        if (qrExpired) qrExpired.hidden = false;
        const qrBox = document.querySelector('.qr-box');
        const qrAmountBox = document.querySelector('.qr-amount-box');
        if (qrBox) qrBox.style.display = 'none';
        if (qrAmountBox) qrAmountBox.style.display = 'none';
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const m = Math.floor(state.timerRemaining / 60);
    const s = state.timerRemaining % 60;
    const el = $('timerDisplay');
    if (el) el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const btnCopyAmount = $('btnCopyAmount');
  if (btnCopyAmount) {
    btnCopyAmount.addEventListener('click', () => {
      const textEl = $('qrAmount');
      if (!textEl) return;
      const text = textEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const original = btnCopyAmount.innerHTML;
        btnCopyAmount.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin';
        setTimeout(() => {
          btnCopyAmount.innerHTML = original;
        }, 1500);
      });
    });
  }

  const btnNewQR = $('btnNewQR');
  if (btnNewQR) {
    btnNewQR.addEventListener('click', () => {
      startPayment();
    });
  }

  const btnPaid = $('btnPaid');
  if (btnPaid) {
    btnPaid.addEventListener('click', () => {
      openModal('modalUpload');
    });
  }

  // ============================================================
  // MODAL UPLOAD
  // ============================================================
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', () => closeModal('modalUpload'));
  });

  const uploadInput = $('uploadInput');
  const uploadPlaceholder = $('uploadPlaceholder');
  const uploadPreview = $('uploadPreview');
  const previewImage = $('previewImage');
  const uploadRemove = $('uploadRemove');
  const uploadError = $('uploadError');
  const btnSendProof = $('btnSendProof');
  const uploadZone = $('uploadZone');

  if (uploadZone && uploadInput) {
    uploadZone.addEventListener('click', (e) => {
      if (e.target.closest('.upload-remove')) return;
      uploadInput.click();
    });

    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files[0];
      if (!file) return;
      handleFile(file);
    });
  }

  function handleFile(file) {
    if (uploadError) uploadError.hidden = true;

    if (!file.type.startsWith('image/')) {
      if (uploadError) {
        uploadError.textContent = 'File harus berupa gambar (JPG, PNG).';
        uploadError.hidden = false;
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      if (uploadError) {
        uploadError.textContent = 'Ukuran maksimal 5 MB.';
        uploadError.hidden = false;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImage) previewImage.src = e.target.result;
      if (uploadPlaceholder) uploadPlaceholder.hidden = true;
      if (uploadPreview) uploadPreview.hidden = false;
      state.proofFile = file;
      if (btnSendProof) btnSendProof.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  if (uploadRemove) {
    uploadRemove.addEventListener('click', (e) => {
      e.stopPropagation();
      if (uploadInput) uploadInput.value = '';
      if (previewImage) previewImage.src = '';
      if (uploadPreview) uploadPreview.hidden = true;
      if (uploadPlaceholder) uploadPlaceholder.hidden = false;
      state.proofFile = null;
      if (btnSendProof) btnSendProof.disabled = true;
    });
  }

  if (btnSendProof) {
    btnSendProof.addEventListener('click', () => {
      if (!state.proofFile) return;

      btnSendProof.disabled = true;
      btnSendProof.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

      setTimeout(() => {
        btnSendProof.innerHTML = 'Kirim Bukti <i class="fa-solid fa-paper-plane"></i>';
        btnSendProof.disabled = false;

        closeModal('modalUpload');
        showResult('waiting');
      }, 1200);
    });
  }

  // ============================================================
  // LAYAR 4: HASIL
  // ============================================================
  function showResult(status) {
    const card = $('resultCard');
    const title = $('resultTitle');
    const subtitle = $('resultSubtitle');

    if (!card) return;
    const dataRedeem = state.redeemData || {};

    card.innerHTML = '';

    if (status === 'waiting') {
      if (title) title.textContent = 'Menunggu Konfirmasi';
      if (subtitle) subtitle.textContent = 'Bukti pembayaranmu sudah kami terima. Admin akan memverifikasi dalam waktu singkat.';

      card.innerHTML = `
        <div class="result-status result-status-waiting">
          <div class="result-icon">
            <i class="fa-solid fa-hourglass-half"></i>
          </div>
          <h2>Sedang Diverifikasi</h2>
          <p>Admin akan mengecek bukti bayar kamu. Biasanya dalam 1–3 jam di jam kerja.</p>
        </div>
        <div class="result-info">
          <p><i class="fa-solid fa-circle-info"></i> Kami akan kirim notifikasi via WhatsApp ketika sudah dikonfirmasi.</p>
        </div>
        <div class="result-actions">
          <a href="https://wa.me/6281234567890?text=Halo%20Plan%20B,%20saya%20sudah%20kirim%20bukti%20bayar" class="btn btn-primary" target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Konfirmasi via WhatsApp
          </a>
        </div>
      `;
    }

    if (status === 'ok') {
      if (title) title.textContent = 'Pembayaran Terkonfirmasi';
      if (subtitle) subtitle.textContent = 'Terima kasih! Pembayaranmu sudah kami terima.';

      const isDP = dataRedeem.skema === 'dp' && dataRedeem.tahapAktif === 'dp';

      card.innerHTML = `
        <div class="result-status result-status-ok">
          <div class="result-icon">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h2>Berhasil!</h2>
          <p>Pembayaran kamu sudah kami verifikasi.</p>
        </div>

        <div class="result-summary">
          <h3><i class="fa-solid fa-receipt"></i> Ringkasan Pembayaran</h3>
          <div class="summary-row">
            <span>Kode Redeem</span>
            <strong>${state.redeemCode || '-'}</strong>
          </div>
          <div class="summary-row">
            <span>Nominal Dibayar</span>
            <strong>Rp ${formatRupiah(state.paymentAmount + MOCK.uniqueCode)}</strong>
          </div>
          <div class="summary-row">
            <span>Status</span>
            <span class="badge-ok">Lunas</span>
          </div>
        </div>

        <div class="result-next">
          <h3><i class="fa-solid fa-arrow-right"></i> Langkah Berikutnya</h3>
          <p>Admin akan menghubungi kamu via WhatsApp untuk mulai pengerjaan. Pastikan nomor kamu aktif.</p>
          ${isDP ? `
          <div class="result-info">
            <p><i class="fa-solid fa-circle-info"></i> <strong>Pelunasan</strong> akan dibuka nanti menggunakan kode redeem yang sama. Kami akan kabari via WhatsApp.</p>
          </div>` : ''}
        </div>

        <div class="result-actions">
          <a href="https://wa.me/6281234567890?text=Halo%20Plan%20B,%20pembayaran%20saya%20sudah%20terkonfirmasi" class="btn btn-primary" target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Chat Admin
          </a>
        </div>
      `;
    }

    if (status === 'reject') {
      if (title) title.textContent = 'Pembayaran Ditolak';
      if (subtitle) subtitle.textContent = 'Bukti bayar tidak dapat diverifikasi. Silakan cek kembali.';

      card.innerHTML = `
        <div class="result-status result-status-reject">
          <div class="result-icon">
            <i class="fa-solid fa-circle-xmark"></i>
          </div>
          <h2>Bukti Tidak Valid</h2>
          <p><strong>Alasan:</strong> Nominal yang ditransfer tidak sesuai atau bukti tidak jelas.</p>
        </div>
        <div class="result-actions">
          <button type="button" class="btn btn-primary" id="btnReupload">
            <i class="fa-solid fa-upload"></i> Unggah Ulang Bukti
          </button>
          <a href="https://wa.me/6281234567890?text=Halo%20Plan%20B" class="btn btn-ghost" target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Chat Admin
          </a>
        </div>
      `;

      const btnReupload = document.getElementById('btnReupload');
      if (btnReupload) {
        btnReupload.addEventListener('click', () => openModal('modalUpload'));
      }
    }

    if (status === 'expired') {
      if (title) title.textContent = 'Pembayaran Kedaluwarsa';
      if (subtitle) subtitle.textContent = 'Waktu pembayaran sudah habis.';

      card.innerHTML = `
        <div class="result-status result-status-expired">
          <div class="result-icon">
            <i class="fa-solid fa-hourglass-end"></i>
          </div>
          <h2>Waktu Habis</h2>
          <p>Batas waktu pembayaran sudah lewat. Silakan chat admin untuk membuat kode baru.</p>
        </div>
        <div class="result-actions">
          <a href="https://wa.me/6281234567890?text=Halo%20Plan%20B,%20pembayaran%20saya%20kedaluwarsa" class="btn btn-primary" target="_blank">
            <i class="fa-brands fa-whatsapp"></i> Chat Admin
          </a>
        </div>
      `;
    }

    showScreen('result', 4);
  }

  // ============================================================
  // FORMAT RUPIAH
  // ============================================================
  function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID').format(num);
  }

  // ============================================================
  // SIM PANEL
  // ============================================================
  const simToggle = $('simToggle');
  const simBody = $('simBody');

  if (simToggle && simBody) {
    simToggle.addEventListener('click', () => {
      simBody.hidden = !simBody.hidden;
    });
  }

  document.querySelectorAll('[data-sim]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sim = btn.dataset.sim;

      switch (sim) {
        case 'form':
          showScreen('form', 1);
          break;

        case 'redeem-ok': {
          state.redeemCode = 'PLANB-ABCD-1234';
          state.redeemData = MOCK.validCodes['PLANB-ABCD-1234'];
          const errBox = $('redeemStatusError');
          if (errBox) errBox.hidden = true;
          renderRedeemCard(state.redeemData);
          showScreen('redeem', 2);
          break;
        }

        case 'redeem-bad':
          showRedeemError('not-found', 'Kode Tidak Ditemukan', 'Kode tidak ditemukan. Cek lagi ya.');
          break;

        case 'redeem-exp':
          showRedeemError('expired', 'Kode Kedaluwarsa', 'Kode ini sudah kedaluwarsa. Hubungi admin lewat WhatsApp untuk mendapatkan kode baru.');
          break;

        case 'redeem-used':
          showRedeemError('used', 'Sudah Dibayar', 'Tahap ini sudah dibayar. Tidak perlu membayar lagi.');
          break;

        case 'redeem-limit':
          showRedeemError('not-found', 'Terlalu Banyak Percobaan', 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.');
          break;

        case 'payment':
          state.redeemData = MOCK.validCodes['PLANB-ABCD-1234'];
          state.paymentAmount = 1300000;
          startPayment();
          break;

        case 'payment-exp':
          state.redeemData = MOCK.validCodes['PLANB-ABCD-1234'];
          state.paymentAmount = 1300000;
          startPayment();
          setTimeout(() => {
            clearInterval(state.timerInterval);
            const qrTimer = $('qrTimer');
            const qrExpired = $('qrExpired');
            if (qrTimer) qrTimer.hidden = true;
            if (qrExpired) qrExpired.hidden = false;
            const qrBox = document.querySelector('.qr-box');
            const qrAmountBox = document.querySelector('.qr-amount-box');
            if (qrBox) qrBox.style.display = 'none';
            if (qrAmountBox) qrAmountBox.style.display = 'none';
          }, 100);
          break;

        case 'result-wait':
          state.redeemData = MOCK.validCodes['PLANB-ABCD-1234'];
          state.redeemCode = 'PLANB-ABCD-1234';
          state.paymentAmount = 1300000;
          showResult('waiting');
          break;

        case 'result-ok':
          state.redeemData = MOCK.validCodes['PLANB-ABCD-1234'];
          state.redeemCode = 'PLANB-ABCD-1234';
          state.paymentAmount = 1300000;
          showResult('ok');
          break;

        case 'result-reject':
          showResult('reject');
          break;

        case 'result-expired':
          showResult('expired');
          break;
      }
    });
  });

  // ============================================================
  // INIT
  // ============================================================
  showScreen('form', 1);

})();