
// TODO: rewrite this to use {x, y} points like CatmullRom.js (or vice versa)


// Catmull Rom Spline from arbitrary list of points (Uniform, Centripetal, Chordal)
// https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
//
// ptsa           flat float array of points
// numOfSegments  how many subdivisions in between each point
// alpha          0==uniform (std catmull rom), 0.5==centripetal, 1.0==chordal
// returns        flat float array of interpolated points
//
// FAQ:
// - Hermite curve: defined by two endpoints and tangents at those endpoints.
// - Catmull-Rom spline: a type of Hermite curve, but the tangents are automatically computed from the neighboring points.
//   This makes Catmull-Rom splines easier to use when you have a series of points and want a smooth curve through them.
// - How's the math work?
//   For a segment between P1 and P2, Catmull-Rom sets the tangent as:
//   T1 = (P2 - P0) / 2
//   T2 = (P3 - P1) / 2
//   (or a variant depending on the parameterization (uniform, centripetal, chordal))
//   where P0 and P3 are the previous and next points, respectively.
//   This automatic tangent calculation is what differentiates Catmull-Rom from a general Hermite curve.
// - Why the mirroring at the endpoints?
//   This is a common trick for Catmull-Rom splines
//   CatmullRom splines require the previous and next points to calculate tangents, so mirroring helps maintain smoothness at the ends.
//   Mirror the P[1] relative to P[0] to simulate P(-1) to make the spline pass smoothly through the first P[0].
//   Mirror the P[n-2] relative to P[n-1] to simulate P[n] to make the spline pass smoothly through the last P[n-1].
function getCurvePoints(ptsa, numOfSegments, alpha=0.5 /*centripetal*/) {
  numOfSegments = numOfSegments ? numOfSegments : 16;
  //console.log( " numOfSegments:" + numOfSegments  );

  let first = [ptsa[0], ptsa[1]];
  let second = [ptsa[2], ptsa[3]];
  let last = [ptsa[ptsa.length-2], ptsa[ptsa.length-1]];
  let second_to_last = [ptsa[ptsa.length-4], ptsa[ptsa.length-3]];

  //copy 1. mirror the 2nd point at beginning and end
  let points = [];
  points.push( [first[0] + first[0]-second[0], first[1] + first[1]-second[1]] ); // mirror
  for (let b = 0; b < ptsa.length; b+=2) {
    points.push( [ptsa[b], ptsa[b+1]] );
  }
  points.push( [last[0] + last[0]-second_to_last[0], last[1] + last[1]-second_to_last[1]] ); // mirror
  let _pts = [];
  // debugging
  //_pts.push(points[0][0]);
  //_pts.push(points[0][1]);

  for (let point_it = 0; point_it < points.length-3; ++point_it) {
    let p0 = points[0+point_it];
    let p1 = points[1+point_it];
    let p2 = points[2+point_it];
    let p3 = points[3+point_it];

    let GetT = function(/*float*/ t, /*Vector2*/ p0, /*Vector2*/ p1) {
      let a = Math.pow((p1[0] - p0[0]), 2.0) + Math.pow((p1[1] - p0[1]), 2.0);
      let b = Math.pow(a, 0.5);
      let c = Math.pow(b, alpha);
      return (c + t);
    }

    let t0 = 0.0;
    let t1 = GetT(t0, p0, p1);
    let t2 = GetT(t1, p1, p2);
    let t3 = GetT(t2, p2, p3);

    let t;
    for (t = t1; t <= t2; t += ((t2-t1) / numOfSegments))
    {
      let A1x = ((t1-t)/(t1-t0)) * p0[0] + ((t-t0)/(t1-t0)) * p1[0];
      let A1y = (t1-t)/(t1-t0) * p0[1] + (t-t0)/(t1-t0) * p1[1];
      let A2x = (t2-t)/(t2-t1) * p1[0] + (t-t1)/(t2-t1) * p2[0];
      let A2y = (t2-t)/(t2-t1) * p1[1] + (t-t1)/(t2-t1) * p2[1];
      let A3x = (t3-t)/(t3-t2) * p2[0] + (t-t2)/(t3-t2) * p3[0];
      let A3y = (t3-t)/(t3-t2) * p2[1] + (t-t2)/(t3-t2) * p3[1];

      let B1x = (t2-t)/(t2-t0) * A1x + (t-t0)/(t2-t0) * A2x;
      let B1y = (t2-t)/(t2-t0) * A1y + (t-t0)/(t2-t0) * A2y;
      let B2x = (t3-t)/(t3-t1) * A2x + (t-t1)/(t3-t1) * A3x;
      let B2y = (t3-t)/(t3-t1) * A2y + (t-t1)/(t3-t1) * A3y;

      let Cx = (t2-t)/(t2-t1) * B1x + (t-t1)/(t2-t1) * B2x;
      let Cy = (t2-t)/(t2-t1) * B1y + (t-t1)/(t2-t1) * B2y;

      //console.log( " Cx:" + Cx + " Cy:" + Cy );
      _pts.push(Cx);
      _pts.push(Cy);
    }
  }
  // add the last point (close the gap)
  _pts.push(points[points.length-2][0]);
  _pts.push(points[points.length-2][1]);

  // debugging:
  //_pts.push(points[points.length-1][0]);
  //_pts.push(points[points.length-1][1]);

  return _pts;
};


