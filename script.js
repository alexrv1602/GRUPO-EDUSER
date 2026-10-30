/* ===== GRUPO EDUSER — script.js ===== */

/* ---- 1. SCROLL PROGRESS BAR ---- */
const scrollBar = document.getElementById('scrollProgress');
const siteHeader = document.getElementById('siteHeader');

function updateScrollProgress() {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
  if (scrollBar) scrollBar.style.width = pct + '%';
  if (siteHeader) siteHeader.classList.toggle('scrolled', scrollTop > 80);
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });

/* ---- 2. INTERSECTION OBSERVER — Entrada de secciones ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Activar línea animada en el header de sección
      const lineHeader = entry.target.closest('.section-header') || entry.target;
      lineHeader.classList.add('line-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.anim-entry').forEach(el => {
  // Agregar delay progresivo a los service-cards en el grid
  const card = el.closest('.service-card');
  if (card && !el.style.getPropertyValue('--delay')) {
    const cards = [...document.querySelectorAll('.service-card')];
    const idx = cards.indexOf(card);
    el.style.setProperty('--delay', `${idx * 0.12}s`);
  }
  revealObserver.observe(el);
});

/* ---- 3. CONTADOR ANIMADO (Hero metrics) ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  if (isNaN(target)) return;
  const duration = 1400;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const metricsSection = document.querySelector('.hero-metrics');
if (metricsSection) {
  let countersStarted = false;
  const metricsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll('.metric-num[data-target]').forEach(el => {
        setTimeout(() => animateCounter(el), 600);
      });
    }
  }, { threshold: 0.5 });
  metricsObserver.observe(metricsSection);
}

/* ---- 4. CANVAS PARTICLES (Hero) ---- */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  const NUM = 60;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.7 ? '#C59B27' : '#FFFFFF',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: NUM }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      // Move
      p.x += p.vx;
      p.y += p.vy;
      // Wrap
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = '#FFFFFF';
          ctx.globalAlpha = (1 - dist / 120) * 0.08;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => { resize(); });
})();

/* ---- 5. SECCIÓN LINE OBSERVER (línea dorada bajo section-title) ---- */
document.querySelectorAll('.section-header').forEach(header => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      header.classList.add('line-visible');
      observer.disconnect();
    }
  }, { threshold: 0.4 });
  observer.observe(header);
});

/* ---- 6. TABLE ROW ANIMATION (Matriz) ---- */
const tableRows = document.querySelectorAll('.table-row-anim');
if (tableRows.length) {
  const tObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      tableRows.forEach((row, i) => {
        row.style.animationDelay = (i * 0.1) + 's';
        row.style.animationPlayState = 'running';
      });
      tObserver.disconnect();
    }
  }, { threshold: 0.3 });
  tableRows.forEach(row => {
    row.style.animationPlayState = 'paused';
    tObserver.observe(row);
  });
}

/* ---- 7. NAV MOBILE TOGGLE ---- */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  mainNav.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
      navToggle.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
}

