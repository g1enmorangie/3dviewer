import { ModuleType, MaterialOption } from '../types/furniture';
import { ShoppingCart, Plus, Trash2, Package } from 'lucide-react';

interface ConfigPanelProps {
  moduleTypes: ModuleType[];
  materials: MaterialOption[];
  selectedMaterialId: string;
  onMaterialSelect: (materialId: string) => void;
  onAddModule: (moduleTypeId: string) => void;
  onClearAll: () => void;
  moduleBreakdown: { count: number; price: number; name: string }[];
  totalPrice: number;
  materialBreakdown: { [key: string]: number };
}

export default function ConfigPanel({
  moduleTypes,
  materials,
  selectedMaterialId,
  onMaterialSelect,
  onAddModule,
  onClearAll,
  moduleBreakdown,
  totalPrice,
  materialBreakdown,
}: ConfigPanelProps) {
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Furniture Configurator</h1>
        <p className="text-sm text-gray-600 mt-1">Build your custom modular furniture</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {materials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => onMaterialSelect(material.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMaterialId === material.id
                      ? 'border-gray-900 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div
                    className="w-full h-16 rounded-md mb-2 shadow-inner"
                    style={{ backgroundColor: material.color }}
                  />
                  <div className="text-sm font-medium text-gray-900">{material.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {material.priceModifier > 0 ? `+$${material.priceModifier}` : 'Base'}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Modules</h2>
            </div>
            <div className="space-y-3">
              {moduleTypes.map((moduleType) => (
                <button
                  key={moduleType.id}
                  onClick={() => onAddModule(moduleType.id)}
                  className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-gray-900 hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                      <Package className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{moduleType.name}</div>
                      <div className="text-sm text-gray-600">${moduleType.basePrice}</div>
                    </div>
                  </div>
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </button>
              ))}
            </div>
          </section>

          {moduleBreakdown.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                <button
                  onClick={onClearAll}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {moduleBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} ×{item.count}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${item.price * item.count}
                    </span>
                  </div>
                ))}
                {selectedMaterial && selectedMaterial.priceModifier > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-700">
                      Material: {selectedMaterial.name}
                    </span>
                    <span className="font-medium text-gray-900">
                      +${selectedMaterial.priceModifier * moduleBreakdown.reduce((acc, item) => acc + item.count, 0)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-gray-300 mt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">${totalPrice}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          disabled={moduleBreakdown.length === 0}
          className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart - ${totalPrice}
        </button>
        <p className="text-xs text-gray-600 text-center mt-3">
          Click modules in 3D view to remove them
        </p>
      </div>
    </div>
  );
}
