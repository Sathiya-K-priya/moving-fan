import {   AfterViewInit,
  Component,
  ElementRef,
  ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-room',
  imports: [RouterOutlet],
  templateUrl: './room.html',
  styleUrl: './room.scss',
})
export class Room implements AfterViewInit {
  private controls!: OrbitControls;
  @ViewChild('rendererContainer', { static: false })
  rendererContainer!: ElementRef;
  private fanGroup!: THREE.Group;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  fanSpeed = 0.05;
  isLightOn: boolean = false;
  ambientLight!: THREE.AmbientLight;
directionalLight!: THREE.DirectionalLight;
lightToggleCount: number = 0;
  private curtain!: THREE.Mesh;
private originalCurtainPositions!: Float32Array;
  ngAfterViewInit(): void {
    this.initScene();
    this.createRoom();
    this.animate();
  }

  initScene() {

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#e5e5e5');

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 4, 12);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.rendererContainer.nativeElement.appendChild(
      this.renderer.domElement
    );
     this.controls = new OrbitControls(
     this.camera,
     this.renderer.domElement
    );

this.controls.enableDamping = true;
  this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
this.scene.add(this.ambientLight);

this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
this.directionalLight.position.set(5, 8, 5);
this.scene.add(this.directionalLight);
  }

  createRoom() {

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: '#d9d9d9'
      })
    );

    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Back Wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      new THREE.MeshStandardMaterial({
        color: '#ffffff'
      })
    );

    backWall.position.set(0, 5, -10);
    this.scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      new THREE.MeshStandardMaterial({
        color: '#f8f8f8'
      })
    );

    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 5, 0);

    this.scene.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      new THREE.MeshStandardMaterial({
        color: '#f8f8f8'
      })
    );

    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 5, 0);

    this.scene.add(rightWall);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        color: '#eeeeee'
      })
    );

    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 10;

    this.scene.add(ceiling);

   const fanGroup = new THREE.Group();
for (let s = 0; s < 50; s++) {

  const starShape = new THREE.Shape();

  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 0.2 : 0.08;
    const angle = (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0)
      starShape.moveTo(x, y);
    else
      starShape.lineTo(x, y);
  }

  starShape.closePath();

  const geometry = new THREE.ShapeGeometry(starShape);

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffaa,
    emissive: 0xffff88,
    emissiveIntensity: 1
  });

  const star = new THREE.Mesh(geometry, material);

  star.rotation.x = Math.PI / 2;

  // random sky placement (ceiling area)
  star.position.set(
    (Math.random() - 0.5) * 20,  // X spread
    9.98,                        // ceiling height
    (Math.random() - 0.5) * 20   // Z spread
  );

  star.scale.setScalar(0.3 + Math.random() * 0.7);

  this.scene.add(star);
}
const moonLight = new THREE.PointLight(0xffffcc, 1.5, 60);
moonLight.position.set(5, 9.6, -5); // moved forward (closer)

this.scene.add(moonLight);

// Rod
const rod = new THREE.Mesh(
  new THREE.CylinderGeometry(0.05, 0.05, 1),
  new THREE.MeshStandardMaterial({ color: '#333' })
);
rod.position.y = -0.5;
fanGroup.add(rod);

// Upper Motor
const upperMotor = new THREE.Mesh(
  new THREE.CylinderGeometry(0.22, 0.30, 0.2, 32),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
upperMotor.position.y = -1.1;
fanGroup.add(upperMotor);

// Lower Motor
const lowerMotor = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.35, 0.25, 32),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
lowerMotor.position.y = -1.3;
fanGroup.add(lowerMotor);
// Blades
for (let i = 0; i < 3; i++) {

  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(3, 0.08, 0.45),
    new THREE.MeshStandardMaterial({
      color: '#111'
    })
  );

  const bladeHolder = new THREE.Group();

  blade.position.x = 1.5;

  bladeHolder.add(blade);

  bladeHolder.rotation.y = (Math.PI * 2 * i) / 3;

  bladeHolder.position.y = -1;

  fanGroup.add(bladeHolder);
}
// =========================
// CURTAIN TEXTURE
// =========================

const curtainTexture = new THREE.TextureLoader().load(
  'images/flower-over-screen.png'
);

curtainTexture.wrapS = THREE.RepeatWrapping;
curtainTexture.wrapT = THREE.RepeatWrapping;

// Adjust texture repeat
curtainTexture.repeat.set(2, 2);

// =========================
// CURTAIN GEOMETRY
// =========================

const curtainGeometry = new THREE.PlaneGeometry(
  4,  // width
  5,  // height
  50, // width segments
  50  // height segments
);

// Add permanent curtain folds
const curtainPositions = curtainGeometry.attributes['position'];

for (let i = 0; i < curtainPositions.count; i++) {

  const x = curtainPositions.getX(i);

  const fold =
    Math.sin(x * 5) * 0.12;

  curtainPositions.setZ(i, fold);
}

