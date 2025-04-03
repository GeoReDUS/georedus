export function getCenterOffsetPixels(
  mainMapContainer: HTMLElement,
  targetMapContainer: HTMLElement,
): { x: number; y: number } {
  const mainRect = mainMapContainer.getBoundingClientRect()
  const targetRect = targetMapContainer.getBoundingClientRect()

  const mainCenter = {
    x: mainRect.left + mainRect.width / 2,
    y: mainRect.top + mainRect.height / 2,
  }

  const targetCenter = {
    x: targetRect.left + targetRect.width / 2,
    y: targetRect.top + targetRect.height / 2,
  }

  return {
    x: targetCenter.x - mainCenter.x,
    y: targetCenter.y - mainCenter.y,
  }
}
