import populateSelectionWithData from './dataPopulator';

async function main() {
  const dataPopulatorVariableString = await figma.clientStorage.getAsync('dataPopulatorVariableString');
  figma.showUI(__html__, { width: 400, height: 148 });
  figma.ui.postMessage({
    dataPopulatorVariableString,
  });

  figma.ui.onmessage = (msg) => {
    const { event, key, value } = msg;
    switch (event) {
      case 'STORE_KEY_VALUE':
        return figma.clientStorage.setAsync(key, value);
      case 'INIT_DATA_POPULATOR':
        return populateSelectionWithData(value);
    }
  };
}

async function runWithParameters({type, variable = ''}: ParameterValues) {
  figma.showUI(__html__, { visible: false })
  try {
    await populateSelectionWithData({type, variable})
  } finally {
    figma.closePlugin()
  }
}

figma.on('run', ({  parameters }: RunEvent) => {
  if (parameters) {
    runWithParameters(parameters)
  } else {
    main();
  }
})

figma.parameters.on('input', ({query, key, result}: ParameterInputEvent) => {
  switch (key) {
    case 'type':
      const types = [ 'user', 'org', 'repo', 'issue', 'pull', 'app']
      result.setSuggestions(types.filter(s => s.includes(query)))
      break
    case 'variable':
      result.setSuggestions([])
      break
    default:
      return
  }
})