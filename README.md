# Spline Curve Demo using Catmul Rom splines

Simply move your mouse (or finger) on the screen.
- Create a *coarse* set of **points** (in red)
- Create a *detailed* set of **smoothed lines** (in blue)

## What's in the code

See [CatmullRom.js](CatmullRom.js) for simple version
- Catmull Rom Spline from arbitrary list of points (using the classic “Uniform” Catmull–Rom spline, α = 0)

See [CatmullRom2.js](CatmullRom2.js) for more control
- Catmull Rom Spline from arbitrary list of points (Uniform α = 0, Centripetal α = 0.5, Chordal α = 1)

See [index.html](index.html) for interaction and drawing

## FAQ

It may produce loops or overshoot if points are far apart or unevenly spaced, which is exactly what centripetal parameterization is designed to avoid.

See [CatmullRom2.js](CatmullRom2.js) for more notes

## For more information
https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline

