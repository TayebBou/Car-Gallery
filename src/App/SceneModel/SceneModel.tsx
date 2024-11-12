import { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

const SceneModel = forwardRef((props, ref) => {
  // Load the GLTF scene model
  const { scene } = useGLTF('/models/scene.glb') || {};

  return (
    <primitive
      object={scene}
      ref={ref} // Forward the ref to the primitive component
      {...props} // Spread any additional props onto the primitive component
    />
  );
});

export default SceneModel;
