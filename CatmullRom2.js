
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

// CatmullRom class wrapper
class CatmullRom {
  // Given an array of points, compute subdivided Catmull-Rom points
  static computeCurve(points, subdivisions = 10, alpha=0.5 /*centripetal*/ ) {
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
}
