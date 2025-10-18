export interface ConnectionPoint {
  side: 'left' | 'right' | 'front' | 'back';
  position: { x: number; y: number; z: number };
  occupied: boolean;
}

export interface ModuleType {
  id: string;
  name: string;
  basePrice: number;
  dimensions: { width: number; height: number; depth: number };
  connectionRules: {
    left: boolean;
    right: boolean;
    front: boolean;
    back: boolean;
  };
  blocksConnections?: ('left' | 'right' | 'front' | 'back')[];
}

export interface MaterialOption {
  id: string;
  name: string;
  textureUrl?: string;
  color: string;
  priceModifier: number;
  type: 'fabric' | 'leather' | 'velvet';
}

export interface PlacedModule {
  id: string;
  moduleTypeId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  materialId: string;
  connectionPoints: ConnectionPoint[];
}

export interface Configuration {
  modules: PlacedModule[];
  totalPrice: number;
}
