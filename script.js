const header = document.querySelector('[data-header]');
const reveals = document.querySelectorAll('.reveal');
const year = document.querySelector('[data-year]');
const yandexDiskVideos = document.querySelectorAll('[data-yandex-disk-public]');

if (year) year.textContent = new Date().getFullYear();

const loadYandexDiskVideo = async (video) => {
  const publicKey = video.dataset.yandexDiskPublic;
  const endpoint = new URL('https://cloud-api.yandex.net/v1/disk/public/resources');
  endpoint.searchParams.set('public_key', publicKey);

  video.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Yandex Disk request failed: ${response.status}`);

    const resource = await response.json();
    if (!resource.file) throw new Error('Yandex Disk did not return a video URL');

    if (resource.preview) video.poster = resource.preview;
    video.src = resource.file;
    video.load();
  } catch (error) {
    const fallback = document.createElement('a');
    fallback.className = 'video-frame__fallback';
    fallback.href = publicKey;
    fallback.target = '_blank';
    fallback.rel = 'noopener noreferrer';
    fallback.textContent = 'Открыть видео на Яндекс Диске';
    video.replaceWith(fallback);
    console.error(error);
  } finally {
    video.removeAttribute('aria-busy');
  }
};

yandexDiskVideos.forEach(loadYandexDiskVideo);

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      entry.target.style.setProperty('--delay', `${delay}ms`);
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

  reveals.forEach((item) => observer.observe(item));
} else {
  reveals.forEach((item) => item.classList.add('is-visible'));
}

const parallaxItems = document.querySelectorAll('[data-parallax]');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canHover && !reduceMotion) {
  parallaxItems.forEach((item) => {
    const strength = Number(item.dataset.parallax || 0.03);

    item.addEventListener('pointermove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(900px) rotateY(${x * strength * 100}deg) rotateX(${-y * strength * 100}deg) scale(1.008)`;
    });

    item.addEventListener('pointerleave', () => {
      item.style.transform = '';
    });
  });
}