curtainPositions.needsUpdate = true;

// Save original positions for animation
this.originalCurtainPositions = new Float32Array(
  curtainGeometry.attributes['position'].array
);

// =========================
// CURTAIN MATERIAL
// =========================

const curtainMaterial = new THREE.MeshStandardMaterial({
  map: curtainTexture,
  side: THREE.DoubleSide,
  roughness: 0.9
});

// =========================
// CURTAIN MESH
// =========================

this.curtain = new THREE.Mesh(
  curtainGeometry,
  curtainMaterial
);

// Curtain Rod
const curtainRod = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.06, 4.5, 32),
  new THREE.MeshStandardMaterial({
    color: 0x444444
  })
);

// Since curtain is on right wall
curtainRod.rotation.x = Math.PI / 2;

// Move slightly away from wall
curtainRod.position.set(9.6, 7.7, 0);

this.scene.add(curtainRod);

// ====================
// End Cap - Top
// ====================

const leftCap = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0x444444
  })
);

leftCap.position.set(9.7, 7.7, -2.3);

this.scene.add(leftCap);

// ====================
// End Cap - Bottom
// ====================

const rightCap = new THREE.Mesh(
  new THREE.SphereGeometry(0.12, 16, 16),
  new THREE.MeshStandardMaterial({
    color: 0x444444
  })
);

rightCap.position.set(9.7, 7.7, 2.3);

this.scene.add(rightCap);
const cupboard = new THREE.Mesh(
  new THREE.BoxGeometry(2.5, 5, 1.5),
  new THREE.MeshStandardMaterial({
    color: 0x2f4050
  })
);

cupboard.position.set(10, 2.5, -7);

cupboard.castShadow = true;
cupboard.receiveShadow = true;

this.scene.add(cupboard);
// Door material (slightly lighter than body)
const doorMaterial = new THREE.MeshStandardMaterial({
  color: 0x3c556b
});

// LEFT DOOR
const leftDoor = new THREE.Mesh(
  new THREE.BoxGeometry(1.25, 4.8, 0.05),
  doorMaterial
);

leftDoor.position.set(9.35, 2.5, -6.25);

// RIGHT DOOR
const rightDoor = new THREE.Mesh(
  new THREE.BoxGeometry(1.25, 4.8, 0.05),
  doorMaterial
);

rightDoor.position.set(10.65, 2.5, -6.25);

// Add to scene
this.scene.add(leftDoor);
this.scene.add(rightDoor);
const handleMaterial = new THREE.MeshStandardMaterial({
  color: 0xc9c9c9
});

const handle1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.06),
  handleMaterial
);

handle1.position.set(8.5, 2.7, -7.2);

const handle2 = handle1.clone();
handle2.position.set(10.2, 2.5, -6.2);

this.scene.add(handle1);
this.scene.add(handle2);
// Right wall
this.curtain.position.set(
  9.8,
  5.2,
  0
);

this.curtain.rotation.y = -Math.PI / 2;

this.curtain.castShadow = true;
this.curtain.receiveShadow = true;

this.scene.add(this.curtain);

this.curtain.geometry.computeVertexNormals();
fanGroup.position.set(0, 9.8, 0);

this.scene.add(fanGroup);
this.fanGroup = fanGroup;

  }

animate = () => {

  requestAnimationFrame(this.animate);
if (this.fanGroup) {
  this.fanGroup.rotation.y += this.fanSpeed;
}


const time = Date.now() * 0.003;

const positions =
  this.curtain.geometry.attributes['position'];

for (let i = 0; i < positions.count; i++) {

  const x =
    this.originalCurtainPositions[i * 3];

  const y =
    this.originalCurtainPositions[i * 3 + 1];

  const z =
    this.originalCurtainPositions[i * 3 + 2];

  // Top fixed, bottom moves more
  const influence =
    Math.max(0, (2.5 - y) / 5);

  const wave =
    Math.sin(time + y * 2) *
    influence *
    this.fanSpeed *
    0.8;

  positions.setXYZ(
    i,
    x,
    y,
    z + wave
  );
}

positions.needsUpdate = true;
this.curtain.geometry.computeVertexNormals();

positions.needsUpdate = true;
 this.controls.target.set(0, 8, 0);
this.controls.update();

  this.renderer.render(
    this.scene,
    this.camera
  );
};
scrollToScene() {
  const el = document.getElementById('scene');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}


toggleLight(): void {
  this.lightToggleCount++;

  this.isLightOn = this.lightToggleCount % 2 !== 0;

  if (this.isLightOn) {
    this.ambientLight.intensity = 2;
    this.directionalLight.intensity = 2;
    this.scene.background = new THREE.Color(0xf4f4f4);
  } else {
    this.ambientLight.intensity = 0.2;
    this.directionalLight.intensity = 0.1;
    this.scene.background = new THREE.Color(0x111111);
  }
}

}
