import populateSelectionWithData from '../src/plugin/dataPopulator';

let requestCount = 0;

const issues = [
  {
    title: 'Cannot login with all social media account',
  },
  {
    title: 'Bump lint-staged from 3.6.1 to 10.2.4',
  },
  {
    title: 'Fix header style bug on login page',
  },
  {
    title: 'Bump react-helmet-async from 0.2.0 to 1.0.6',
  },
  {
    title: '[Security] Bump handlebars from 4.1.2 to 4.7.6',
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
        name: 'Frame 1',
        type: 'FRAME',
        children: [
          {
            name: '__title',
            type: 'TEXT',
            characters: '',
          },
        ],
      },
    ];
  });

  it('Should parse propertly', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'Frame 1',
        type: 'FRAME',
        children: [
          {
            name: '__title',
            type: 'TEXT',
            characters: '',
          },
        ],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.currentPage.selection[0].children[0].characters).toEqual('Cannot login with all social media account');
  });
});
