import { walkTree, isShapeNode, isTextNode } from './utils';
import { config } from './data';

function layerConsumesNestedData(layer) {
  const parts = layer.name.split(' ');
  return parts.some(part => part.includes(config.settable) && part.includes('.'));
}

export function getImageBytesFromUrl(url) {
  figma.ui.postMessage({ type: 'getImageBytes', url });
  return new Promise(res => {
    figma.ui.once('message', value => {
      let data = value as Uint8Array;
      let imageHash = figma.createImage(new Uint8Array(data)).hash;

      const newFill = {
        type: 'IMAGE',
        filters: {
          contrast: 0,
          exposure: 0,
          highlights: 0,
          saturation: 0,
          shadows: 0,
          temperature: 0,
          tint: 0,
        },
        imageHash,
        imageTransform: [[1, 0, 0], [0, 1, 0]],
        opacity: 1,
        scaleMode: 'FILL',
        scalingFactor: 0.5,
        visible: true,
      };

      res([newFill]);
    });
  });
}

// given a layer name like '__organization.avatar_url' return the value
// of the avatar_url in source data
function getValueFromNestedLayerName(layer, data) {
  const clean = layer.name.replace(config.settable, ''); // __foo.bar => foo.bar
  const parts = clean.split('.');

  let sourceData = data;
  let result = '';
  for (let index in parts) {
    const part = parts[index];
    const isLastPart = parseInt(index, 10) === parts.length - 1;
    result = sourceData[part] || '';
    if (isLastPart) return { field: parts[parts.length - 1], value: result };
    sourceData = sourceData[part];
  }

  return { field: parts[parts.length - 1], value: result };
}

export function getRGBFromHex(hex) {
  let defaultColor = { r: 0, g: 0, b: 0 };
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255, // divide by 255 to get as percent
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : defaultColor;
}

function updateTextLayer(layer, update) {
  layer = Object.assign(layer, update);
}

export async function setTextFillFromHex(layer, hex) {
  await figma.loadFontAsync(layer.fontName);
  const color = getRGBFromHex(hex);
  updateTextLayer(layer, { fills: [{ type: 'SOLID', color }] });
}

export function setBackgroundFillFromHex(layer, hex) {
  const color = getRGBFromHex(hex);
  layer.fills = [{ type: 'SOLID', color }];
}

export async function setTextCharactersFromValue(layer, value) {
  if (typeof value === 'number') {
    value = String(value.toLocaleString());
  }

  await figma.loadFontAsync(layer.fontName);
  if (!value || value.length === 0) {
    updateTextLayer(layer, { visible: false });
  } else {
    updateTextLayer(layer, { characters: value, visible: true });
  }
}

export async function setBackgroundFillFromImageUrl(layer, url) {
  layer.fills = await getImageBytesFromUrl(url);
}

export function getColorData() {
  figma.showUI(__html__, { visible: false })
  figma.ui.postMessage({ type: 'getColorData' })
  return new Promise(res => {
    figma.ui.onmessage = resource => {
      return res(resource)
    }
  })
}

async function getHexFromLanguage(language) {
  const colors = await getColorData();
  const colorObject = colors[language];
  return colorObject.color || '#aaa';
}

async function applyLayerTransformationFromField(layer, field, value?, data?) {
  if (field.includes('avatar_url')) {
    if (!isShapeNode(layer)) return;
    await setBackgroundFillFromImageUrl(layer, value);
  }

  if (field.includes('login')) {
    if (!isTextNode(layer)) return;
    await setTextCharactersFromValue(layer, `${value}`);
  }

  if (field.includes('language_color')) {
    const hex = await getHexFromLanguage(data.language);
    if (isShapeNode(layer)) {
      await setBackgroundFillFromHex(layer, hex);
    }

    if (isTextNode(layer)) {
      await setTextFillFromHex(layer, hex);
    }
  }

  if (!isTextNode(layer)) return;
  await setTextCharactersFromValue(layer, value);
}

export default async function transformNodeWithData(node, data) {
  let walker = walkTree(node);
  let settableLayers = [];
  let res;

  while (!(res = walker.next()).done) {
    let node = res.value;
    if (node.name.startsWith(config.settable)) {
      settableLayers.push(node);
    }
  }

  if (!settableLayers) figma.notify('No layers are prefixed with __ in order to set data');

  for (let layer of settableLayers) {
    if (layerConsumesNestedData(layer)) {
      const { field, value } = getValueFromNestedLayerName(layer, data);
      await applyLayerTransformationFromField(layer, field, value);
    } else {
      const field = layer.name.replace(config.settable, '');
      if (data.hasOwnProperty(field)) {
        const value = data[field];
        await applyLayerTransformationFromField(layer, field, value, data);
      }
    }
  }

  return;
}
