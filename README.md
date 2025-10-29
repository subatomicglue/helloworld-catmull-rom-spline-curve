# Spline Curve Demo using Catmul Rom splines

Simply move your mouse (or finger) on the screen.
- Create a *coarse* set of **points** (in red)
- Create a *detailed* set of **smoothed lines** (in blue)

[Try it Out](https://htmlpreview.github.io/?https://raw.githubusercontent.com/subatomicglue/helloworld-catmull-rom-spline-curve/master/index.html)

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

## HelloWorld Demos
To help you navigate, here's a complete list of my hello world demos

### Simple Demos
- 2D SVG - [helloworld_html_js_svg](https://github.com/subatomicglue/helloworld_html_js_svg)
- 2D Canvas - [helloworld_html_js_canvas](https://github.com/subatomicglue/helloworld_html_js_canvas)
- 3D Canvas - [threejs-helloworld-cube](https://github.com/subatomicglue/threejs-helloworld-cube)
- 2D Spline Curve through points - [helloworld-catmull-rom-spline-curve](https://github.com/subatomicglue/helloworld-catmull-rom-spline-curve)

### More Advanced Demos
- 2D Canvas with L-systems fractal tree - [fractaltree](https://github.com/subatomicglue/fractaltree)
- 2D Canvas with sprites and map tiles - [sprite_demo_js](https://github.com/subatomicglue/sprite_demo_js)
- Audio Demo with drummachine - [drummachine](https://github.com/subatomicglue/drummachine)
- Audio Demos:  MIDI music, Audio player - [drummachine](https://github.com/subatomicglue/kiosk)
