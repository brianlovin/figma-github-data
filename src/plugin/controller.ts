import populateSelectionWithData from './dataPopulator';

async function main() {
  const dataPopulatorVariableString = await 
    figma.clientStorage.getAsync('dataPopulatorVariableString')

  figma.showUI(__html__, { width: 400, height: 108 });
  figma.ui.postMessage({
    dataPopulatorVariableString,
  });

  figma.ui.onmessage = msg => {
    const { event, key, value } = msg;
    switch (event) {
      case 'STORE_KEY_VALUE':
        return figma.clientStorage.setAsync(key, value);
      case 'INIT_DATA_POPULATOR':
        return populateSelectionWithData(value);
    }
  };
}

main();
