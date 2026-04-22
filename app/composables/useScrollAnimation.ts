export function useScrollAnimation() {
  const observeElements = (
    selector: string,
    animationClass: string = 'animate-fade-in-up',
    threshold: number = 0.1
  ) => {
    const elements = document.querySelectorAll(selector)
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    elements.forEach((el) => observer.observe(el))

    return observer
  }

  return { observeElements }
}