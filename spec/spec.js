const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.toc nav a');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => {
        a.style.fontWeight = a.getAttribute('href') === `#${entry.target.id}` ? '600' : '';
        a.style.color = a.getAttribute('href') === `#${entry.target.id}` ? 'var(--accent)' : '';
      });
    });
  },
  { rootMargin: '-30% 0px -60% 0px' }
);

sections.forEach((s) => observer.observe(s));
