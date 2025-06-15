/* ────────────────────────────────────────────────────────────
   Fragmented-Towers – full dat.GUI controls
   -----------------------------------------------------------
   • 5 modules per tower + shared plinth
   • adjust dimensions, position, rotations and visibility
   • globalScale lets you enlarge / shrink everything at once
   • p5.easycam gives smooth orbit/zoom; remove createEasyCam()
     if you want the simpler built-in orbitControl().
   ──────────────────────────────────────────────────────────── */

let comps, gui, params = {};

// ── helper to push a module definition into `comps` and expose
//    its parameters inside `params` (so dat.GUI sees them)
function addComponent(obj) {
  comps.push(obj);
  const { name, params:p, pos, rot } = obj;
  params[name] = { visible: obj.visible };
  // flatten numeric controls into e.g. params["L-mid-1_width"]
  Object.entries(p).forEach(([k,v]) => params[`${name}_${k}`] = v);
  Object.entries(pos).forEach(([k,v]) => params[`${name}_pos${k}`] = v);
  Object.entries(rot).forEach(([k,v]) => params[`${name}_rot${k}`] = v);
}

// ────────────────────────────────────────────────────────────
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  createEasyCam();               // comment out if you don’t want it

  /* lights */
  ambientLight(180);
  directionalLight(255,255,255, -0.4,-1,-0.2);

  /* ========== BUILD COMPONENT LIST ========== */
  comps  = [];
  params.globalScale = 1.0;
  params.showGrid    = true;

  // shared plinth
  addComponent({ name:'plinth', type:'box', visible:true,
    params:{ w:420, h:40, d:160 },
    pos:{ x:0,  y:20,  z:0  },
    rot:{ x:0,  y:0,   z:0  }});

  // LEFT tower (5 modules)
  addComponent({ name:'L-base',  type:'box', visible:true,
    params:{ w:110,h:70,d:110 }, pos:{x:-110,y:-15,z:0},   rot:{x:0,y:0,z:0}});
  addComponent({ name:'L-mid-1', type:'box', visible:true,
    params:{ w:100,h:70,d:100 }, pos:{x:-110,y:-85,z: 8}, rot:{x:10,y:12,z:-6}});
  addComponent({ name:'L-mid-2', type:'box', visible:true,
    params:{ w: 92,h:70,d: 92 }, pos:{x:-108,y:-155,z:-3},rot:{x:-8,y:-14,z:5}});
  addComponent({ name:'L-mid-3', type:'box', visible:true,
    params:{ w: 88,h:70,d: 88 }, pos:{x:-112,y:-225,z: 4},rot:{x:7,y:18,z:-10}});
  addComponent({ name:'L-top',   type:'box', visible:true,
    params:{ w: 85,h:75,d: 85 }, pos:{x:-112,y:-300,z:0}, rot:{x:-12,y:-8,z:6}});

  // RIGHT tower (5 modules)
  addComponent({ name:'R-base',  type:'box', visible:true,
    params:{ w:110,h:70,d:110 }, pos:{x:110,y:-15,z:0},   rot:{x:0,y:0,z:0}});
  addComponent({ name:'R-mid-1', type:'box', visible:true,
    params:{ w:100,h:70,d:100 }, pos:{x:110,y:-85,z:-8}, rot:{x:-8,y:14,z:4}});
  addComponent({ name:'R-mid-2', type:'box', visible:true,
    params:{ w: 92,h:70,d: 92 }, pos:{x:108,y:-155,z:3}, rot:{x:7,y:-16,z:-5}});
  addComponent({ name:'R-mid-3', type:'box', visible:true,
    params:{ w: 88,h:70,d: 88 }, pos:{x:112,y:-225,z:-6},rot:{x:-9,y:11,z:8}});
  addComponent({ name:'R-top',   type:'box', visible:true,
    params:{ w: 85,h:75,d: 85 }, pos:{x:112,y:-300,z:0}, rot:{x:10,y:-12,z:-6}});

  /* ========== dat.GUI construction ========== */
  gui = new dat.GUI({ width:260 });
  gui.domElement.style = 'position:fixed;right:8px;top:8px;z-index:10';

  gui.add(params, 'globalScale', 0.25, 2.0).name('global scale');
  gui.add(params, 'showGrid').name('ground grid');

  comps.forEach(c => {
    const folder = gui.addFolder(c.name);
    folder.add(params[c.name], 'visible').name('visible');

    // size
    Object.keys(c.params).forEach(k=>{
      folder.add(params, `${c.name}_${k}`, 40, 200)
            .name(`${k}`).onChange(v=>c.params[k]=v);
    });

    // position
    Object.keys(c.pos).forEach(k=>{
      folder.add(params, `${c.name}_pos${k}`, -200, 200)
            .name(`pos ${k}`).onChange(v=>c.pos[k]=v);
    });

    // rotation
    Object.keys(c.rot).forEach(k=>{
      folder.add(params, `${c.name}_rot${k}`, -45, 45)
            .name(`rot ${k}`).onChange(v=>c.rot[k]=v);
    });

    folder.open();
  });
}

function draw() {
  background(230);
  orbitControl();                     // still works alongside EasyCam

  scale(params.globalScale);

  if (params.showGrid) drawGroundGrid(600, 20);
  drawPrimitives();
}

/* ──────────────────────────────────────────── */
function drawPrimitives() {
  comps.forEach(c => {
    if (!params[c.name].visible) return;
    push();
    translate(c.pos.x, c.pos.y, c.pos.z);
    rotateX(c.rot.x); rotateY(c.rot.y); rotateZ(c.rot.z);

    if (c.type === 'box')
      box(c.params.w, c.params.h, c.params.d);
    pop();
  });
}

/* ground reference grid */
function drawGroundGrid(size, step) {
  push(); rotateX(90);
  stroke(200); strokeWeight(1);
  for (let i=-size; i<=size; i+=step) {
    line(i,-size, i, size);
    line(-size, i, size, i);
  }
  pop();
}

function windowResized(){ resizeCanvas(windowWidth, windowHeight); }
