import { ModuleType } from '../types/furniture';

export const MODULE_TYPES: ModuleType[] = [
  {
    id: 'base-seat',
    name: 'Base Seat',
    basePrice: 250,
    dimensions: { width: 1, height: 0.5, depth: 1 },
    connectionRules: {
      left: true,
      right: true,
      front: false,
      back: false,
    },
  },
  {
    id: 'corner',
    name: 'Corner Module',
    basePrice: 300,
    dimensions: { width: 1, height: 0.5, depth: 1 },
    connectionRules: {
      left: true,
      right: true,
      front: true,
      back: false,
    },
  },
  {
    id: 'side-arm',
    name: 'Side Arm',
    basePrice: 150,
    dimensions: { width: 0.2, height: 0.7, depth: 1 },
    connectionRules: {
      left: true,
      right: false,
      front: false,
      back: false,
    },
    blocksConnections: ['right'],
  },
  {
    id: 'ottoman',
    name: 'Ottoman',
    basePrice: 200,
    dimensions: { width: 0.8, height: 0.4, depth: 0.8 },
    connectionRules: {
      left: false,
      right: false,
      front: false,
      back: false,
    },
  },
  {
    id: 'chaise',
    name: 'Chaise Lounge',
    basePrice: 400,
    dimensions: { width: 1, height: 0.5, depth: 1.5 },
    connectionRules: {
      left: true,
      right: true,
      front: false,
      back: false,
    },
  },
];
