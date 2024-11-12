import { FC, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Stats,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import { Leva, useControls } from 'leva';
import { Color, Mesh, Object3D, Scene } from 'three';
import SceneModel from './SceneModel/SceneModel';
import './App.scss';

const App: FC = () => {
  const [loading, setLoading] = useState(true);
  const sceneRef = useRef<Scene>(null);

  const Environments = [
    { label: 'Allemagne nuit', path: './models/hansaplatz_2k.hdr' },
    { label: 'Shanghai soirée', path: './models/shanghai_bund_2k.hdr' },
    { label: 'Allemagne soir', path: './models/rathaus_2k.hdr' },
    { label: 'Médiéval jour', path: './models/medieval_cafe_2k.hdr' },
    { label: 'Pur ciel', path: './models/kloppenheim_02_puresky_2k.hdr' },
    { label: 'Grèce jour', path: './models/rhodes_memorial_2k.hdr' },
    { label: 'Parc jour', path: './models/rooitou_park_2k.hdr' },
    { label: 'Port jour', path: './models/simons_town_harbour_2k.hdr' },
    { label: 'Ciel en feu', path: './models/the_sky_is_on_fire_2k.hdr' },
    {
      label: 'Venise coucher de soleil',
      path: './models/venice_sunrise_2k.hdr',
    },
  ];

  const { environment: environmentLabel } = useControls('Controles', {
    environment: {
      label: 'Environnement',
      value: Environments[1].label, // Default value
      options: Environments.map(({ label }) => label), // Dropdown options
    },
    showScene: {
      label: 'afficher la scène',
      value: true,
      onChange: (showScene) => {
        if (sceneRef.current) {
          const sceneModel = sceneRef.current.children[0];
          if (sceneModel instanceof Object3D) {
            sceneModel.visible = showScene;
          } else {
            console.warn('The object is not a Mesh');
          }
        }
      },
    },
    rotationY: {
      label: 'Rotation de la scène',
      value: 0, // Default rotation value
      min: -Math.PI, // Minimum rotation (in radians)
      max: Math.PI, // Maximum rotation (in radians)
      step: 0.01, // Step size for rotation
      onChange: (rotationYValue) => {
        if (sceneRef.current && sceneRef.current.rotation)
          sceneRef.current.rotation.y = rotationYValue;
      },
    },
    color: {
      label: 'Couleur du véhicule',
      value: 'white',
      onChange: (color) => {
        if (sceneRef.current) {
          const vehicleBody =
            sceneRef.current.children[1]?.children[7]?.children[0];
          const vehicleDoors =
            sceneRef.current.children[1]?.children[9]?.children[0];

          // Check if the object is a Mesh
          if (vehicleBody instanceof Mesh && vehicleDoors instanceof Mesh) {
            const vehicleColor = new Color(color);
            vehicleBody.material.color = vehicleColor;
            vehicleDoors.material.color = vehicleColor;
          } else {
            console.warn('The object is not a Mesh');
          }
        }
      },
    },
    glass: {
      label: 'Transparence des vitres',
      value: 0.66, // Default
      min: 0.1,
      max: 1,
      step: 0.01,
      onChange: async (opacity) => {
        if (sceneRef.current) {
          const vehicleGlasses =
            sceneRef.current.children[1]?.children[7]?.children[1];

          // Check if the object is a Mesh
          if (vehicleGlasses instanceof Mesh) {
            vehicleGlasses.material.transparent = true;
            vehicleGlasses.material.opacity = opacity;
          } else {
            console.warn('The object is not a Mesh');
          }
        }
      },
    },
  });

  // console.log({ sceneRef });

  // Plane 002 is the car outside
  // 0: Carosserie avant arrière du vehicule
  // 1: les vitres du vehicule
  // 2: jantes vitrines
  // 3: le bas du vehicule
  // 4: intereur

  // Plane 007 doors
  // 0: doors

  // this useEffect is to fix and adjust the exported scene from blender to three JS
  useEffect(() => {
    if (sceneRef.current && !loading) {
      // to avoid conflict between contact shadow and ground
      sceneRef.current.children[0]?.children[11]?.children[0]?.position.set(
        0,
        -0.0001,
        0
      );
      const tireMarkings =
        sceneRef.current.children[1]?.children[34]?.children[1];
      const vehicleGlasses =
        sceneRef.current.children[1]?.children[7]?.children[1];
      if (vehicleGlasses instanceof Mesh && tireMarkings instanceof Mesh) {
        vehicleGlasses.material.transparent = true;
        vehicleGlasses.material.opacity = 0.66;
        tireMarkings.material.normalMap = null;
        tireMarkings.material.roughness = 0.6;
      }
    }
  }, [loading]);

  return (
    <>
      {loading && (
        <div className="loader">
          <h1>Loading...</h1>
        </div>
      )}
      <Canvas
        camera={{ position: [-5.896, 5.293, 15.936] }}
        onCreated={() => setLoading(false)}
      >
        <Environment
          files={
            Environments.find(({ label }) => label === environmentLabel)?.path
          }
          background
          ground={{
            height: 12,
            radius: 115,
            scale: 250,
          }}
        />
        <ContactShadows scale={35} blur={6} />
        <SceneModel ref={sceneRef} />
        <OrbitControls
          target={[0, 1, 0]}
          minPolarAngle={0} // Minimum vertical angle in radians (0 radians = looking straight ahead)
          maxPolarAngle={Math.PI / 2} // Maximum vertical angle in radians (PI/2 radians = looking straight down)
          minDistance={8} // Minimum zoom distance
          maxDistance={22} // Maximum zoom distance
        />
        <Stats />
      </Canvas>
      <Leva collapsed oneLineLabels />
    </>
  );
};

export default App;
