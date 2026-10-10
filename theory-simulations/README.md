# Theory Simulations

An interactive, browser-based atlas for exploring big ideas in physics and
mathematics. The first collection contains:

1. **Quantum interference** — build a double-slit detection pattern one photon
   at a time and vary path distinguishability.
2. **Gravitational lensing** — explore the image positions and magnifications of
   a point-mass lens using the thin-lens equation.
3. **Deterministic chaos** — follow the logistic map and see period doubling in
   its bifurcation diagram.

Wave 02 adds six animated models of landmark theories:

4. **Special relativity** — race a light clock against a moving twin and watch time dilate.
5. **Bell's theorem** — run a CHSH test; quantum correlations beat every local hidden-variable model.
6. **Natural selection** — Wright–Fisher populations showing selection versus genetic drift.
7. **Three-body problem** — the figure-eight orbit, and how a small push turns it chaotic.
8. **Second law of thermodynamics** — a gas spreads, entropy rises, and reversing every velocity un-mixes it.
9. **Cosmic expansion** — the Hubble–Lemaître law from any galaxy you click.

Wave 03 adds six more:

10. **Quantum tunneling** — a live Schrödinger solver: a wave packet leaks through a wall it classically cannot cross.
11. **Hawking radiation** — black hole temperature, entropy, and lifetime for any mass, with an evaporation timeline.
12. **Turing patterns** — Gray–Scott reaction–diffusion grows spots, coral, and mazes; click to seed.
13. **Information theory** — a noisy channel, a repetition code, and Shannon's capacity limit.
14. **Fourier series** — chains of spinning circles that draw any closed shape.
15. **Central limit theorem** — a Galton board building the bell curve.

Wave 04 adds six more:

16. **General relativity** — Schwarzschild orbits precess into rosettes; measured vs weak-field precession.
17. **Maxwell's equations** — a live 2-D FDTD solver: antennas radiate, waves diffract through slits.
18. **Epidemics** — 600 agents; transmission, distancing, and vaccination bend the curve.
19. **Evolution of cooperation** — the spatial Prisoner's Dilemma and its kaleidoscopes.
20. **Brownian motion** — a grain kicked by molecules; mean squared displacement turns linear.
21. **Synchronization** — Kuramoto oscillators as fireflies locking into step.

Wave 05 adds six more:

22. **Ising model** — Metropolis spins at the critical temperature, checked against Onsager's exact magnetization.
23. **Percolation** — water floods a random lattice and suddenly gets through at p ≈ 0.593.
24. **Neural networks** — a from-scratch MLP trains live with backprop and Adam on circle, XOR, and spiral data.
25. **Quantum search** — Grover's algorithm as amplitude bars and a rotating state vector.
26. **Self-organized criticality** — the BTW sandpile with a live power-law fit to avalanche sizes.
27. **Mandelbrot set** — a continuous dive into z² + c; click to steer.

Wave 06 adds six more:

28. **Gravitational waves** — a binary inspiral radiating spiral strain waves, with the detector chirp.
29. **Game of Life** — glider guns, acorns, and random soup under Conway's B3/S23 rules.
30. **Bayes' theorem** — 1,000 people, a medical test, and why base rates dominate.
31. **Plate tectonics** — Rayleigh–Bénard mantle convection with ridges and trenches read from the flow.
32. **Black-body radiation** — Planck's law vs the ultraviolet catastrophe, with photons and star colors.
33. **Predator–prey cycles** — Lotka–Volterra populations and their closed orbits in the phase plane.

Wave 07 adds six more:

34. **Doppler effect** — wavefronts bunch ahead of a moving source, a Mach cone forms past Mach 1, and light swatches show redshift and blueshift.
35. **Huygens' principle** — a Huygens–Fresnel wavelet sum diffracts a plane wave through one or two gaps.
36. **Chemical waves** — Barkley-model spirals in an excitable medium; click to trigger waves.
37. **Genetic algorithms** — selection, crossover, and mutation evolve short travelling-salesperson routes.
38. **Kepler's laws** — equal areas in equal times, plus T² ∝ a³ for the eight planets.
39. **Fermat's principle** — the least-time path across an interface reproduces Snell's law.

Wave 08 adds six more:

40. **Noether's theorem** — break rotation or time symmetry and watch angular momentum or energy stop being conserved.
41. **E = mc²** — mass defects of fusion, fission, the Sun's pp chain, and annihilation, plus the binding-energy curve.
42. **Fractal growth** — diffusion-limited aggregation with a live fractal-dimension fit.
43. **Hydrogen atom** — exact orbitals for n ≤ 5 with simulated position measurements.
44. **Uncertainty principle** — a spreading Gaussian packet in position, momentum, and phase space.
45. **Small-world networks** — Watts–Strogatz rewiring collapses path length while clustering stays high.

Wave 09 adds four more:

46. **Quantum teleportation** — a full state-vector simulation of the three-qubit circuit, with Bloch spheres and 100% fidelity.
47. **The Standard Model** — all seventeen particles, animated Feynman diagrams for the four forces, and a mass ladder.
48. **Dark matter** — a spinning galaxy whose rotation curve only fits the data with a dark halo.
49. **Evolution of the eye** — Nilsson & Pelger's patch → cup → pinhole → lens sequence, driven by selection.

Wave 10 adds four more:

50. **Einstein rings** — ray-traced strong lensing of a whole galaxy into arcs, rings, and crosses.
51. **CMB acoustic peaks** — a toy acoustic model of the microwave-background spectrum with a matching simulated sky.
52. **Protein folding** — the HP lattice model annealed by Monte Carlo toward known optimal folds.
53. **Quantum error correction** — repetition codes, syndrome measurement, and the error threshold.

## Run it

Open `index.html` in a modern browser. The project has no build step, external
dependencies, network calls, or telemetry.

## Layout

- `js/core.js` — shared state, the `defineTheory()` registry, and drawing helpers.
- `js/sims/NN-name.js` — one file per simulation: its text, slider defaults and
  formats, control panel, and `sim` object (`draw`, plus optional `reset`,
  `tick`, `resetOn`, `pick`, and button actions named by `data-action`).
- `js/main.js` — builds the nav from the registry and runs the controls and
  animation loop.

To add a simulation, create `js/sims/54-name.js` calling `defineTheory(...)` and
add its `<script>` tag to `index.html` before `js/main.js`. Numbering and the
nav follow script order; set `wave:` on the first simulation of a new wave.

## Scientific scope

These are explanatory models, not full numerical solvers. Each panel states its
equation and assumptions. The visualizations are designed to make relationships
and limits legible, not to imply that a simplified model is the whole theory.

## Next candidates

- Superconductivity and Cooper pairs
- The double pendulum and phase-space chaos
- Neutron stars and the Chandrasekhar limit
- Cellular respiration as an energy cascade
