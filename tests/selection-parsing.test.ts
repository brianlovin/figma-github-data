import populateSelectionWithData from '../src/plugin/dataPopulator';

let requestCount = 0;

const issues = [
  {
    created_at: '2020-05-26T02:35:56Z',
    number: 5357,
    title: 'Cannot login with all social media account',
    user: {
      login: 'itokun99',
    },
  },
  {
    created_at: '2020-05-20T16:29:00Z',
    number: 5356,
    title: 'Bump lint-staged from 3.6.1 to 10.2.4',
    user: {
      login: 'dependabot-preview[bot]',
    },
  },
  {
    created_at: '2020-05-15T19:34:49Z',
    number: 5355,
    title: 'Fix header style bug on login page',
    user: {
      login: 'edumoreira1506',
    },
  },
  {
    created_at: '2020-05-06T15:08:26Z',
    number: 5348,
    title: 'Bump react-helmet-async from 0.2.0 to 1.0.6',
    user: {
      login: 'dependabot-preview[bot]',
    },
  },
  {
    created_at: '2020-04-06T15:30:24Z',
    number: 5338,
    title: '[Security] Bump handlebars from 4.1.2 to 4.7.6',
    user: {
      login: 'dependabot-preview[bot]',
    },
  },
];

const figma: any = {
  lastNotification: '',
  notify: (msg: string) => {
    figma.lastNotification = msg;
  },
  loadFontAsync: async (fontName: string) => {
    // do nothing
  },
  ui: {
    postMessage: (message: any) => {
      // do nothing
    },
    once: (eventName: 'string', callback: (result: any) => void) => {
      const result = issues[requestCount];
      callback([result]);
      requestCount++;
    },
  },
  currentPage: {},
};
(global as any).figma = figma;

const createTextLayer = (name: string): any => {
  return {
    name,
    type: 'TEXT',
    characters: '',
  };
};

const createFrameWithSecondaryProperties = (name: string): any => {
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

describe('Selection Parsing', () => {
  it('Should warn when there is no selection', async () => {
    figma.currentPage.selection = [];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.lastNotification).toEqual('No selection');
  });

  it('Should populate a list', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'Parent',
        type: 'FRAME',
        children: [createFrameWithSecondaryProperties('Frame 1'), createFrameWithSecondaryProperties('Frame 2')],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    const frames = figma.currentPage.selection[0].children;

    let titleNode = frames[0].children[0];
    expect(titleNode.characters).toEqual('Cannot login with all social media account');
    let usernameNode = frames[0].children[1].children[0];
    expect(usernameNode.characters).toEqual('itokun99');
    let dateNode = frames[0].children[1].children[1];
    expect(dateNode.characters).toEqual('26 May');
    let numberNode = frames[0].children[1].children[2];
    expect(numberNode.characters).toEqual('#5357');

    titleNode = frames[1].children[0];
    expect(titleNode.characters).toEqual('Bump lint-staged from 3.6.1 to 10.2.4');
    usernameNode = frames[1].children[1].children[0];
    expect(usernameNode.characters).toEqual('dependabot-preview[bot]');
    dateNode = frames[1].children[1].children[1];
    expect(dateNode.characters).toEqual('20 May');
    numberNode = frames[1].children[1].children[2];
    expect(numberNode.characters).toEqual('#5356');
  });

  it('Should parse propertly', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'Frame 1',
        type: 'FRAME',
        children: [createTextLayer('__title')],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.currentPage.selection[0].children[0].characters).toEqual('Cannot login with all social media account');
  });
});
