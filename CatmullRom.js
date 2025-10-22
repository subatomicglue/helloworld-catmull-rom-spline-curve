class CatmullRom {
  // Compute Catmull-Rom spline between four points (p0,p1,p2,p3)
  // Returns interpolated point at parameter t ∈ [0,1]
  static interpolate(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    const x = 0.5 * ((2 * p1.x) +
      (-p0.x + p2.x) * t +
      (2*p0.x - 5*p1.x + 4*p2.x - p3.x) * t2 +
      (-p0.x + 3*p1.x - 3*p2.x + p3.x) * t3);
    const y = 0.5 * ((2 * p1.y) +
      (-p0.y + p2.y) * t +
      (2*p0.y - 5*p1.y + 4*p2.y - p3.y) * t2 +
      (-p0.y + 3*p1.y - 3*p2.y + p3.y) * t3);
    return { x, y };
  }

  // Given an array of points, compute subdivided Catmull-Rom points
  static computeCurve(points, subdivisions = 10) {
    if (points.length < 2) return points.slice();

    // If fewer than 4 points, fall back to linear interpolation
    if (points.length < 4) {
      const curve = [];
      for (let i = 0; i < points.length - 1; i++) {
        for (let j = 0; j <= subdivisions; j++) {
          const t = j / subdivisions;
          curve.push({
            x: points[i].x * (1 - t) + points[i+1].x * t,
            y: points[i].y * (1 - t) + points[i+1].y * t
          });
        }
      }
      return curve;
    }

    // Pad endpoints by projecting outward
    const pts = points.slice();
    const first = pts[0], second = pts[1];
    const last = pts[pts.length - 1], penultimate = pts[pts.length - 2];

    const pre = { x: first.x + (first.x - second.x), y: first.y + (first.y - second.y) };
    const post = { x: last.x + (last.x - penultimate.x), y: last.y + (last.y - penultimate.y) };

    pts.unshift(pre);
    pts.push(post);

    const curve = [];
    for (let i = 0; i < pts.length - 3; i++) {
      for (let j = 0; j <= subdivisions; j++) {
        const t = j / subdivisions;
        curve.push(this.interpolate(pts[i], pts[i+1], pts[i+2], pts[i+3], t));
      }
    }
    return curve;
  }
}

