/* ==========================================================================
   B. KARTHI KRISHNAN — DIGITAL VISITING CARD
   Handles: tab navigation, QR generation/download, copy-to-clipboard,
   vCard export, toast notifications.
   ========================================================================== */

(function () {
  'use strict';

  var CONTACT = {
    name: 'B. Karthi Krishnan',
    degree: 'B.Com (CA), LLB',
    title: 'Advocate',
    mobile: '6381745435',
    mobileIntl: '916381745435',
    email: 'karthi20026@gmail.com',
    address: '1/2748 Balan Street, Pandian Nager, Virudhunagar, Tamil Nadu',
    city: 'Virudhunagar, Tamil Nadu'
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initTabs();
    initQRCode();
    initCopyButtons();
    initSaveVCard();
    initDownloadQR();
    initCopyLink();
    initKeyboardRows();
    initPhotoModal();
  }

  /* ---------------- Tab navigation ---------------- */

  function initTabs() {
    var profileBtn = document.getElementById('nav-profile-btn');
    var qrBtn = document.getElementById('nav-qr-btn');
    var backBtn = document.getElementById('back-to-profile-btn');
    var profileSection = document.getElementById('profile-section');
    var qrSection = document.getElementById('qr-section');

    function showProfile() {
      setActive(profileBtn, qrBtn);
      profileSection.classList.add('active');
      qrSection.classList.remove('active');
    }

    function showQR() {
      setActive(qrBtn, profileBtn);
      qrSection.classList.add('active');
      profileSection.classList.remove('active');
    }

    function setActive(onBtn, offBtn) {
      onBtn.classList.add('active');
      onBtn.setAttribute('aria-selected', 'true');
      offBtn.classList.remove('active');
      offBtn.setAttribute('aria-selected', 'false');
    }

    profileBtn.addEventListener('click', showProfile);
    qrBtn.addEventListener('click', showQR);
    if (backBtn) backBtn.addEventListener('click', showProfile);
  }

  function getCleanUrl() {
    var href = window.location.href.split('#')[0];
    if (href.indexOf('file:') === 0 || href.indexOf('localhost') !== -1 || href.indexOf('127.0.0.1') !== -1) {
      return 'https://sakthiitmalar.github.io/lawyer/';
    }
    return href;
  }

  /* ---------------- QR code ---------------- */

  function initQRCode() {
    var holder = document.getElementById('qr-canvas-holder');
    if (!holder || typeof QRCode === 'undefined') return;

    var qrValue = getCleanUrl();

    new QRCode(holder, {
      text: qrValue,
      width: 176,
      height: 176,
      colorDark: '#0A0E17',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  function initDownloadQR() {
    var btn = document.getElementById('download-qr-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var holder = document.getElementById('qr-canvas-holder');
      var img = holder.querySelector('img');
      var canvas = holder.querySelector('canvas');
      var dataUrl = img && img.src ? img.src : (canvas ? canvas.toDataURL('image/png') : null);

      if (!dataUrl) {
        showToast('QR image is not ready yet', 'fa-triangle-exclamation');
        return;
      }

      var a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'Karthi-Krishnan-Advocate-QR.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('QR code downloaded', 'fa-circle-check');
    });
  }

  function initCopyLink() {
    var btn = document.getElementById('copy-link-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var link = getCleanUrl();
      copyToClipboard(link, 'Profile link copied');
    });
  }

  /* ---------------- Copy detail rows ---------------- */

  function initCopyButtons() {
    var copyBtns = document.querySelectorAll('.row-copy-btn');
    copyBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var row = btn.closest('.detail-row');
        var valEl = row ? row.querySelector('.row-val') : null;
        var label = row ? row.querySelector('.row-label') : null;
        if (valEl) {
          copyToClipboard(valEl.textContent.trim(), (label ? label.textContent.trim() : 'Detail') + ' copied');
        }
      });
    });
  }

  // Called from inline onclick on .detail-row (kept for markup compatibility)
  window.copyDetailText = function (elementId, label) {
    var el = document.getElementById(elementId);
    if (!el) return;
    copyToClipboard(el.textContent.trim(), label + ' copied');
  };

  function initKeyboardRows() {
    document.querySelectorAll('.detail-row[role="button"]').forEach(function (row) {
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });
  }

  /* ---------------- vCard ---------------- */

  function initSaveVCard() {
    var btn = document.getElementById('save-vcard-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var vcf = buildVCard();
      var blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'B-Karthi-Krishnan-Advocate.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Contact saved — check your downloads', 'fa-address-card');
    });
  }

  function buildVCard() {
    return [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Krishnan;Karthi;B.;;',
      'FN:' + CONTACT.name,
      'ORG:Law Chambers of ' + CONTACT.name,
      'TITLE:' + CONTACT.title + ' (' + CONTACT.degree + ')',
      'TEL;TYPE=CELL,VOICE:+91' + CONTACT.mobile,
      'EMAIL;TYPE=INTERNET:' + CONTACT.email,
      'ADR;TYPE=WORK:;;' + CONTACT.address + ';;;;India',
      'URL:' + getCleanUrl(),
      'END:VCARD'
    ].join('\n');
  }

  /* ---------------- Clipboard + Toast ---------------- */

  function copyToClipboard(text, message) {
    var done = function (ok) {
      showToast(ok ? message : 'Could not copy — long press to copy manually', ok ? 'fa-circle-check' : 'fa-triangle-exclamation');
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      done(ok);
    } catch (err) {
      done(false);
    }
  }

  function showToast(message, icon) {
    var box = document.getElementById('toast-box');
    if (!box) return;

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-check') + '"></i><span>' + escapeHtml(message) + '</span>';
    box.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('hide');
      setTimeout(function () { toast.remove(); }, 320);
    }, 2200);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- Photo Modal / Lightbox ---------------- */

  function initPhotoModal() {
    var avatarTargets = document.querySelectorAll('.round-avatar-container, #avatar-photo, .round-avatar-img-wrapper, .avatar-emblem-badge');
    var modal = document.getElementById('photo-modal');
    var closeBtn = document.getElementById('photo-modal-close');
    var dismissBtn = document.getElementById('photo-modal-dismiss-btn');
    var overlay = document.getElementById('photo-modal-overlay');

    if (!modal) return;

    function openModal(e) {
      if (e) e.preventDefault();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    avatarTargets.forEach(function (el) {
      el.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

})();
