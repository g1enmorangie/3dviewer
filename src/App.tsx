import { useState, useEffect } from 'react';
import BabylonScene from './components/BabylonScene';
import ConfigPanel from './components/ConfigPanel';
import { useFurnitureConfig } from './hooks/useFurnitureConfig';
import { MODULE_TYPES } from './data/moduleTypes';
import { MATERIAL_OPTIONS } from './data/materials';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const {
    placedModules,
    selectedMaterialId,
    setSelectedMaterialId,
    addModule,
    removeModule,
    updateAllMaterials,
    calculateTotalPrice,
    getModuleBreakdown,
    clearConfiguration,
  } = useFurnitureConfig(MODULE_TYPES, MATERIAL_OPTIONS);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
    updateAllMaterials(materialId);
  };

  const handleModuleClick = (moduleId: string) => {
    removeModule(moduleId);
  };

  const moduleBreakdown = getModuleBreakdown();
  const totalPrice = calculateTotalPrice();

  const materialBreakdown = placedModules.reduce((acc, module) => {
    acc[module.materialId] = (acc[module.materialId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading 3D Configurator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <BabylonScene
            placedModules={placedModules}
            moduleTypes={MODULE_TYPES}
            materials={MATERIAL_OPTIONS}
            onModuleClick={handleModuleClick}
          />
        </div>
        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Controls</h2>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• Left click + drag to rotate</li>
            <li>• Right click + drag to pan</li>
            <li>• Scroll to zoom</li>
            <li>• Click module to remove</li>
          </ul>
        </div>
      </div>

      <div className="w-96 shadow-2xl overflow-hidden flex flex-col">
        <ConfigPanel
          moduleTypes={MODULE_TYPES}
          materials={MATERIAL_OPTIONS}
          selectedMaterialId={selectedMaterialId}
          onMaterialSelect={handleMaterialSelect}
          onAddModule={addModule}
          onClearAll={clearConfiguration}
          moduleBreakdown={moduleBreakdown}
          totalPrice={totalPrice}
          materialBreakdown={materialBreakdown}
        />
      </div>
    </div>
  );
}

export default App;
