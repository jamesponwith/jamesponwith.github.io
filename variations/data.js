// Shared content for every variation. Paths are site-root absolute.
// Single source of content for the home page (/index.html) and every variation; classic.html keeps its own copy.
window.SITE = {
  name: 'James Ponwith',
  title: 'Principal Software Engineer',
  location: 'NYC · London',
  tagline: 'I design and build resiliency systems for real-time payments, then experiment on the side with ML, analytics, and projects rooted in sport and motion.',
  email: 'jamesponwith@gmail.com',
  github: 'https://github.com/jamesponwith',
  linkedin: 'https://www.linkedin.com/in/james-ponwith24/',
  resume: '/assets/Resume/Resume_James_Ponwith.pdf',
  portrait: '/assets/img/JandE.JPEG',
  about: [
    "I'm a systems-minded engineer with a background in competitive tennis and a dual focus on Computer Science and Finance (University of San Diego). That mix shapes how I think about risk, reliability, and the stories data can tell.",
    "I care about architectures that stay composed under load: multi-AZ routing, health evaluation, observability, and controlled failure modes. I also enjoy projects that connect code to the physical world — motion, audio, sport, or people using a product in real time."
  ],
  stack: ['Go', 'Python', 'Rust', 'AWS (ECS, Route 53, DynamoDB, CloudWatch)', 'Kubernetes', 'Terraform', 'New Relic', 'Temporal', 'Three.js', 'JAX'],
  stats: [
    { value: '$780B', label: 'card auth volume protected' },
    { value: '~1 min', label: 'MTTR, down 95%' },
    { value: '0', label: 'Sev-3+ incidents in a year' },
    { value: '12+', label: 'services shielded' }
  ],
  // tags: tech | finance | sport. media: {type: 'img'|'video', src, poster?} or null (use term instead).
  projects: [
    {
      id: 'resiliency', featured: true, title: 'Resiliency Engine', subtitle: 'Card Authorizations · Capital One',
      kind: 'Production System', tags: ['tech', 'finance'], year: 2025,
      blurb: 'Highly concurrent Go engine that auto-detects failures across multi-tenant ECS clusters and routes live traffic to healthy cells — protecting card authorization systems processing $780B.',
      bullets: ['Cut MTTR 95% to ~1 minute; protects $2M+ net income/yr.', 'Zero Sev-3+ incidents across 12+ shielded services over the past year.', 'Spans 8 tenant apps, 15+ teams, 3 orgs — built as sole lead engineer.', 'Cross-region consistency via DynamoDB MRSC, conditional writes, and a custom peer-to-peer lease protocol.'],
      stack: ['Go', 'AWS ECS', 'Route 53', 'DynamoDB', 'New Relic'],
      term: ['$ tail -f resiliency-engine.log', '14:02:11 e1b p99 breach — degraded', '14:02:14 quorum 3/3 · mode=action', '14:02:15 route53: e1b → e1a, e1c', '14:02:16 0 auths dropped', '14:03:12 e1b healthy — restored'],
      media: null, links: []
    },
    {
      id: 'k8s', title: 'Kubernetes Platform', subtitle: 'Mission-critical payments',
      kind: 'Platform & SRE', tags: ['tech', 'finance'], year: 2024,
      blurb: "Ownership of Kubernetes infrastructure for Capital One's mission-critical payment processing: cluster operations, reliability, and deployment workflows across environments.",
      stack: ['Kubernetes', 'Terraform', 'ArgoCD', 'Jenkins', 'OTEL'],
      term: ['$ kubectl get pods -n payments', 'auth-proc-0     2/2  Running', 'auth-proc-1     2/2  Running', 'ledger-sync-7f  2/2  Running', 'rollout-canary  1/1  Running'],
      media: null, links: []
    },
    {
      id: 'saga', title: 'card-auth-saga', subtitle: 'Card authorization as a Temporal saga',
      kind: 'Payments & Workflows', tags: ['tech', 'finance'], year: 2025,
      blurb: 'A card issuer backend in Go: authorize, hold, capture or release. Every money movement posts to a double-entry ledger that always sums to zero; idempotency keys mean retries never double-post. Thirteen failure drills against a real Temporal server (worker killed mid-hold, duplicate signals, a MySQL outage) each assert exact balances, and a nightly audit checks the whole ledger sums to zero.',
      stack: ['Go', 'Temporal', 'MySQL', 'Double-entry ledger'],
      media: { type: 'img', src: '/assets/demos/card-auth-saga-demo.gif' },
      links: [{ label: 'Case study', href: '/card-auth-saga.html' }, { label: 'GitHub', href: 'https://github.com/jamesponwith/card-auth-saga' }]
    },
    {
      id: 'phux', title: 'Phux', subtitle: 'Terminal control plane',
      kind: 'Agent Infrastructure', tags: ['tech'], year: 2026,
      blurb: 'Share real terminals with your agents: terminals as addressable objects on the wire, so humans, GUIs and AI agents observe and control the same live session from identical byte streams.',
      stack: ['libghostty', 'WebAssembly', 'QUIC', 'MCP'],
      media: { type: 'img', src: '/assets/demos/phux-demo.gif' },
      links: [{ label: 'Live', href: 'https://phux.phall.io/' }]
    },
    {
      id: 'llm-router', title: 'LLM Resiliency Router', subtitle: 'Failover for AI serving',
      kind: 'AI Infrastructure', tags: ['tech'], year: 2025,
      blurb: 'Reverse proxy that keeps LLM traffic flowing through provider outages — health cells with ejection and half-open probes, priority failover when a provider dies mid-traffic, a quality canary that ejects providers returning garbage, and hedging for streams that stall before the first token. Zero client-visible errors.',
      stack: ['Go', 'OpenAI-compatible', 'Chaos harness'],
      media: { type: 'img', src: '/assets/demos/llm-router-demo.gif' },
      links: [{ label: 'GitHub', href: 'https://github.com/jamesponwith/llm-resiliency-router' }, { label: 'Writeup', href: '/llm-router-lessons.html' }, { label: 'How it was built', href: '/flywheel-writeup.html' }, { label: 'DORA', href: '/dora.html' }]
    },
    {
      id: 'ramp-graph', title: 'ramp-graph', subtitle: 'Graph database in Rust',
      kind: 'Database · Systems', tags: ['tech'], year: 2026,
      blurb: "A Rust rewrite of LemonGraph: log-structured, transactional graph DB on LMDB with point-in-time history. 5.2–7.7× faster inserts and 14–17× faster lookups and queries than upstream on a 1M-node graph.",
      stack: ['Rust', 'LMDB', 'Query engine'],
      media: { type: 'img', src: '/assets/img/ramp-graph.jpg' },
      links: [{ label: 'GitHub', href: 'https://github.com/jamesponwith/ramp-graph' }]
    },
    {
      id: 'rocketlab', title: 'RocketLab', subtitle: 'Rocket engine design platform',
      kind: 'Simulation', tags: ['tech'], year: 2026,
      blurb: 'Liquid rocket engine simulator in the browser: equilibrium chemistry, regen cooling, turbopump power balance, aerospikes and RDEs. Matches RS-25, Raptor 2 and Merlin 1D within 2% on Isp.',
      stack: ['Python', 'Pyodide', 'Thermochemistry'],
      media: { type: 'img', src: '/assets/demos/rocketlab-demo.gif' },
      links: [{ label: 'Case study', href: '/rocketlab.html' }, { label: 'Launch', href: 'https://jamesponwith.github.io/rocketlab/' }]
    },
    {
      id: 'f1', title: 'Power Unit Forge', subtitle: 'F1 engine design lab',
      kind: 'Simulation', tags: ['tech', 'sport'], year: 2026,
      blurb: 'Holographic workbench for a 1.6 L V6 turbo hybrid. Tune compression, boost and ERS; a physics model answers with knock margin, fuel flow, temperatures and lap time.',
      stack: ['Three.js', 'Engine physics', 'Web Audio'],
      media: { type: 'video', src: '/assets/demos/f1-sim-demo.mp4', poster: '/assets/demos/f1-sim-demo-poster.jpg' },
      links: [{ label: 'Build an engine', href: 'https://jamesponwith.github.io/f1-sim/' }]
    },
    {
      id: 'aegis', title: 'AEGIS', subtitle: 'Drone-swarm protective dome',
      kind: 'Simulation', tags: ['tech'], year: 2026,
      blurb: 'A swarm holds a hemispherical shell and intercepts inbound threats: IMM trackers on noisy radar, Hungarian assignment, self-healing shell. 448/448 hostiles captured across a 16-seed sweep.',
      stack: ['Python', 'IMM tracking', 'Hungarian', 'Three.js'],
      media: { type: 'video', src: '/assets/demos/drone-dome-demo.mp4', poster: '/assets/demos/drone-dome-demo-poster.jpg' },
      links: [{ label: 'Case study', href: '/aegis.html' }, { label: 'Replays', href: 'https://jamesponwith.github.io/drone-dome/' }]
    },
    {
      id: 'strata', title: 'Strata', subtitle: 'Earth, layer by layer',
      kind: '3D Visualization', tags: ['tech'], year: 2026,
      blurb: 'Interactive 3D cutaway of 13 layers of the Earth. Probe temperature and pressure at any depth, trigger an earthquake and watch seismic rays refract through the interior.',
      stack: ['Three.js', 'GLSL', 'Seismic ray tracing'],
      media: { type: 'video', src: '/assets/demos/strata-demo.mp4', poster: '/assets/demos/strata-demo-poster.jpg' },
      links: [{ label: 'Journey', href: 'https://jamesponwith.github.io/world-layers/' }]
    },
    {
      id: 'theory', title: 'Theory Simulations', subtitle: '53 live models of big ideas',
      kind: 'Interactive Science', tags: ['tech'], year: 2025,
      blurb: "A browser atlas of live physics and math: double-slit interference, Bell's theorem, the three-body problem, Hawking radiation, Turing patterns and more.",
      stack: ['JavaScript', 'Canvas', 'Physics'],
      media: { type: 'video', src: '/assets/demos/theory-simulations-demo.mp4', poster: '/assets/demos/theory-simulations-demo-poster.jpg' },
      links: [{ label: 'Launch', href: '/theory-simulations/' }]
    },
    {
      id: 'brax', title: 'Brax Tennis RL', subtitle: 'Teaching an agent to play tennis',
      kind: 'Reinforcement Learning', tags: ['tech', 'sport'], year: 2025,
      blurb: "PPO agent in Google's JAX physics engine: 95% interception, 72% returns over the net, self-play rallies that grow from 1.77 to ~1.95 net crossings across two generations — reward hacks and all.",
      stack: ['JAX', 'Brax / MJX', 'PPO', 'Self-play'],
      media: { type: 'video', src: '/assets/demos/brax-tennis-demo.mp4', poster: '/assets/demos/brax-tennis-demo-poster.jpg' },
      links: [{ label: 'Writeup', href: '/tennis-part1.html' }]
    },
    {
      id: 'recsys', title: 'Music RecSys Ecosystem', subtitle: 'Spotify Million Playlist Dataset',
      kind: 'Recommender Systems', tags: ['tech'], year: 2025,
      blurb: 'Five apps, each answering a question the last raised: NL playlist generation, sequence-aware continuation, an exposure audit, and a feedback-loop simulation that inverted its own hypothesis. 43.6% of exposure goes to 1% of artists, and no amount of re-ranking fixes it; playlist order alone cuts Clicks 13.7%.',
      stack: ['Python', 'scikit-learn', 'RRF · MMR'],
      term: ['$ cadence play "chill acoustic, rainy sunday"', '1  Ray Charles   acoustic 0.66', '2  Iron & Wine   6B→7B harmonic', '3  Diana Krall   7B→7B harmonic', '20 tracks · 79.9 min'],
      media: null, links: [{ label: 'GitHub', href: 'https://github.com/jamesponwith/spotify-recsys-ecosystem' }]
    },
    {
      id: 'aat-ios', title: 'All About Tennis — iOS', subtitle: 'Shipped solo to the App Store',
      kind: 'Mobile App', tags: ['tech', 'sport', 'finance'], year: 2026,
      blurb: 'Native app for a family tennis shop: live Shopify storefront with Apple Pay, stringing orders with push notifications, price alerts, a map of every US court, and a mic-based shot tracker.',
      stack: ['React Native', 'Expo', 'Shopify', 'Supabase'],
      media: { type: 'img', src: '/assets/img/aat-mobile.jpg' },
      links: [{ label: 'App Store', href: 'https://apps.apple.com/us/app/id6801365777' }, { label: 'Shop site', href: 'https://allabouttennis.com/' }]
    },
    {
      id: 'court-finder', title: 'Court Finder', subtitle: 'Every public court in the US',
      kind: 'Web App', tags: ['tech', 'sport'], year: 2025,
      blurb: 'Mobile-first map of public tennis courts across 50 states + DC: clustered markers, near-me search, surface and lighting filters. Data from OpenStreetMap and NYC Parks served as static JSON.',
      stack: ['React', 'TypeScript', 'Leaflet'],
      media: { type: 'video', src: '/assets/demos/court-finder-demo.mp4', poster: '/assets/demos/court-finder-demo-poster.jpg' },
      links: [{ label: 'Find a court', href: 'https://jamesponwith.github.io/court-finder/' }]
    },
    {
      id: 'qualcomm', title: 'Hardware Validation Pipelines', subtitle: 'Qualcomm · 5G modems',
      kind: 'CI/CD & Validation', tags: ['tech'], year: 2021,
      blurb: 'Validated 5G/4G/3G modem subsystems on an FPGA farm — 3 timing and power bugs caught pre-tape-out, 7 production SoCs shipped, triage time cut 90%.',
      stack: ['Python', 'Trace32', 'Jenkins', 'Splunk'],
      term: ['jenkins@farm validate --target 5g-nr', 'flash bitstream ........ ok', 'boot modem subsystem ... ok', 'timing checks .......... 412/412 pass', 'power rails ............ 1 warn → triage'],
      media: null, links: []
    },
    {
      id: 'posenet', title: 'PoseNet', subtitle: 'In-browser pose estimation',
      kind: 'Motion & Web ML', tags: ['tech', 'sport'], year: 2020,
      blurb: 'Real-time human motion tracking in the browser with TensorFlow.js.',
      stack: ['JavaScript', 'TensorFlow.js'],
      media: { type: 'video', src: '/assets/img/posenetgif.mp4', poster: '/assets/img/posenetgif-poster.jpg' },
      links: [{ label: 'Demo', href: '/posenetdemo.html' }]
    },
    {
      id: 'tello', title: 'Tello Drone', subtitle: 'YOLO & OpenCV face tracking',
      kind: 'Computer Vision', tags: ['tech', 'sport'], year: 2020,
      blurb: 'DJI Tello controlled via Python, with YOLO and OpenCV for face tracking and motion-aware control.',
      stack: ['Python', 'OpenCV', 'YOLO'],
      media: { type: 'img', src: '/assets/img/SeniorProject.jpg' },
      links: [{ label: 'Writeup', href: '/SeniorProject.html' }]
    }
  ]
};
