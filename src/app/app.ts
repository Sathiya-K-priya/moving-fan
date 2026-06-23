import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
 
  @ViewChild('rendererContainer', { static: true })
  rendererContainer!: ElementRef<HTMLDivElement>;

  speed = 0.08;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
private ambientLight!: THREE.AmbientLight;
private directionalLight!: THREE.DirectionalLight;
  private bladeGroup!: THREE.Group;

  ngAfterViewInit(): void {
    this.createScene();
    this.animate();
  }

  createScene(): void {

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf4f4f4);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.camera.position.set(0, -0.8, 8);
    this.camera.lookAt(4, 0, -1);

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

    // Lights
this.ambientLight = new THREE.AmbientLight(0xffffff, 2);
this.scene.add(this.ambientLight);

this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
this.directionalLight.position.set(5, 8, 5);
this.scene.add(this.directionalLight);

    // Ceiling

    const ceiling =
      new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        })
      );

    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3;

    this.scene.add(ceiling);

    // Back Wall

    const backWall =
      new THREE.Mesh(
        new THREE.PlaneGeometry(20, 8),
        new THREE.MeshStandardMaterial({
          color: 0xf5f5f5
        })
      );

    backWall.position.set(
      0,
      -1,
      -5
    );

    this.scene.add(backWall);

    // Right Wall

    const rightWall =
      new THREE.Mesh(
        new THREE.PlaneGeometry(10, 8),
        new THREE.MeshStandardMaterial({
          color: 0xf0f0f0,
          side: THREE.DoubleSide
        })
      );

    rightWall.rotation.y =
      -Math.PI / 2;

    rightWall.position.set(
      10,
      -1,
      0
    );

    this.scene.add(rightWall);

    // Curtain

    const curtainGeo =
      new THREE.PlaneGeometry(
        8,
        4.5,
        100,
        100
      );

    const pos =
      curtainGeo.attributes[
        'position'
      ] as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {

      const x = pos.getX(i);
      const y = pos.getY(i);

      let z =
        Math.sin(x * 8) * 0.22;

      if (y < -1.7) {
        z +=
          Math.sin(x * 2) * 0.5;
      }

      pos.setZ(i, z);
    }

    curtainGeo.computeVertexNormals();

    const curtain =
      new THREE.Mesh(
        curtainGeo,
        new THREE.MeshStandardMaterial({
          color: 0x8b0015,
          side: THREE.DoubleSide
        })
      );

    curtain.rotation.y =
      -Math.PI / 2;

    curtain.position.set(
      9.7,
      0.7,
      -1
    );

    this.scene.add(curtain);

    // Curtain Rod

    const rod =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.04,
          0.04,
          8.5,
          24
        ),
        new THREE.MeshStandardMaterial({
          color: 0x999999
        })
      );

    rod.rotation.z =
      Math.PI / 2;

    rod.rotation.y =
      -Math.PI / 2;

    rod.position.set(
      9.92,
      2.9,
      -1
    );

    this.scene.add(rod);

    // Cupboard

    const cupboard =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          2.2,
          4.2,
          1.2
        ),
        new THREE.MeshStandardMaterial({
          color: 0x667284
        })
      );

    cupboard.position.set(
      8.4,
      -2.2,
      0.7
    );

    this.scene.add(cupboard);

    // Fan

    const fanGroup =
      new THREE.Group();

    fanGroup.position.set(
      -2,
      2.2,
      0
    );

    this.scene.add(fanGroup);

    const fanRod =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.03,
          0.03,
          1.2,
          16
        ),
        new THREE.MeshStandardMaterial({
          color: 0x444444
        })
      );

    fanRod.position.y = 0.6;

    fanGroup.add(fanRod);

    const motor =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.25,
          0.25,
          0.35,
          32
        ),
        new THREE.MeshStandardMaterial({
          color: 0x444444
        })
      );

    fanGroup.add(motor);

    this.bladeGroup =
      new THREE.Group();

    fanGroup.add(
      this.bladeGroup
    );

    for (let i = 0; i < 3; i++) {

      const holder =
        new THREE.Group();

      holder.rotation.y =
        i * Math.PI * 2 / 3;

      const blade =
        new THREE.Mesh(
          new THREE.BoxGeometry(
            2.8,
            0.03,
            0.22
          ),
          new THREE.MeshStandardMaterial({
            color: 0x111111
          })
        );

      blade.position.x =
        1.4;

      holder.add(blade);

      this.bladeGroup.add(
        holder
      );
    }

    window.addEventListener(
      'resize',
      () => {

        this.camera.aspect =
          window.innerWidth /
          window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
          window.innerWidth,
          window.innerHeight
        );
      }
    );
  }

  animate = () => {

    requestAnimationFrame(
      this.animate
    );

    this.bladeGroup.rotation.y +=
      this.speed;

    this.renderer.render(
      this.scene,
      this.camera
    );
  };
}
