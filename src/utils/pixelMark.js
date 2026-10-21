export const PIXEL_MARK_PATH =
  '1,0 86,35 86,61 39,85 39,70 30,70 30,101 2,119 1,119 1,71 3,70 52,47.5 8,28 1,15';

export function drawPixelMark(canvas, color = '#B995E6') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = color;
  ctx.beginPath();
  const points = PIXEL_MARK_PATH.split(' ');
  points.forEach((p, i) => {
    const [x, y] = p.split(',').map(Number);
    const px = (x * W) / 87;
    const py = (y * H) / 119;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();

  const im = ctx.getImageData(0, 0, W, H);
  const d = im.data;
  for (let i = 3; i < d.length; i += 4) {
    d[i] = d[i] > 115 ? 255 : 0; // hard pixel edges
  }
  ctx.putImageData(im, 0, 0);
}
