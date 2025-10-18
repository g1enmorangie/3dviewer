import { useState, useCallback } from 'react';
import { PlacedModule, ModuleType, MaterialOption, ConnectionPoint } from '../types/furniture';

export function useFurnitureConfig(
  moduleTypes: ModuleType[],
  materials: MaterialOption[]
) {
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(materials[0]?.id || '');

  const generateConnectionPoints = (
    moduleType: ModuleType,
    position: { x: number; y: number; z: number },
    rotation: number
  ): ConnectionPoint[] => {
    const points: ConnectionPoint[] = [];
    const { width, depth } = moduleType.dimensions;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    if (moduleType.connectionRules.left) {
      const localX = -width / 2 - 0.1;
      points.push({
        side: 'left',
        position: {
          x: position.x + localX * cos,
          y: position.y,
          z: position.z + localX * sin,
        },
        occupied: false,
      });
    }

    if (moduleType.connectionRules.right) {
      const localX = width / 2 + 0.1;
      points.push({
        side: 'right',
        position: {
          x: position.x + localX * cos,
          y: position.y,
          z: position.z + localX * sin,
        },
        occupied: false,
      });
    }

    if (moduleType.connectionRules.front) {
      const localZ = depth / 2 + 0.1;
      points.push({
        side: 'front',
        position: {
          x: position.x - localZ * sin,
          y: position.y,
          z: position.z + localZ * cos,
        },
        occupied: false,
      });
    }

    if (moduleType.connectionRules.back) {
      const localZ = -depth / 2 - 0.1;
      points.push({
        side: 'back',
        position: {
          x: position.x - localZ * sin,
          y: position.y,
          z: position.z + localZ * cos,
        },
        occupied: false,
      });
    }

    return points;
  };

  const findNearestConnectionPoint = (
    targetPosition: { x: number; y: number; z: number }
  ): { moduleId: string; point: ConnectionPoint; index: number } | null => {
    let nearest: { moduleId: string; point: ConnectionPoint; index: number; distance: number } | null = null;

    placedModules.forEach((module) => {
      module.connectionPoints.forEach((point, index) => {
        if (point.occupied) return;

        const distance = Math.sqrt(
          Math.pow(point.position.x - targetPosition.x, 2) +
          Math.pow(point.position.z - targetPosition.z, 2)
        );

        if (distance < 0.2 && (!nearest || distance < nearest.distance)) {
          nearest = { moduleId: module.id, point, index, distance };
        }
      });
    });

    return nearest ? { moduleId: nearest.moduleId, point: nearest.point, index: nearest.index } : null;
  };

  const addModule = useCallback(
    (moduleTypeId: string, snapToExisting: boolean = true) => {
      const moduleType = moduleTypes.find(t => t.id === moduleTypeId);
      if (!moduleType) return;

      let position = { x: 0, y: 0, z: 0 };
      let rotation = 0;

      if (placedModules.length > 0 && snapToExisting) {
        const lastModule = placedModules[placedModules.length - 1];
        const lastModuleType = moduleTypes.find(t => t.id === lastModule.moduleTypeId);

        if (lastModuleType) {
          const availablePoint = lastModule.connectionPoints.find(p => !p.occupied);

          if (availablePoint) {
            position = { ...availablePoint.position };
            rotation = lastModule.rotation;

            if (availablePoint.side === 'right') {
              position.x += moduleType.dimensions.width / 2;
            } else if (availablePoint.side === 'left') {
              position.x -= moduleType.dimensions.width / 2;
            } else if (availablePoint.side === 'front') {
              position.z += moduleType.dimensions.depth / 2;
            } else if (availablePoint.side === 'back') {
              position.z -= moduleType.dimensions.depth / 2;
            }
          } else {
            position.x = lastModule.position.x + lastModuleType.dimensions.width + moduleType.dimensions.width / 2 + 0.1;
            position.z = lastModule.position.z;
          }
        }
      }

      const newModule: PlacedModule = {
        id: `module-${Date.now()}-${Math.random()}`,
        moduleTypeId,
        position,
        rotation,
        materialId: selectedMaterialId,
        connectionPoints: generateConnectionPoints(moduleType, position, rotation),
      };

      setPlacedModules(prev => {
        const updated = [...prev, newModule];

        if (snapToExisting && prev.length > 0) {
          const nearest = findNearestConnectionPoint(position);
          if (nearest) {
            const connectedModule = updated.find(m => m.id === nearest.moduleId);
            if (connectedModule) {
              connectedModule.connectionPoints[nearest.index].occupied = true;

              if (moduleType.blocksConnections) {
                moduleType.blocksConnections.forEach(side => {
                  const pointToBlock = connectedModule.connectionPoints.find(p => p.side === side);
                  if (pointToBlock) {
                    pointToBlock.occupied = true;
                  }
                });
              }
            }
          }
        }

        return updated;
      });
    },
    [moduleTypes, placedModules, selectedMaterialId]
  );

  const removeModule = useCallback((moduleId: string) => {
    setPlacedModules(prev => {
      const moduleToRemove = prev.find(m => m.id === moduleId);
      if (!moduleToRemove) return prev;

      const updated = prev.filter(m => m.id !== moduleId);

      updated.forEach(module => {
        module.connectionPoints.forEach(point => {
          const distance = Math.sqrt(
            Math.pow(point.position.x - moduleToRemove.position.x, 2) +
            Math.pow(point.position.z - moduleToRemove.position.z, 2)
          );
          if (distance < 0.3) {
            point.occupied = false;
          }
        });
      });

      return updated;
    });
  }, []);

  const updateModuleMaterial = useCallback((moduleId: string, materialId: string) => {
    setPlacedModules(prev =>
      prev.map(m => (m.id === moduleId ? { ...m, materialId } : m))
    );
  }, []);

  const updateAllMaterials = useCallback((materialId: string) => {
    setPlacedModules(prev =>
      prev.map(m => ({ ...m, materialId }))
    );
    setSelectedMaterialId(materialId);
  }, []);

  const calculateTotalPrice = useCallback(() => {
    let total = 0;

    placedModules.forEach(module => {
      const moduleType = moduleTypes.find(t => t.id === module.moduleTypeId);
      const material = materials.find(m => m.id === module.materialId);

      if (moduleType && material) {
        total += moduleType.basePrice + material.priceModifier;
      }
    });

    return total;
  }, [placedModules, moduleTypes, materials]);

  const getModuleBreakdown = useCallback(() => {
    const breakdown: { [key: string]: { count: number; price: number; name: string } } = {};

    placedModules.forEach(module => {
      const moduleType = moduleTypes.find(t => t.id === module.moduleTypeId);
      if (!moduleType) return;

      if (!breakdown[module.moduleTypeId]) {
        breakdown[module.moduleTypeId] = {
          count: 0,
          price: moduleType.basePrice,
          name: moduleType.name,
        };
      }
      breakdown[module.moduleTypeId].count++;
    });

    return Object.values(breakdown);
  }, [placedModules, moduleTypes]);

  const clearConfiguration = useCallback(() => {
    setPlacedModules([]);
  }, []);

  return {
    placedModules,
    selectedMaterialId,
    setSelectedMaterialId,
    addModule,
    removeModule,
    updateModuleMaterial,
    updateAllMaterials,
    calculateTotalPrice,
    getModuleBreakdown,
    clearConfiguration,
  };
}
