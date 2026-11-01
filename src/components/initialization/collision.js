/** Bounds are measured in viewport CSS pixels. Both native sprite frames are tightly cropped. */
export function collisionPlacement(dino, mark, viewport) {
  const markLeft = mark.left;
  return { start: -dino.width, approach: markLeft - dino.width - 1 / (viewport.dpr || 1),
    contact: markLeft - dino.width, top:mark.top, x:markLeft };
}

/** Locate a real, shared silhouette row for the impact, rather than the rectangle's empty corner. */
export function contactRow(dinoRows, markRows, dino, mark) {
  for (let y=Math.ceil(Math.max(dino.top,mark.top)); y<Math.min(dino.top+dino.height,mark.top+mark.height); y++) {
    const a=Math.min(dinoRows.length-1,Math.floor((y-dino.top)/dino.height*dinoRows.length));
    const b=Math.min(markRows.length-1,Math.floor((y-mark.top)/mark.height*markRows.length));
    if (dinoRows[a] === 40 && markRows[b] === 0) return y + .5;
  }
  return mark.top + mark.height / 2;
}