/* ---- 8. ACTIVE NAV ON SCROLL (Spy) ---- */
function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  document.querySelectorAll('section[id], div[id]').forEach(sec => {
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-item[href="#${id}"]`);
    if (!link) return;
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

document.querySelectorAll('.nav-item').forEach(l => {
  l.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-item').forEach(ll => ll.classList.remove('active'));
    this.classList.add('active');
  });
});

window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ---- 9. FORMULARIO DE CONTACTO ---- */
function selectService(serviceLabel) {
  const sel = document.getElementById('fAxis');
  if (!sel) return;
  const opts = [...sel.options];
  const found = opts.find(o => o.text.toLowerCase().includes(serviceLabel.split(':')[0].toLowerCase()));
  if (found) {
    sel.value = found.value;
    sel.dispatchEvent(new Event('change'));
  }
  const formSection = document.getElementById('contacto');
  if (formSection) {
    setTimeout(() => formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// Make selectService globally accessible
window.selectService = selectService;

const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const required = ['fName', 'fOrg', 'fPhone', 'fEmail', 'fAxis', 'fMessage'];
    let allValid = true;

    required.forEach(id => {
      const field = document.getElementById(id);
      if (!field) return;
      const empty = !field.value.trim();
      field.style.borderColor = empty ? '#DC2626' : '';
      field.style.boxShadow = empty ? '0 0 0 3px rgba(220,38,38,0.15)' : '';
      if (empty) allValid = false;
    });

    if (!allValid) {
      showMsg('Por favor complete todos los campos requeridos.', 'error');
      return;
    }

    // Envío multi-canal a contactoeduser@grupoeduserr.com
    const emailField = document.getElementById('fEmail');
    const emailVal = emailField ? emailField.value.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField && !emailRegex.test(emailVal)) {
      emailField.style.borderColor = '#DC2626';
      emailField.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.15)';
      showMsg('Por favor ingrese un correo electrónico válido.', 'error');
      return;
    }

    const btn = contactForm.querySelector('.btn-submit');
    const btnText = btn.querySelector('.btn-text');
    const originalBtnText = btnText ? btnText.textContent : 'Enviar Solicitud';
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando…';

    const fName = document.getElementById('fName').value.trim();
    const fOrg = document.getElementById('fOrg').value.trim();
    const fPhone = document.getElementById('fPhone').value.trim();
    const fEmail = emailVal;
    const fAxisSel = document.getElementById('fAxis');
    const fAxisText = fAxisSel && fAxisSel.selectedIndex >= 0 ? fAxisSel.options[fAxisSel.selectedIndex].text : '';
    const fMessage = document.getElementById('fMessage').value.trim();
    const folio = 'GE-' + Date.now().toString().slice(-6);

    const payload = {
      Folio: folio,
      Nombre: fName,
      Empresa: fOrg,
      "Teléfono": fPhone,
      "Correo remitente": fEmail,
      "Eje de Interés": fAxisText,
      Mensaje: fMessage,
      _subject: `Nuevo Requerimiento Web [${folio}] - ${fName} (${fOrg})`
    };

    // Enlaces directos de respaldo (mailto y WhatsApp)
    const mailtoSub = encodeURIComponent(`Nuevo Requerimiento [${folio}] - ${fName} (${fOrg})`);
    const mailtoBody = encodeURIComponent(
      `FOLIO: ${folio}\n` +
      `NOMBRE: ${fName}\n` +
      `EMPRESA: ${fOrg}\n` +
      `TELÉFONO: ${fPhone}\n` +
      `CORREO: ${fEmail}\n` +
      `EJE: ${fAxisText}\n\n` +
      `DETALLE DEL REQUERIMIENTO:\n${fMessage}`
    );
    const mailtoUrl = `mailto:contactoeduser@grupoeduserr.com?subject=${mailtoSub}&body=${mailtoBody}`;
    const cleanPhone = '50223395672';
    const waText = encodeURIComponent(`Hola GRUPO EDUSER, he registrado el requerimiento ${folio} para ${fOrg}.\nNombre: ${fName}\nServicio: ${fAxisText}`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    function handleSuccess() {
      showMsg(
        `✓ <strong>¡Solicitud enviada exitosamente!</strong><br>` +
        `Hemos recibido su requerimiento y enviado una notificación a <strong>contactoeduser@grupoeduserr.com</strong>.<br>` +
        `Su folio de seguimiento es: <strong>${folio}</strong>. Le contactaremos a la brevedad.`,
        'success'
      );
      contactForm.reset();
    }

    (async function processSubmission() {
      const w3Key = (document.getElementById('w3fKey')?.value || window.WEB3FORMS_ACCESS_KEY || '').trim();
      const isGitHub = window.location.hostname.includes('github.io');

      // 1. Si está en GitHub Pages o se configuró Web3Forms Access Key
      if (w3Key && w3Key.length > 10) {
        try {
          const w3Res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              access_key: w3Key,
              subject: payload._subject,
              from_name: `${fName} (${fOrg})`,
              ...payload
            })
          });
          if (w3Res.ok) {
            const w3Data = await w3Res.json();
            if (w3Data.success) {
              handleSuccess();
              return;
            }
          }
        } catch (e) {
          console.warn('Web3Forms no respondió:', e);
        }
      }

      // 2. Si está en un servidor con soporte PHP (Hostinger, Apache, etc.)
      if (!isGitHub && window.location.protocol.startsWith('http')) {
        try {
          const res = await fetch('contacto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              handleSuccess();
              return;
            }
          }
        } catch (e) {
          console.warn('contacto.php no disponible:', e);
        }
      }

      // 3. Fallback directo cuando se prueba en local o sin servidor activo
      showMsg(
        `<strong>Solicitud registrada (Folio: ${folio})</strong><br>` +
        `Para completar el envío hacia <strong>contactoeduser@grupoeduserr.com</strong>, elija la opción que prefiera:<br><br>` +
        `<div style="display:flex; gap:0.6rem; flex-wrap:wrap; margin-top:0.4rem;">` +
        `<a href="${mailtoUrl}" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.6rem 1rem; font-size:0.8rem; text-decoration:none;">✉️ Enviar por Correo Directo</a>` +
        `<a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-gold" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.6rem 1rem; font-size:0.8rem; text-decoration:none;">💬 Enviar por WhatsApp</a>` +
        `</div>`,
        'error'
      );
      window.location.href = mailtoUrl;
    })()
      .finally(() => {
        btn.disabled = false;
        if (btnText) btnText.textContent = originalBtnText;
      });
  });

  // Live validation reset
  contactForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }
    });
  });
}

function showMsg(html, type) {
  if (!formMsg) return;
  formMsg.innerHTML = html;
  formMsg.className = `form-alert ${type}`;
  formMsg.style.display = 'block';
  formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---- 10. ACTIVE NAV CSS injection ---- */
const activeNavStyle = document.createElement('style');
activeNavStyle.textContent = `
  .nav-item.active::after { width: 100%; }
  .nav-item.active { color: var(--color-primary); }
`;
document.head.appendChild(activeNavStyle);