// optimized version of the above...
// (much much less redundant math, reduce divides by precomputing reciprocals)
function getCurvePointsOpt(points, numOfSegments = 16, alpha = 0.5) {
  if (points.length < 2) return points.slice();

  // Mirror endpoints
  const first = points[0], second = points[1];
  const last = points[points.length - 1], secondLast = points[points.length - 2];

  const pts = [
    { x: 2 * first.x - second.x, y: 2 * first.y - second.y },
    ...points,
    { x: 2 * last.x - secondLast.x, y: 2 * last.y - secondLast.y }
  ];

  const result = [];

  const getT = (t, p0, p1) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    return Math.pow(Math.sqrt(dx * dx + dy * dy), alpha) + t;
  };

  for (let i = 0; i < pts.length - 3; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const p3 = pts[i + 3];

    const t0 = 0.0;
    const t1 = getT(t0, p0, p1);
    const t2 = getT(t1, p1, p2);
    const t3 = getT(t2, p2, p3);

    const dt = (t2 - t1) / numOfSegments;

    // Precompute denominators and their inverses
    const inv_t10 = 1 / (t1 - t0);
    const inv_t21 = 1 / (t2 - t1);
    const inv_t32 = 1 / (t3 - t2);
    const inv_t20 = 1 / (t2 - t0);
    const inv_t31 = 1 / (t3 - t1);

    for (let t = t1; t <= t2 + 1e-9; t += dt) {
      const t_t0 = t - t0;
      const t_t1 = t - t1;
      const t_t2 = t - t2;
      const t1_t = t1 - t;
      const t2_t = t2 - t;
      const t3_t = t3 - t;

      // Interpolate once per stage using precomputed denominators
      const A1x = (t1_t * p0.x + t_t0 * p1.x) * inv_t10;
      const A1y = (t1_t * p0.y + t_t0 * p1.y) * inv_t10;
      const A2x = (t2_t * p1.x + t_t1 * p2.x) * inv_t21;
      const A2y = (t2_t * p1.y + t_t1 * p2.y) * inv_t21;
      const A3x = (t3_t * p2.x + t_t2 * p3.x) * inv_t32;
      const A3y = (t3_t * p2.y + t_t2 * p3.y) * inv_t32;

      const B1x = (t2_t * A1x + t_t0 * A2x) * inv_t20;
      const B1y = (t2_t * A1y + t_t0 * A2y) * inv_t20;
      const B2x = (t3_t * A2x + t_t1 * A3x) * inv_t31;
      const B2y = (t3_t * A2y + t_t1 * A3y) * inv_t31;

      const Cx = (t2_t * B1x + t_t1 * B2x) * inv_t21;
      const Cy = (t2_t * B1y + t_t1 * B2y) * inv_t21;

      result.push({ x: Cx, y: Cy });
    }
  }

  result.push({ ...points[points.length - 1] });
  return result;
}




// CatmullRom class wrapper
class CatmullRom {
  // DEFAULT: Given an array of points, compute subdivided Catmull-Rom points
  static computeCurve(points, subdivisions = 10, alpha=0 /* uniform (std catmull rom) */ ) {
    return this.computeCurveOpt(points, subdivisions, alpha);
  }



  // UNOPTIMIZED: Given an array of points, compute subdivided Catmull-Rom points
  static computeCurveUnopt(points, subdivisions = 10, alpha=0.5 /*centripetal*/ ) {
    // map the {x,y} points array to a flat array [x0,y0, x1,y1, ...]
    points = points.map( r => [r.x, r.y] ).flat();

    // compute the splinecurve points
    let retval = getCurvePoints(points, subdivisions, alpha);

    // unflatten the [x0,y0, x1,y1, ...] result back to {x,y} point format
    for (let i = 0; i < retval.length; i+=2) {
      retval[i] = { x: retval[i], y: retval[i+1] };
    }
    return retval;
  }

  // OPTIMIZED: Given an array of points, compute subdivided Catmull-Rom points
  static computeCurveOpt(points, subdivisions = 10, alpha=0.5 /*centripetal*/ ) {
    return getCurvePointsOpt(points, subdivisions, alpha);
  }
}
