import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock useGLTF hook
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Stats: () => null,
  Environment: () => null,
  ContactShadows: () => null,
  // You can mock useGLTF if it's actually used in SceneModel, but it's not used directly in App
  useGLTF: jest.fn(() => ({
    scene: {
      traverse: jest.fn((fn: (object: any) => void) => {
        // Mock a simple object with the traverse method
        const mockObject = {
          isMesh: true,
          name: 'SomeMesh',
          castShadow: false,
          receiveShadow: false,
        };
        fn(mockObject);
      }),
    },
  })),
}));

// Mock Canvas to prevent issues during tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    onCreated,
  }: {
    children: React.ReactNode;
    onCreated: () => void;
  }) => {
    // Call onCreated callback directly for testing
    if (onCreated) onCreated();
    return <>{children}</>;
  },
}));

describe('App Component', () => {
  test('renders the App component and its elements', () => {
    const { container } = render(<App />);

    // Verify Canvas is rendered
    expect(container).toMatchSnapshot();
  });

  test('uses the useGLTF hook', () => {
    const { useGLTF } = require('@react-three/drei');
    const useGLTFMock = useGLTF as jest.Mock;

    render(<App />);

    // Check if useGLTF is called with the correct argument
    expect(useGLTFMock).toHaveBeenCalledWith('/models/scene.glb');
  });
});
