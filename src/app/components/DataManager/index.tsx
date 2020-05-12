import * as React from 'react';
import { UIManagerAppContainer, ButtonRow } from './style';

interface Props {
  dataPopulatorVariableString: string;
}

async function populate({ type, variable }) {
  parent.postMessage(
    {
      pluginMessage: {
        event: 'INIT_DATA_POPULATOR',
        key: null,
        value: { type, variable },
      },
    },
    '*'
  );
}

export default function DataPopulator({ dataPopulatorVariableString }: Props) {
  const inputRef = React.useRef(null);
  const [variable, setVariable] = React.useState(dataPopulatorVariableString);

  function onKeyDown(e) {
    if (e.metaKey && e.which === 65) {
      e.stopPropagation();
      e.preventDefault();
      const input = inputRef.current;
      input.setSelectionRange(0, input.value.length);
    }
  }

  function onChange(e) {
    setVariable(e.target.value);
    parent.postMessage(
      {
        pluginMessage: {
          event: 'STORE_KEY_VALUE',
          key: 'dataPopulatorVariableString',
          value: e.target.value,
        },
      },
      '*'
    );
  }

  return (
    <UIManagerAppContainer>
      <ButtonRow count={5}>
        <button onClick={() => populate({ type: 'user', variable })} className="button button--secondary">
          User
        </button>
        <button onClick={() => populate({ type: 'org', variable })} className="button button--secondary">
          Org
        </button>
        <button onClick={() => populate({ type: 'repo', variable })} className="button button--secondary">
          Repo
        </button>
        <button onClick={() => populate({ type: 'issue', variable })} className="button button--secondary">
          Issue
        </button>
        <button onClick={() => populate({ type: 'pull', variable })} className="button button--secondary">
          Pull
        </button>
      </ButtonRow>

      <input
        ref={inputRef}
        style={{ marginTop: '12px' }}
        type="input"
        className="input"
        autoFocus
        value={variable}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Custom variable (optional)"
      />
    </UIManagerAppContainer>
  );
}
