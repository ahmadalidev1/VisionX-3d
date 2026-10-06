(() => {

  "use strict";


  /* =====================================================
     BASIC SETTINGS
  ====================================================== */

  const canvas = document.getElementById("gl");

  const intro = document.getElementById("intro");
  const introStatus = document.getElementById("intro-status");
  const skipIntro = document.getElementById("skip-intro");

  const header = document.getElementById("header");

  const techTip = document.getElementById("tech-tip");

  const techPanel = document.getElementById("tech-panel");
  const closePanel = document.getElementById("close-panel");

  const panelTitle = document.getElementById("panel-title");
  const panelList = document.getElementById("panel-list");


  const reducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  /* =====================================================
     THREE.JS SETUP
  ====================================================== */

  let renderer;

  try {

    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false
    });

  } catch (error) {

    console.warn(
      "WebGL is not supported."
    );

    intro.remove();

    return;
  }


  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.7)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );


  /* =====================================================
     SCENE
  ====================================================== */

  const scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(0x040611);

  scene.fog =
    new THREE.FogExp2(
      0x040611,
      0.025
    );


  /* =====================================================
     CAMERA
  ====================================================== */

  const camera =
    new THREE.PerspectiveCamera(
      50,
      window.innerWidth /
      window.innerHeight,
      0.1,
      100
    );


  camera.position.set(
    0,
    4,
    17
  );


  /* =====================================================
     HELPERS
  ====================================================== */

  const clamp =
    (value, min, max) =>
      Math.min(
        max,
        Math.max(min, value)
      );


  const lerp =
    (a, b, t) =>
      a + (b - a) * t;


  const ease =
    value =>
      value * value *
      (3 - 2 * value);


  const progress =
    (time, start, end) =>
      clamp(
        (time - start) /
        (end - start),
        0,
        1
      );


  /* =====================================================
     LIGHTS
  ====================================================== */

  const ambient =
    new THREE.AmbientLight(
      0x7788bb,
      0.35
    );

  scene.add(ambient);


  const blueLight =
    new THREE.PointLight(
      0x3b82f6,
      1.8,
      35
    );

  blueLight.position.set(
    -5,
    5,
    5
  );

  scene.add(blueLight);


  const purpleLight =
    new THREE.PointLight(
      0x8b5cf6,
      1.5,
      35
    );

  purpleLight.position.set(
    5,
    4,
    3
  );

  scene.add(purpleLight);


  const cyanLight =
    new THREE.PointLight(
      0x22d3ee,
      1.4,
      30
    );

  cyanLight.position.set(
    0,
    5,
    -5
  );

  scene.add(cyanLight);


  /* =====================================================
     GRID
  ====================================================== */

  const grid =
    new THREE.GridHelper(
      80,
      80,
      0x3b82f6,
      0x18244e
    );

  grid.material.transparent = true;

  grid.material.opacity = 0.18;

  scene.add(grid);


  grid.position.y = -1;


  /* =====================================================
     GLOW TEXTURE
  ====================================================== */

  function createGlowTexture() {

    const c =
      document.createElement("canvas");

    c.width = 128;
    c.height = 128;

    const ctx =
      c.getContext("2d");

    const gradient =
      ctx.createRadialGradient(
        64,
        64,
        0,
        64,
        64,
        64
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,.9)"
    );

    gradient.addColorStop(
      .35,
      "rgba(255,255,255,.25)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      128,
      128
    );

    return new THREE.CanvasTexture(c);
  }


  const glowTexture =
    createGlowTexture();


  /* =====================================================
     FLOOR GLOW
  ====================================================== */

  const floorGlow =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        15,
        15
      ),

      new THREE.MeshBasicMaterial({

        map: glowTexture,

        color: 0x3b82f6,

        transparent: true,

        opacity: .22,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending

      })

    );


  floorGlow.rotation.x =
    -Math.PI / 2;

  floorGlow.position.y =
    -0.95;

  scene.add(floorGlow);


  /* =====================================================
     MAIN GLOW RING
  ====================================================== */

  const mainRing =
    new THREE.Mesh(

      new THREE.RingGeometry(
        4.2,
        4.27,
        96
      ),

      new THREE.MeshBasicMaterial({

        color: 0x22d3ee,

        transparent: true,

        opacity: .55,

        side:
          THREE.DoubleSide,

        blending:
          THREE.AdditiveBlending

      })

    );


  mainRing.rotation.x =
    -Math.PI / 2;

  mainRing.position.y =
    -0.88;

  scene.add(mainRing);


  /* =====================================================
     PARTICLES
  ====================================================== */

  const particleCount =
    900;

  const positions =
    new Float32Array(
      particleCount * 3
    );

  const colors =
    new Float32Array(
      particleCount * 3
    );


  const particleColors = [

    new THREE.Color(0x3b82f6),

    new THREE.Color(0x22d3ee),

    new THREE.Color(0x8b5cf6)

  ];


  for (
    let i = 0;
    i < particleCount;
    i++
  ) {

    const i3 = i * 3;

    positions[i3] =
      (Math.random() - .5) * 48;

    positions[i3 + 1] =
      Math.random() * 18 - 2;

    positions[i3 + 2] =
      (Math.random() - .5) * 48;


    particleColors[
      i % particleColors.length
    ].toArray(
      colors,
      i3
    );

  }


  const particleGeometry =
    new THREE.BufferGeometry();


  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      positions,
      3
    )
  );


  particleGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(
      colors,
      3
    )
  );


  const particles =
    new THREE.Points(

      particleGeometry,

      new THREE.PointsMaterial({

        size: .075,

        vertexColors: true,

        transparent: true,

        opacity: .8,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending

      })

    );


  scene.add(particles);


  /* =====================================================
     WORKSTATION
  ====================================================== */

  const workstation =
    new THREE.Group();

  workstation.position.y =
    -1;

  scene.add(workstation);


  const darkMaterial =
    new THREE.MeshStandardMaterial({

      color: 0x10182d,

      roughness: .38,

      metalness: .6

    });


  const blackMaterial =
    new THREE.MeshStandardMaterial({

      color: 0x03050c,

      roughness: .25,

      metalness: .8

    });


  const cyanMaterial =
    new THREE.MeshStandardMaterial({

      color: 0x22d3ee,

      emissive: 0x22d3ee,

      emissiveIntensity: .7,

      metalness: .3,

      roughness: .35

    });


  /* =====================================================
     DESK
  ====================================================== */

  const desk =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        5.2,
        .16,
        2
      ),

      darkMaterial

    );


  desk.position.y =
    1.45;

  workstation.add(desk);


  const deskLine =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        5,
        .025,
        .025
      ),

      cyanMaterial

    );


  deskLine.position.set(
    0,
    1.35,
    1
  );

  workstation.add(deskLine);


  /* =====================================================
     DESK LEGS
  ====================================================== */

  [-2.35, 2.35].forEach(x => {

    const leg =
      new THREE.Mesh(

        new THREE.BoxGeometry(
          .12,
          1.4,
          1.5
        ),

        darkMaterial

      );

    leg.position.set(
      x,
      .72,
      0
    );

    workstation.add(leg);

  });


  /* =====================================================
     SCREEN
  ====================================================== */

  const screenGroup =
    new THREE.Group();

  screenGroup.position.set(
    0,
    2.7,
    -.35
  );

  workstation.add(screenGroup);


  const screenFrame =
    new THREE.Mesh(

      new THREE.BoxGeometry(
        3,
        1.65,
        .12
      ),

      blackMaterial

    );

  screenGroup.add(screenFrame);


  /* =====================================================
     SCREEN CANVAS
  ====================================================== */

  const screenCanvas =
    document.createElement("canvas");

  screenCanvas.width =
    900;

  screenCanvas.height =
    500;


  const screenContext =
    screenCanvas.getContext("2d");


  const screenTexture =
    new THREE.CanvasTexture(
      screenCanvas
    );


  const screen =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        2.8,
        1.45
      ),

      new THREE.MeshBasicMaterial({
        map: screenTexture
      })

    );


  screen.position.z =
    .07;

  screenGroup.add(screen);


  /* =====================================================
     CODE SCREEN
  ====================================================== */

  const codeLines = [

    'const developer = {',

    '  name: "Vision X",',

    '  role: "Full Stack Engineer",',

    '  skills: ["React", "Node.js",',

    '    "TypeScript", "AI"],',

    '};',

    '',

    'await deploy(developer);'

  ];


  let typedCharacters = 0;


  function drawScreen() {

    const ctx =
      screenContext;

    const width =
      screenCanvas.width;

    const height =
      screenCanvas.height;


    ctx.fillStyle =
      "#070b18";

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    ctx.fillStyle =
      "#111a33";

    ctx.fillRect(
      0,
      0,
      width,
      45
    );


    ctx.fillStyle =
      "#ff5f57";

    ctx.beginPath();

    ctx.arc(
      25,
      22,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#febc2e";

    ctx.beginPath();

    ctx.arc(
      48,
      22,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#28c840";

    ctx.beginPath();

    ctx.arc(
      71,
      22,
      7,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.font =
      "22px monospace";


    let remaining =
      typedCharacters;


    codeLines.forEach(
      (line, index) => {

        if (remaining <= 0)
          return;


        const visible =
          line.slice(
            0,
            remaining
          );


        remaining -=
          visible.length;


        ctx.fillStyle =
          "#56617e";

        ctx.fillText(
          String(index + 1),
          22,
          85 + index * 42
        );


        ctx.fillStyle =
          index === 0 ||
          index === 7
            ? "#c792ea"
            : "#d6deeb";


        ctx.fillText(
          visible,
          70,
          85 + index * 42
        );

      });


    ctx.fillStyle =
      "#22d3ee";

    ctx.fillRect(
      20,
      height - 38,
      width - 40,
      1
    );


    ctx.fillStyle =
      "#7ee787";

    ctx.font =
      "16px monospace";

    ctx.fillText(
      "server :3000   ● ONLINE",
      22,
      height - 15
    );


    screenTexture.needsUpdate =
      true;

  }


  /* =====================================================
     KEYBOARD
  ====================================================== */

  const keyboard =
    new THREE.Mesh(

      new THREE.PlaneGeometry(
        1.9,
        .62
      ),

      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: 0x22d3ee,
        transparent: true,
        opacity: .25
      })

    );


  keyboard.rotation.x =
    -Math.PI / 2;

  keyboard.position.set(
    0,
    1.56,
    .5
  );

  workstation.add(keyboard);


  /* =====================================================
     FLOATING TECH NODES
  ====================================================== */

  const technologies = [

    {
      name: "React",
      color: 0x22d3ee,
      category: 0,
      items: [
        "Component Architecture",
        "React Hooks",
        "State Management",
        "Modern UI"
      ]
    },

    {
      name: "Node.js",
      color: 0x7ee787,
      category: 1,
      items: [
        "Express",
        "REST APIs",
        "Authentication",
        "Backend Systems"
      ]
    },

    {
      name: "MongoDB",
      color: 0x34d399,
      category: 2,
      items: [
        "Data Modeling",
        "CRUD",
        "Aggregation",
        "Database Design"
      ]
    },

    {
      name: "AI",
      color: 0xc084fc,
      category: 3,
      items: [
        "AI Automation",
        "LLM Integration",
        "AI APIs",
        "Intelligent Workflows"
      ]
    },

    {
      name: "Cloud",
      color: 0x60a5fa,
      category: 4,
      items: [
        "Deployment",
        "Cloud Infrastructure",
        "Scalability",
        "DevOps"
      ]
    },

    {
      name: "Git",
      color: 0xfb923c,
      category: 5,
      items: [
        "Git",
        "GitHub",
        "Version Control",
        "CI/CD"
      ]
    },

    {
      name: "TS",
      color: 0x3b82f6,
      category: 0,
      items: [
        "TypeScript",
        "Type Safety",
        "Interfaces",
        "Modern JavaScript"
      ]
    },

    {
      name: "Docker",
      color: 0x38bdf8,
      category: 4,
      items: [
        "Containers",
        "Development",
        "Deployment",
        "DevOps"
      ]
    }

  ];


  const nodes = [];


  function createTechNode(tech) {

    const canvas =
      document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 256;

    const ctx =
      canvas.getContext("2d");


    const gradient =
      ctx.createRadialGradient(
        128,
        128,
        20,
        128,
        128,
        120
      );


    const color =
      "#" +
      tech.color
        .toString(16)
        .padStart(6, "0");


    gradient.addColorStop(
      0,
      "rgba(30,45,90,.98)"
    );

    gradient.addColorStop(
      1,
      "rgba(4,8,20,.98)"
    );


    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      128,
      128,
      105,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.lineWidth = 8;

    ctx.strokeStyle =
      color;

    ctx.stroke();


    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "700 52px Space Grotesk, sans-serif";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      tech.name,
      128,
      134
    );


    const texture =
      new THREE.CanvasTexture(
        canvas
      );


    const sprite =
      new THREE.Sprite(

        new THREE.SpriteMaterial({

          map: texture,

          transparent: true,

          opacity: 0,

          depthWrite: false

        })

      );


    const glow =
      new THREE.Sprite(

        new THREE.SpriteMaterial({

          map: glowTexture,

          color: tech.color,

          transparent: true,

          opacity: 0,

          depthWrite: false,

          blending:
            THREE.AdditiveBlending

        })

      );


    scene.add(
      glow,
      sprite
    );


    return {

      sprite,

      glow,

      tech,

      hover: 0

    };

  }


  technologies.forEach(
    tech => {

      nodes.push(
        createTechNode(tech)
      );

    }
  );


  /* =====================================================
     MOUSE
  ====================================================== */

  const mouse = {
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0
  };


  window.addEventListener(
    "pointermove",
    event => {

      mouse.x =
        event.clientX /
        window.innerWidth -
        .5;

      mouse.y =
        event.clientY /
        window.innerHeight -
        .5;

    }
  );


  /* =====================================================
     RAYCASTER
  ====================================================== */

  const raycaster =
    new THREE.Raycaster();

  const pointer =
    new THREE.Vector2();


  let hoveredNode = -1;


  function checkNode(event) {

    pointer.x =
      event.clientX /
      window.innerWidth *
      2 - 1;

    pointer.y =
      -(event.clientY /
      window.innerHeight) *
      2 + 1;


    raycaster.setFromCamera(
      pointer,
      camera
    );


    const objects =
      nodes.map(
        node => node.sprite
      );


    const hits =
      raycaster.intersectObjects(
        objects
      );


    if (!hits.length) {

      hoveredNode = -1;

      return;

    }


    hoveredNode =
      nodes.findIndex(
        node =>
          node.sprite ===
          hits[0].object
      );

  }


  window.addEventListener(
    "pointermove",
    event => {

      checkNode(event);

    }
  );


  /* =====================================================
     TECH PANEL
  ====================================================== */

  function openTechPanel(index) {

    const node =
      nodes[index];

    if (!node)
      return;


    panelTitle.textContent =
      node.tech.name;


    panelList.innerHTML =
      node.tech.items
        .map(
          item =>
            `<li>${item}</li>`
        )
        .join("");


    techPanel.classList.add(
      "open"
    );

  }


  function closeTechPanel() {

    techPanel.classList.remove(
      "open"
    );

  }


  closePanel.addEventListener(
    "click",
    closeTechPanel
  );


  window.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeTechPanel();

      }

    }
  );


  window.addEventListener(
    "click",
    event => {

      if (
        hoveredNode >= 0 &&
        !event.target.closest(
          "a,button"
        )
      ) {

        openTechPanel(
          hoveredNode
        );

      }

    }
  );


  /* =====================================================
     SKILLS DATA
  ====================================================== */

  const skills = [

    {
      title: "Frontend Engineering",

      description:
        "Building responsive, interactive and high-performance interfaces using modern frontend technologies.",

      items: [
        "React",
        "Next.js",
        "JavaScript",
        "TypeScript",
        "Tailwind CSS"
      ]

    },

    {
      title: "Backend Engineering",

      description:
        "Creating APIs, authentication systems and scalable backend architecture.",

      items: [
        "Node.js",
        "Express",
        "REST APIs",
        "Authentication",
        "API Design"
      ]

    },

    {
      title: "Database",

      description:
        "Designing reliable data structures and backend data systems.",

      items: [
        "MongoDB",
        "Data Modeling",
        "CRUD",
        "Aggregation",
        "Database Design"
      ]

    },

    {
      title: "AI Engineering",

      description:
        "Integrating AI into real applications and building intelligent automation workflows.",

      items: [
        "LLM Integration",
        "AI Automation",
        "AI APIs",
        "Intelligent Workflows"
      ]

    },

    {
      title: "Cloud & DevOps",

      description:
        "Preparing applications for deployment, scalability and production environments.",

      items: [
        "Cloud Deployment",
        "Docker",
        "Scalability",
        "DevOps"
      ]

    },

    {
      title: "Development Workflow",

      description:
        "Using modern development workflows to maintain clean and collaborative projects.",

      items: [
        "Git",
        "GitHub",
        "CI/CD",
        "Code Review"
      ]

    }

  ];


  const skillTabs =
    document.getElementById(
      "skill-tabs"
    );

  const skillNumber =
    document.getElementById(
      "skill-number"
    );

  const skillTitle =
    document.getElementById(
      "skill-title"
    );

  const skillDescription =
    document.getElementById(
      "skill-description"
    );

  const skillList =
    document.getElementById(
      "skill-list"
    );


  function showSkill(index) {

    const skill =
      skills[index];


    document
      .querySelectorAll(
        ".skill-tab"
      )
      .forEach(
        (button, i) => {

          button.classList.toggle(
            "active",
            i === index
          );

        }
      );


    skillNumber.textContent =
      String(index + 1)
        .padStart(2, "0");


    skillTitle.textContent =
      skill.title;


    skillDescription.textContent =
      skill.description;


    skillList.innerHTML =
      skill.items
        .map(
          item =>
            `<div class="skill-item">${item}</div>`
        )
        .join("");

  }


  skills.forEach(
    (skill, index) => {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "skill-tab";


      button.textContent =
        skill.title;


      button.addEventListener(
        "click",
        () => showSkill(index)
      );


      skillTabs.appendChild(
        button
      );

    }
  );


  showSkill(0);


  /* =====================================================
     SCROLL HEADER
  ====================================================== */

  window.addEventListener(
    "scroll",
    () => {

      if (
        window.scrollY > 40
      ) {

        header.classList.add(
          "scrolled"
        );

      } else {

        header.classList.remove(
          "scrolled"
        );

      }

    }
  );


  /* =====================================================
     INTRO
  ====================================================== */

  const introMessages = [

    "Initializing environment...",
    "Loading workstation...",
    "Compiling developer.js...",
    "Connecting technologies...",
    "System ready."

  ];


  let introIndex = 0;


  const introInterval =
    setInterval(() => {

      introIndex =
        (introIndex + 1) %
        introMessages.length;

      introStatus.textContent =
        introMessages[introIndex];

    }, 1100);


  let introSkipped =
    false;


  function finishIntro() {

    if (introSkipped)
      return;


    introSkipped = true;

    clearInterval(
      introInterval
    );


    intro.classList.add(
      "out"
    );


    document.body.classList.add(
      "loaded"
    );


    setTimeout(
      () => {

        if (
          intro.parentNode
        ) {

          intro.remove();

        }

      },
      1300
    );

  }


  skipIntro.addEventListener(
    "click",
    finishIntro
  );


  setTimeout(
    finishIntro,
    reducedMotion
      ? 1200
      : 7000
  );


  /* =====================================================
     ANIMATION LOOP
  ====================================================== */

  let startTime =
    performance.now();


  let lastTime =
    startTime;


  function animate(now) {

    requestAnimationFrame(
      animate
    );


    const delta =
      Math.min(
        (now - lastTime) /
        1000,
        .05
      );


    lastTime = now;


    const elapsed =
      (now - startTime) /
      1000;


    /* ---------------------------------------------
       MOUSE SMOOTHING
    --------------------------------------------- */

    mouse.smoothX +=
      (
        mouse.x -
        mouse.smoothX
      ) *
      .035;


    mouse.smoothY +=
      (
        mouse.y -
        mouse.smoothY
      ) *
      .035;


    /* ---------------------------------------------
       CAMERA
    --------------------------------------------- */

    const scrollProgress =
      clamp(
        window.scrollY /
        (window.innerHeight * 1.2),
        0,
        1
      );


    const targetX =
      mouse.smoothX * 2.2;


    const targetY =
      3.5 -
      scrollProgress * 2.2 +
      mouse.smoothY * -.8;


    const targetZ =
      16 -
      scrollProgress * 4;


    camera.position.x =
      lerp(
        camera.position.x,
        targetX,
        .035
      );


    camera.position.y =
      lerp(
        camera.position.y,
        targetY,
        .035
      );


    camera.position.z =
      lerp(
        camera.position.z,
        targetZ,
        .035
      );


    camera.lookAt(
      0,
      1.4 -
      scrollProgress * 1.2,
      0
    );


    /* ---------------------------------------------
       WORKSTATION
    --------------------------------------------- */

    workstation.rotation.y =
      mouse.smoothX *
      .12 +
      scrollProgress *
      .5;


    workstation.rotation.x =
      mouse.smoothY *
      .035;


    workstation.position.y =
      -1 +
      Math.sin(
        elapsed * .8
      ) * .035;


    /* ---------------------------------------------
       PARTICLES
    --------------------------------------------- */

    particles.rotation.y =
      elapsed *
      .008;


    particles.rotation.x =
      mouse.smoothY *
      .04;


    /* ---------------------------------------------
       LIGHT MOVEMENT
    --------------------------------------------- */

    blueLight.position.x =
      -5 +
      mouse.smoothX * 7;

    purpleLight.position.x =
      5 +
      mouse.smoothX * -5;

    cyanLight.position.y =
      5 +
      mouse.smoothY * -3;


    /* ---------------------------------------------
       SCREEN
    --------------------------------------------- */

    if (
      !reducedMotion
    ) {

      typedCharacters =
        Math.min(
          200,
          Math.floor(
            Math.max(
              0,
              elapsed - 2
            ) * 25
          )
        );

    } else {

      typedCharacters = 200;

    }


    drawScreen();


    /* ---------------------------------------------
       RING
    --------------------------------------------- */

    mainRing.rotation.z =
      elapsed * .12;


    /* ---------------------------------------------
       TECHNOLOGY NODES
    --------------------------------------------- */

    const radius =
      4.8 +
      scrollProgress * 1.5;


    nodes.forEach(
      (node, index) => {

        const angle =
          index /
          nodes.length *
          Math.PI *
          2 +
          elapsed *
          .12;


        const x =
          Math.cos(angle) *
          radius;


        const z =
          Math.sin(angle) *
          radius;


        const y =
          3.4 +
          Math.sin(
            elapsed * .8 +
            index
          ) *
          .35;


        node.sprite.position.x =
          lerp(
            node.sprite.position.x,
            x +
            mouse.smoothX *
            (index % 3),
            .045
          );


        node.sprite.position.y =
          lerp(
            node.sprite.position.y,
            y -
            mouse.smoothY * .5,
            .045
          );


        node.sprite.position.z =
          lerp(
            node.sprite.position.z,
            z,
            .045
          );


        node.glow.position.copy(
          node.sprite.position
        );


        const isHovered =
          hoveredNode === index;


        node.hover +=
          (
            (isHovered ? 1 : 0) -
            node.hover
          ) * .12;


        const scale =
          1.05 +
          node.hover * .35;


        node.sprite.scale.set(
          scale,
          scale,
          1
        );


        node.glow.scale.set(
          2.5 +
          node.hover * .8,
          2.5 +
          node.hover * .8,
          1
        );


        node.sprite.material.opacity =
          .85;


        node.glow.material.opacity =
          .18 +
          node.hover * .5;


        if (
          isHovered
        ) {

          techTip.textContent =
            node.tech.name;


          const projected =
            node.sprite.position
              .clone()
              .project(camera);


          techTip.style.left =
            (
              projected.x + 1
            ) /
            2 *
            window.innerWidth +
            "px";


          techTip.style.top =
            (
              1 -
              projected.y
            ) /
            2 *
            window.innerHeight +
            "px";


          techTip.style.opacity =
            "1";

        }

      }
    );


    if (
      hoveredNode < 0
    ) {

      techTip.style.opacity =
        "0";

    }


    /* ---------------------------------------------
       FLOOR
    --------------------------------------------- */

    floorGlow.material.opacity =
      .15 +
      scrollProgress * .1;


    /* ---------------------------------------------
       RENDER
    --------------------------------------------- */

    renderer.render(
      scene,
      camera
    );

  }


  requestAnimationFrame(
    animate
  );


  /* =====================================================
     RESIZE
  ====================================================== */

  window.addEventListener(
    "resize",
    () => {

      camera.aspect =
        window.innerWidth /
        window.innerHeight;


      camera.updateProjectionMatrix();


      renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
      );


      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio,
          1.7
        )
      );

    }
  );


})();