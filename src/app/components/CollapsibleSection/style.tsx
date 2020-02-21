import styled from 'styled-components';

export const Title = styled.div`
  position: sticky !important;
  z-index: 12;
  top: 113px !important;
  padding: 8px !important;
  background-color: ${props => (props.isDarkMode ? '#222' : '#f6f7f8')}!important;
  color: ${props => (!props.isDarkMode ? '#222' : '#f6f7f8')}!important;
  box-shadow: inset 0 -1px 0 ${props => (props.isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')};

  &:hover {
    cursor: pointer;
  }

  &:after {
    position: absolute;
    top: 8px;
    left: calc(100% - 24px);
    display: block;
    width: 16px;
    height: 16px;
    z-index: 10;

    content: '';

    opacity: 1;
    background-image: ${props => props.arrow};
    background-repeat: no-repeat;
    background-position: center center;
  }
`;

export function getArrow(isExpanded, isDarkMode) {
  return isExpanded
    ? `url('data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20width%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22m9%2010%203-4h-6z%22%20fill%3D%22%23${
        isDarkMode ? 'fff' : '000'
      }%22%2F%3E%3C%2Fsvg%3E');`
    : `url('data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20width%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22m11%208-4-3v6z%22%20fill%3D%22%23${
        isDarkMode ? 'fff' : '000'
      }%22%2F%3E%3C%2Fsvg%3E')`;
}
