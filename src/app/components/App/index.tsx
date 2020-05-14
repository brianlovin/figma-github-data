import * as React from 'react';
import DataManager from '../DataManager';
import { Container } from './style';
import '../../styles/ui.css';

export default function App() {
  const [didMount, setDidMount] = React.useState(false);
  const [dataPopulatorVariableString, setDataPopulatorVariableString] = React.useState('');

  window.onmessage = async (event) => {
    if (event.data.pluginMessage.type === 'networkRequest') {
      const { route, options } = event.data.pluginMessage;
      return await fetch(route, options)
        .then((r) => (r.status != 200 ? null : r.json()))
        .then((data) => parent.postMessage({ pluginMessage: data }, '*'))
        .catch((err) => console.error({ err }));
    }

    if (event.data.pluginMessage.type === 'getImageBytes') {
      let url = event.data.pluginMessage.url;
      return await fetch(url)
        .then((r) => r.arrayBuffer())
        .then((a) => parent.postMessage({ pluginMessage: new Uint8Array(a) }, '*'))
        .catch((err) => console.error({ err }));
    }

    if (event.data.pluginMessage.type === 'getColorData') {
      let url = 'https://raw.githubusercontent.com/ozh/github-colors/master/colors.json';
      return await fetch(url)
        .then((r) => r.json())
        .then((data) => parent.postMessage({ pluginMessage: data }, '*'))
        .catch((err) => console.error({ err }));
    }

    const { pluginMessage } = event.data;
    const { dataPopulatorVariableString } = pluginMessage;
    setDataPopulatorVariableString(dataPopulatorVariableString);
    setDidMount(true);
  };

  if (!didMount) return null;

  return (
    <Container>
      <DataManager dataPopulatorVariableString={dataPopulatorVariableString} />
    </Container>
  );
}
