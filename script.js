/* ===== RITEwayofsuccess Computer Institute — Interactions ===== */

/* ============================================================
   WHATSAPP AUTO-DELIVERY SETUP
   Form ki details seedhe aapke WhatsApp par aayengi (bina Send dabaye).
   ------------------------------------------------------------
   Step 1: WhatsApp mein CallMeBot ka number save karein — number tabhi
           dikhta hai jab slots khulein (https://callmebot.com/blog/free-api-whatsapp-messages)
   Step 2: Unhe ye message bhejein:  I allow callmebot to send me messages
   Step 3: Reply mein jo APIKEY aaye, use neeche apikey field mein paste karein
   ------------------------------------------------------------
   apikey KHAALI rahega toh form visitor ka WhatsApp chat kholega jisme
   details likhi hongi — usme bas Send dabana padta hai (fallback).
   Dono tarah se site chalti hai.
   ============================================================ */
const WHATSAPP_AUTO = {
  phone: '916302431988', // country code samet (91 = India) + 6302431988
  apikey: ''             // yahan CallMeBot API key paste karein
};

/* ============================================================
   EMAIL AUTO-DELIVERY — form ki details seedhe email par
   ------------------------------------------------------------
   Service: FormSubmit.co (free, no signup)
   NOTE: Pehli baar submit karne par ek confirmation email aayega —
   usme ka link EK BAAR click karna hoga (anti-spam activation).
   Uske baad hamesha details automatic email par aayengi.
   ============================================================ */
const FORM_EMAIL = 'ramainstitute1988@gmail.com';

// ---------- Mobile Navigation ----------
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ---------- Navbar shrink on scroll ----------
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('shrink', window.scrollY > 60);
});

// ---------- Active link on scroll ----------
const sections = document.querySelectorAll('section[id]');
const navAnchors = navLinks.querySelectorAll('a');

window.addEventListener('scroll', () => {
  const pos = window.scrollY + 140;
  sections.forEach(sec => {
    if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = navLinks.querySelector(`a[href="#${sec.id}"]`);
      if (active) active.classList.add('active');
    }
  });
});

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 90}ms`;
  revealObserver.observe(el);
});

// ---------- Animated counters ----------
const counters = document.querySelectorAll('.count');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString('en-IN') + (p === 1 && target >= 100 ? '+' : '');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('en-IN') + (target >= 15 ? '+' : '');
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(c => counterObserver.observe(c));

// ---------- Testimonials slider ----------
const track = document.getElementById('testiTrack');
const slides = track ? Array.from(track.querySelectorAll('.testi')) : [];
const dotsWrap = document.getElementById('testiDots');
let current = 0;
let slideTimer;

if (slides.length) {
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Review ${i + 1}`);
    if (i === 0) b.classList.add('on');
    b.addEventListener('click', () => { goTo(i); restartTimer(); });
    dotsWrap.appendChild(b);
  });

  const dots = dotsWrap.querySelectorAll('button');

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('on');
    current = i;
    slides[current].classList.add('active');
    dots[current].classList.add('on');
  }

  function next() { goTo((current + 1) % slides.length); }

  function restartTimer() {
    clearInterval(slideTimer);
    slideTimer = setInterval(next, 5500);
  }
  restartTimer();
}

// ---------- Admission form ----------
const form = document.getElementById('admissionForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const course = document.getElementById('course');
    let valid = true;

    [name, phone, course].forEach(f => f.classList.remove('err'));

    if (!name.value.trim()) { name.classList.add('err'); valid = false; }
    if (!/^[6-9]\d{9}$/.test(phone.value.replace(/\D/g, '').slice(-10))) {
      phone.classList.add('err'); valid = false;
    }
    if (!course.value) { course.classList.add('err'); valid = false; }

    if (!valid) {
      form.querySelector('.err')?.focus();
      return;
    }

    // Build WhatsApp enquiry message from form details
    const lines = [
      'नमस्ते! वेबसाइट से नई admission enquiry प्राप्त हुई है।',
      '———————————————',
      '📝 नाम: ' + name.value.trim(),
      '📞 मोबाइल: ' + phone.value.trim(),
      '📧 ईमेल: ' + (document.getElementById('email').value.trim() || '-'),
      '📚 कोर्स: ' + course.value,
      '💬 संदेश: ' + (document.getElementById('message').value.trim() || '-')
    ];
    const text = lines.join('\n');
    const isAutoWa = WHATSAPP_AUTO.apikey.trim() !== '';
    const isEmail = FORM_EMAIL.trim() !== '';
    const emailEl = document.getElementById('email');
    const msgEl = document.getElementById('message');

    // 1) EMAIL auto-delivery (FormSubmit.co) — response check ke saath
    let emailReady = null;
    if (isEmail) {
      emailReady = Promise.race([
        fetch('https://formsubmit.co/ajax/' + encodeURIComponent(FORM_EMAIL), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: 'New Admission Enquiry - RITEwayofsuccess Computer Institute',
            _template: 'table',
            _captcha: 'false',
            'Name': name.value.trim(),
            'Mobile': phone.value.trim(),
            'Email': emailEl.value.trim() || '-',
            'Course': course.value,
            'Message': msgEl.value.trim() || '-',
            'Source': 'Website Admission Form'
          })
        }).then(r => r.json()).then(d => { if (!d || String(d.success) !== 'true') throw new Error('rejected'); }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 9000))
      ]);
    }

    // 2) WHATSAPP auto-delivery (agar CallMeBot API key set hai)
    if (isAutoWa) {
      const api = 'https://api.callmebot.com/whatsapp.php?phone=' +
        encodeURIComponent(WHATSAPP_AUTO.phone) +
        '&text=' + encodeURIComponent(text) +
        '&apikey=' + encodeURIComponent(WHATSAPP_AUTO.apikey.trim());
      fetch(api, { mode: 'no-cors' }).catch(() => {});
    }

    // 3) Success message — email ka real result + hamesha WhatsApp quick button
    const waHref = 'https://wa.me/' + WHATSAPP_AUTO.phone + '?text=' + encodeURIComponent(text);
    const waBtn = ' <a class="succ-wa" href="' + waHref + '" target="_blank" rel="noopener">💬 Ek tap — WhatsApp par bhej dein</a>';
    const showSucc = (html, ms) => {
      success.innerHTML = html;
      success.classList.add('show');
      if (ms) setTimeout(() => success.classList.remove('show'), ms);
    };

    if (emailReady) {
      showSucc('⏳ Details bhej rahe hain...', 0);
      emailReady
        .then(() => showSucc('✅ Details aapke email par bhej diye gaye hain ✓ (inbox ya Spam check karein) — hamari team jaldi contact karegi.', 14000))
        .catch(() => showSucc('⚠️ Email par abhi dikkat hai — <strong>ek tap</strong> mein WhatsApp par bhej dein, details (naam, mobile, email) turant pahunch jayengi:' + waBtn, 30000));
    } else if (isAutoWa) {
      showSucc('✅ Details aapke WhatsApp par bhej di gayi hain ✓ Hamari team jaldi aapse contact karegi.', 9000);
    } else {
      window.open(waHref, '_blank', 'noopener');
      showSucc('✅ Details ready! WhatsApp khul raha hai — bas <strong>Send</strong> dabayein:' + waBtn, 15000);
    }

    form.reset();
  });

  // live error clear
  form.querySelectorAll('input, select').forEach(f => {
    f.addEventListener('input', () => f.classList.remove('err'));
  });
}

// ---------- Back to top ----------
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 500);
});
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
