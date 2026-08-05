export function initPwCarousel(root) {
  const track = root.querySelector('[data-pw-carousel-track]');
  const prevButton = root.querySelector('[data-pw-carousel-prev]');
  const nextButton = root.querySelector('[data-pw-carousel-next]');

  if (!track || !prevButton || !nextButton) {
    return;
  }

  function getStep() {
    const firstSlide = track.querySelector('.pw-carousel__slide');
    if (!firstSlide) {
      return 320;
    }

    const rect = firstSlide.getBoundingClientRect();
    return Math.max(rect.width, 240);
  }

  prevButton.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });
}
