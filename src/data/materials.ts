import { MaterialOption } from '../types/furniture';

export const MATERIAL_OPTIONS: MaterialOption[] = [
  {
    id: 'fabric-grey',
    name: 'Grey Fabric',
    color: '#8B8B8B',
    priceModifier: 0,
    type: 'fabric',
  },
  {
    id: 'fabric-beige',
    name: 'Beige Fabric',
    color: '#D4C5B9',
    priceModifier: 25,
    type: 'fabric',
  },
  {
    id: 'fabric-navy',
    name: 'Navy Fabric',
    color: '#2C3E50',
    priceModifier: 30,
    type: 'fabric',
  },
  {
    id: 'leather-brown',
    name: 'Brown Leather',
    color: '#8B4513',
    priceModifier: 150,
    type: 'leather',
  },
  {
    id: 'leather-black',
    name: 'Black Leather',
    color: '#1a1a1a',
    priceModifier: 180,
    type: 'leather',
  },
  {
    id: 'velvet-emerald',
    name: 'Emerald Velvet',
    color: '#50C878',
    priceModifier: 100,
    type: 'velvet',
  },
  {
    id: 'velvet-burgundy',
    name: 'Burgundy Velvet',
    color: '#800020',
    priceModifier: 120,
    type: 'velvet',
  },
];
