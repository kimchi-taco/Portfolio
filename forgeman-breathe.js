/**
 * Forgeman Mesh Breathing Animation
 * 
 * Usage:
 *   <div id="forgeman"></div>
 *   <script src="forgeman-breathe.js"></script>
 *   <script>
 *     ForgemanBreathe.init('forgeman', {
 *       src: '/dwarf.png',    // 128x235 pixel art PNG
 *       scale: 3,             // display multiplier (3 = 384x705)
 *       intensity: 1.0,       // breathing strength (0.2 ~ 3.0)
 *       speed: 1.0            // breathing speed multiplier
 *     });
 *   </script>
 */
const ForgemanBreathe = (() => {
  const IMG_W = 128, IMG_H = 235;
  const COLS = 16, ROWS = 28;

  const ZONE = {
    headEnd:    0.18,
    chestPeak:  0.34,
    beltLine:   0.51,
    bellyEnd:   0.58,
  };

  function buildMesh() {
    const verts = [];
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        verts.push({ x: c / COLS, y: r / ROWS, ox: c / COLS, oy: r / ROWS });
      }
    }
    return verts;
  }

  function buildTriangles() {
    const tris = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * (COLS + 1) + c;
        tris.push([i, i + 1, i + (COLS + 1)]);
        tris.push([i + 1, i + (COLS + 2), i + (COLS + 1)]);
      }
    }
    return tris;
  }

  function deform(verts, t, intensity) {
    const breath = (Math.sin(t) * 0.5 + 0.5 + Math.sin(t * 2.3) * 0.15) * intensity;
    for (const v of verts) {
      const ny = v.oy, nx = v.ox;
      let dx = 0, dy = 0;

      if (ny < ZONE.headEnd) {
        dy = -breath * 0.008 * (1 - ny / ZONE.headEnd);
      } else if (ny < ZONE.beltLine) {
        let tc = ny < ZONE.chestPeak
          ? Math.pow((ny - ZONE.headEnd) / (ZONE.chestPeak - ZONE.headEnd), 2)
          : Math.pow(1 - (ny - ZONE.chestPeak) / (ZONE.beltLine - ZONE.chestPeak), 2);
        dx = (nx - 0.5) * 2 * tc * breath * 0.025 + tc * breath * 0.003;
        dy = ny < ZONE.chestPeak ? -tc * breath * 0.012 : tc * breath * 0.006;
      } else if (ny < ZONE.bellyEnd) {
        dy = (1 - (ny - ZONE.beltLine) / (ZONE.bellyEnd - ZONE.beltLine)) * breath * 0.004;
      }

      v.x = v.ox + dx;
      v.y = v.oy + dy;
    }
  }

  function drawTri(ctx, img, verts, tri, scale) {
    const [i0, i1, i2] = tri;
    const v0 = verts[i0], v1 = verts[i1], v2 = verts[i2];
    const sx0 = v0.ox * IMG_W, sy0 = v0.oy * IMG_H;
    const sx1 = v1.ox * IMG_W, sy1 = v1.oy * IMG_H;
    const sx2 = v2.ox * IMG_W, sy2 = v2.oy * IMG_H;
    const dx0 = v0.x * IMG_W * scale, dy0 = v0.y * IMG_H * scale;
    const dx1 = v1.x * IMG_W * scale, dy1 = v1.y * IMG_H * scale;
    const dx2 = v2.x * IMG_W * scale, dy2 = v2.y * IMG_H * scale;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dx0, dy0);
    ctx.lineTo(dx1, dy1);
    ctx.lineTo(dx2, dy2);
    ctx.closePath();
    ctx.clip();

    const den = sx0 * (sy1 - sy2) + sx1 * (sy2 - sy0) + sx2 * (sy0 - sy1);
    if (Math.abs(den) < 0.001) { ctx.restore(); return; }

    const a = (dx0 * (sy1 - sy2) + dx1 * (sy2 - sy0) + dx2 * (sy0 - sy1)) / den;
    const b = (dx0 * (sx2 - sx1) + dx1 * (sx0 - sx2) + dx2 * (sx1 - sx0)) / den;
    const c = (dx0 * (sx1*sy2 - sx2*sy1) + dx1 * (sx2*sy0 - sx0*sy2) + dx2 * (sx0*sy1 - sx1*sy0)) / den;
    const d = (dy0 * (sy1 - sy2) + dy1 * (sy2 - sy0) + dy2 * (sy0 - sy1)) / den;
    const e = (dy0 * (sx2 - sx1) + dy1 * (sx0 - sx2) + dy2 * (sx1 - sx0)) / den;
    const f = (dy0 * (sx1*sy2 - sx2*sy1) + dy1 * (sx2*sy0 - sx0*sy2) + dy2 * (sx0*sy1 - sx1*sy0)) / den;

    ctx.setTransform(a, d, b, e, c, f);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }

  function init(containerId, opts = {}) {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`[ForgemanBreathe] #${containerId} not found`);

    const scale = opts.scale || 3;
    const intensity = opts.intensity || 1.0;
    const speed = opts.speed || 1.0;

    const canvas = document.createElement('canvas');
    canvas.width = IMG_W * scale;
    canvas.height = IMG_H * scale;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const verts = buildMesh();
    const tris = buildTriangles();
    const img = new Image();
    img.src = opts.src || '/dwarf.png';

    img.onload = () => {
      const start = performance.now();
      (function loop(now) {
        const t = ((now - start) / 1000) * speed * 1.8;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const v of verts) { v.x = v.ox; v.y = v.oy; }
        deform(verts, t, intensity);
        for (const tri of tris) drawTri(ctx, img, verts, tri, scale);
        requestAnimationFrame(loop);
      })(performance.now());
    };

    return canvas;
  }

  return { init };
})();
