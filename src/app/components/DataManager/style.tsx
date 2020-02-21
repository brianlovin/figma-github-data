import styled from 'styled-components';

export const UIManagerAppContainer = styled.div`
  width: 100%;
  padding: 16px;
`;

export const ButtonRow = styled.div`
  display: grid;
  grid-gap: 12px;
  grid-template-columns: repeat(${props => `${props.count}, 1fr`});
`;
