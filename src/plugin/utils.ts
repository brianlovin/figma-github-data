import { config } from '../plugin/data';

const validShapeTypes = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'];
export function isShapeNode(node) {
  return validShapeTypes.indexOf(node.type) >= 0;
}

export function isTextNode(node) {
  return node.type === 'TEXT';
}

export function isFrameNode(node: SceneNode): boolean {
  return node.type === 'FRAME';
}

export function isComponentOrInstance(node: SceneNode): boolean {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

export function isFramelikeNode(node: SceneNode): boolean {
  return isFrameNode(node) || isComponentOrInstance(node);
}

export function selectionContainsSettableLayers(selection) {
  return selection.some((node) => node.name.startsWith(config.settable));
}

export function getRandomElementFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function containsSettableLayers(nodes: SceneNode[]): boolean {
  let hasSettableLayer = false;
  for (const node of nodes) {
    if (isFramelikeNode(node)) {
      hasSettableLayer = hasSettableLayer || containsSettableLayers((node as any).children);
    } else if (isTextNode(node)) {
      hasSettableLayer = hasSettableLayer || node.name.startsWith(config.settable);
    }
  }
  return hasSettableLayer;
}

export function* walkTree(node) {
  yield node;
  const children = node.children;
  if (children) {
    for (const child of children) {
      yield* walkTree(child);
    }
  }
}
