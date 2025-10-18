import { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, Color4, DirectionalLight, ShadowGenerator, Mesh, GroundMesh, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { PlacedModule, ModuleType, MaterialOption } from '../types/furniture';

interface BabylonSceneProps {
  placedModules: PlacedModule[];
  moduleTypes: ModuleType[];
  materials: MaterialOption[];
  onModuleClick?: (moduleId: string) => void;
  hoveredConnectionPoint?: { position: Vector3; canConnect: boolean } | null;
}

export default function BabylonScene({
  placedModules,
  moduleTypes,
  materials,
  onModuleClick,
  hoveredConnectionPoint
}: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const moduleMeshesRef = useRef<Map<string, Mesh>>(new Map());
  const connectionIndicatorRef = useRef<Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.98, 0.98, 0.99, 1);
    scene.ambientColor = new Color3(0.3, 0.3, 0.35);
    sceneRef.current = scene;

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 4,
      Math.PI / 3,
      8,
      new Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 15;
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = Math.PI / 2.1;
    camera.wheelPrecision = 50;

    const ambientLight = new HemisphericLight(
      'ambientLight',
      new Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 0.6;
    ambientLight.groundColor = new Color3(0.3, 0.3, 0.35);

    const mainLight = new DirectionalLight(
      'mainLight',
      new Vector3(-1, -2, -1),
      scene
    );
    mainLight.position = new Vector3(5, 10, 5);
    mainLight.intensity = 0.8;

    const fillLight = new DirectionalLight(
      'fillLight',
      new Vector3(1, -1, 1),
      scene
    );
    fillLight.position = new Vector3(-5, 5, -5);
    fillLight.intensity = 0.3;

    const shadowGenerator = new ShadowGenerator(2048, mainLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;
    shadowGenerator.darkness = 0.3;

    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: 20, height: 20 },
      scene
    ) as GroundMesh;
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new Color3(1, 1, 1);
    groundMaterial.specularColor = new Color3(0.05, 0.05, 0.05);
    groundMaterial.specularPower = 64;
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.position.y = -0.01;

    const gridSize = 20;
    const gridDivisions = 40;
    const gridColor = new Color3(0.85, 0.85, 0.87);

    for (let i = 0; i <= gridDivisions; i++) {
      const pos = -gridSize / 2 + (i * gridSize) / gridDivisions;

      const lineX = MeshBuilder.CreateLines(
        `gridLineX${i}`,
        {
          points: [
            new Vector3(pos, 0.001, -gridSize / 2),
            new Vector3(pos, 0.001, gridSize / 2),
          ],
        },
        scene
      );
      lineX.color = gridColor;
      lineX.alpha = 0.3;

      const lineZ = MeshBuilder.CreateLines(
        `gridLineZ${i}`,
        {
          points: [
            new Vector3(-gridSize / 2, 0.001, pos),
            new Vector3(gridSize / 2, 0.001, pos),
          ],
        },
        scene
      );
      lineZ.color = gridColor;
      lineZ.alpha = 0.3;
    }

    const connectionIndicator = MeshBuilder.CreateSphere(
      'connectionIndicator',
      { diameter: 0.15, segments: 16 },
      scene
    );
    const indicatorMaterial = new StandardMaterial('indicatorMaterial', scene);
    indicatorMaterial.emissiveColor = new Color3(0.2, 0.8, 0.3);
    indicatorMaterial.alpha = 0.8;
    connectionIndicator.material = indicatorMaterial;
    connectionIndicator.isVisible = false;
    connectionIndicatorRef.current = connectionIndicator;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const currentMeshes = moduleMeshesRef.current;
    const newMeshIds = new Set(placedModules.map(m => m.id));

    currentMeshes.forEach((mesh, id) => {
      if (!newMeshIds.has(id)) {
        mesh.dispose();
        currentMeshes.delete(id);
      }
    });

    placedModules.forEach((module) => {
      const moduleType = moduleTypes.find(t => t.id === module.moduleTypeId);
      const material = materials.find(m => m.id === module.materialId);
      if (!moduleType || !material) return;

      let mesh = currentMeshes.get(module.id);

      if (!mesh) {
        if (moduleType.id === 'side-arm') {
          mesh = MeshBuilder.CreateBox(
            module.id,
            {
              width: moduleType.dimensions.width,
              height: moduleType.dimensions.height,
              depth: moduleType.dimensions.depth,
            },
            scene
          );
          mesh.enableEdgesRendering();
          mesh.edgesWidth = 2.0;
          mesh.edgesColor = new Color4(0, 0, 0, 0.1);
        } else if (moduleType.id === 'ottoman') {
          mesh = MeshBuilder.CreateBox(
            module.id,
            {
              width: moduleType.dimensions.width,
              height: moduleType.dimensions.height,
              depth: moduleType.dimensions.depth,
            },
            scene
          );
          mesh.enableEdgesRendering();
          mesh.edgesWidth = 2.0;
          mesh.edgesColor = new Color4(0, 0, 0, 0.1);
        } else {
          mesh = MeshBuilder.CreateBox(
            module.id,
            {
              width: moduleType.dimensions.width,
              height: moduleType.dimensions.height,
              depth: moduleType.dimensions.depth,
            },
            scene
          );
          mesh.enableEdgesRendering();
          mesh.edgesWidth = 2.0;
          mesh.edgesColor = new Color4(0, 0, 0, 0.1);

          const backrest = MeshBuilder.CreateBox(
            `${module.id}-backrest`,
            {
              width: moduleType.dimensions.width,
              height: 0.5,
              depth: 0.1,
            },
            scene
          );
          backrest.position.z = -moduleType.dimensions.depth / 2 + 0.05;
          backrest.position.y = moduleType.dimensions.height / 2 + 0.25;
          backrest.parent = mesh;
          backrest.enableEdgesRendering();
          backrest.edgesWidth = 2.0;
          backrest.edgesColor = new Color4(0, 0, 0, 0.1);
        }

        const shadowGenerator = scene.lights.find(
          l => l instanceof DirectionalLight && l.name === 'mainLight'
        ) as DirectionalLight;
        if (shadowGenerator) {
          const sg = scene.meshes.find(
            m => m.metadata?.shadowGenerator
          )?.metadata?.shadowGenerator as ShadowGenerator;
          if (sg) {
            sg.addShadowCaster(mesh);
          } else {
            const newSG = new ShadowGenerator(2048, shadowGenerator);
            newSG.addShadowCaster(mesh);
            mesh.metadata = { shadowGenerator: newSG };
          }
        }

        mesh.receiveShadows = true;
        currentMeshes.set(module.id, mesh);

        if (onModuleClick) {
          mesh.actionManager = new ActionManager(scene);
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(
              ActionManager.OnPickTrigger,
              () => onModuleClick(module.id)
            )
          );
        }
      }

      mesh.position = new Vector3(
        module.position.x,
        module.position.y + moduleType.dimensions.height / 2,
        module.position.z
      );
      mesh.rotation.y = module.rotation;

      const meshMaterial = mesh.material as StandardMaterial || new StandardMaterial(`mat-${module.id}`, scene);
      meshMaterial.diffuseColor = Color3.FromHexString(material.color);
      meshMaterial.ambientColor = Color3.FromHexString(material.color).scale(0.3);

      if (material.type === 'leather') {
        meshMaterial.specularColor = new Color3(0.5, 0.5, 0.5);
        meshMaterial.specularPower = 64;
        meshMaterial.ambientColor = Color3.FromHexString(material.color).scale(0.2);
      } else if (material.type === 'velvet') {
        meshMaterial.specularColor = new Color3(0.15, 0.15, 0.15);
        meshMaterial.specularPower = 4;
        meshMaterial.ambientColor = Color3.FromHexString(material.color).scale(0.4);
      } else {
        meshMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        meshMaterial.specularPower = 16;
      }

      mesh.material = meshMaterial;
    });
  }, [placedModules, moduleTypes, materials, onModuleClick]);

  useEffect(() => {
    if (!connectionIndicatorRef.current) return;

    const indicator = connectionIndicatorRef.current;

    if (hoveredConnectionPoint) {
      indicator.position = hoveredConnectionPoint.position;
      indicator.isVisible = true;

      const material = indicator.material as StandardMaterial;
      if (hoveredConnectionPoint.canConnect) {
        material.emissiveColor = new Color3(0.2, 0.8, 0.3);
      } else {
        material.emissiveColor = new Color3(0.9, 0.2, 0.2);
      }
    } else {
      indicator.isVisible = false;
    }
  }, [hoveredConnectionPoint]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full outline-none"
      style={{ touchAction: 'none' }}
    />
  );
}
