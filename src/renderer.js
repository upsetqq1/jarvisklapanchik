const character = document.getElementById('character');
const panel = document.getElementById('panel');
let pointerDown = null;
let didDrag = false;
let alphaCanvas;
let alphaContext;
let alphaPixels;

function isCharacterAt(clientX, clientY) {
  if (!alphaContext || !character.naturalWidth) return false;
  const bounds = character.getBoundingClientRect();
  const x = Math.floor((clientX - bounds.left) * character.naturalWidth / bounds.width);
  const y = Math.floor((clientY - bounds.top) * character.naturalHeight / bounds.height);
  if (x < 0 || y < 0 || x >= character.naturalWidth || y >= character.naturalHeight) return false;
  return alphaPixels[(y * character.naturalWidth + x) * 4 + 3] > 12;
}

function isInteractiveAt(clientX, clientY) {
  const panelRect = panel.getBoundingClientRect();
  if (!panel.classList.contains('hidden') && clientX >= panelRect.left && clientX <= panelRect.right && clientY >= panelRect.top && clientY <= panelRect.bottom) return true;
  return isCharacterAt(clientX, clientY);
}

function updatePointerRegion(event) {
  window.yura.setPointerRegion(isInteractiveAt(event.clientX, event.clientY));
}

document.addEventListener('mousemove', updatePointerRegion);
document.addEventListener('mousedown', (event) => {
  if (!isCharacterAt(event.clientX, event.clientY)) return;
  pointerDown = { x: event.screenX, y: event.screenY };
  didDrag = false;
  window.yura.dragStart();
});
document.addEventListener('mousemove', (event) => {
  if (!pointerDown) return;
  const dx = event.screenX - pointerDown.x;
  const dy = event.screenY - pointerDown.y;
  if (!didDrag && Math.hypot(dx, dy) > 4) didDrag = true;
  if (didDrag) window.yura.dragMove();
});
document.addEventListener('mouseup', () => {
  if (pointerDown) window.yura.dragEnd();
  pointerDown = null;
});
character.addEventListener('click', () => {
  if (!didDrag) panel.classList.toggle('hidden');
});
document.getElementById('close').addEventListener('click', () => panel.classList.add('hidden'));
document.getElementById('hide').addEventListener('click', () => panel.classList.add('hidden'));
document.getElementById('exit').addEventListener('click', () => window.yura.quit());

character.addEventListener('load', () => {
  alphaCanvas = document.createElement('canvas');
  alphaCanvas.width = character.naturalWidth;
  alphaCanvas.height = character.naturalHeight;
  alphaContext = alphaCanvas.getContext('2d', { willReadFrequently: true });
  alphaContext.drawImage(character, 0, 0);
  alphaPixels = alphaContext.getImageData(0, 0, alphaCanvas.width, alphaCanvas.height).data;
  const scale = Math.min(1, 440 / Math.max(character.naturalWidth, character.naturalHeight));
  character.style.width = `${character.naturalWidth * scale}px`;
  character.style.height = `${character.naturalHeight * scale}px`;
  character.style.left = '50%';
  character.style.top = '50%';
  character.style.transform = 'translate(-50%, -50%)';
});
