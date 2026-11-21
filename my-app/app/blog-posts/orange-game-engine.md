---
title: "Orange Game Engine: A CPU-Rendered 3D Engine in C++"
date: "2026-11-21"
excerpt: "A minimal CPU-rendered 3D engine built with C++ and SFML using perspective projection, Painter's Algorithm, and flat directional lighting."
---

# Orange Game Engine

I've always had an affinity for 3D graphics ever since I first learned that a 3D point `(x, y, z)` can be projected onto a 2D screen just by dividing by depth: `(x / z, y / z)`. **Orange Game Engine** is my scratch-built 3D engine in C++ exploring that idea.

All code can be found on [github](https://github.com/geryfabrega/orange_game_engine).

![Orange Game Engine demo](/blog-videos/kirby_game.mov "width=480")

## CPU Rendering with SFML

To state the obvious: this is a CPU-rendered 3D engine. Every transform, projection, lighting calculation, and depth sort happens on the CPU, and **SFML** is only used to draw the final 2D triangles and textured quads to the screen.

At its core, projection really is just dividing `x` and `y` by `z` and mapping to the canvas:

```cpp
std::pair<float, float> project_vertex(const std::vector<float>& v) {
    if (v[2] <= 0.001f) return { -9999.0f, -9999.0f };
    return viewport_to_canvas(v[0] / v[2], v[1] / v[2]);
}
```

From there, the pipeline in `renderer.hpp` handles two main pieces:

- **Painter's Algorithm**: After transforming vertices into camera space and clipping against the near plane, every solid triangle and textured triangle is pushed into a unified queue, sorted back-to-front by average Z depth (`avg_z`), and drawn in order.
- **Flat Directional Lighting**: Each triangle calculates its surface normal using a cross product of two edges, takes the dot product against a directional light vector, and combines it with an ambient floor to shade the triangle's base color.

## Kirby, Actors, and Crude Collision

The test character in the engine is Kirby. I obviously do not own Kirby—I just chose him because he's bright, colorful, and easy to put together from simple shapes (a pink sphere, two red feet, and a face decal).

In the engine, actors are just groups of `.obj` polygon meshes ("limbs") offset from each other relative to a parent position. Collision is handled pretty crudely as well: instead of checking individual polygons, actors use axis-aligned bounding boxes (AABBs) approximating the outer min/max bounds of the meshes that make up the actor.

## Animation & What's Next

Right now there isn't a real animation system. Every frame, an actor's `tick()` just increments a timer over an infinite procedural animation loop—using sine and cosine waves to offset and rotate the torso and feet for idle, walking, and jumping states.

Eventually I would like to build a proper way to animate polygons directly instead of relying on hardcoded infinite tick loops.
