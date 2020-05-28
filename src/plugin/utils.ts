import { config } from '../plugin/data';

const validShapeTypes = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'BOOLEAN_OPERATION'];
export function isValidShapeNode(node: SceneNode): boolean {
  return validShapeTypes.indexOf(node.type) >= 0;
}

export function isTextNode(node: SceneNode): boolean {
  return node.type === 'TEXT';
}

export function isSettableNode(node: SceneNode): boolean {
  return (isTextNode(node) || isValidShapeNode(node)) && node.name.startsWith(config.settable);
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
    } else if (isSettableNode(node)) {
      hasSettableLayer = true;
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

const getSettableProperties = (node: SceneNode): string[] => {
  let properties: string[] = [];
  if (isFramelikeNode(node)) {
    const frame = node as FrameNode;
    for (const child of frame.children) {
      properties = properties.concat(getSettableProperties(child));
    }
  } else if (isSettableNode(node)) {
    properties.push(node.name);
  }
  return properties;
};

export const childrenAreUsingDifferentProperties = (nodes: readonly SceneNode[]): boolean => {
  const propertiesUsed: string[] = [];
  for (const node of nodes) {
    const properties = getSettableProperties(node);
    for (const prop of properties) {
      if (propertiesUsed.includes(prop)) {
        return false;
      }
      propertiesUsed.push(prop);
    }
  }
  return true;
};
