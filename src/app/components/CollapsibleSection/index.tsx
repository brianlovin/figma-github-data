import * as React from 'react';
import { Title, getArrow } from './style';

export default function({ children, title, initialValue, isDarkMode, id, ...rest }) {
  const [isExpanded, setExpanded] = React.useState(initialValue);
  const arrow = getArrow(isExpanded, isDarkMode);

  const handleClick = () => {
    parent.postMessage(
      {
        pluginMessage: {
          event: 'STORE_KEY_VALUE',
          key: id,
          value: !isExpanded,
        },
      },
      '*'
    );

    setExpanded(!isExpanded);
  };

  return (
    <React.Fragment>
      <Title onClick={handleClick} className="section-title" arrow={arrow} isDarkMode={isDarkMode} {...rest}>
        {title}
      </Title>
      {isExpanded && children}
    </React.Fragment>
  );
}
