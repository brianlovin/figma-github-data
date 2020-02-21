import { config } from '../plugin/data'

const validShapeTypes = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'];
export function isShapeNode(node) {
  return validShapeTypes.indexOf(node.type) >= 0;
}

export function isTextNode(node) {
  return node.type === 'TEXT';
}

export function isFrameNode(node) {
  return node.type === 'FRAME';
}

export function isComponentOrInstance(node) {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

export function isFramelikeNode(node) {
  return isFrameNode(node) || isComponentOrInstance(node)
}

export function selectionContainsSettableLayers(selection) {
  return selection.some(node => node.name.startsWith(config.settable))
}

export function getRandomElementFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function* walkTree(node) {
  yield node;
  let children = node.children;
  if (children) {
    for (let child of children) {
      yield* walkTree(child);
    }
  }
}
