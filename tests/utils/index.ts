export const createTextLayer = (name: string): any => {
  return {
    name,
    type: 'TEXT',
    characters: '',
  };
};

export const createFrameWithSecondaryProperties = (name: string): any => {
  return {
    name,
    type: 'FRAME',
    children: [
      {
        name: '__title',
        type: 'TEXT',
        characters: '',
      },
      {
        name: 'Parent',
        type: 'FRAME',
        children: [createTextLayer('__user.login'), createTextLayer('__created_at'), createTextLayer('__number')],
      },
    ],
  };
};
