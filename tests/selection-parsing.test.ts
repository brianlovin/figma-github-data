import populateSelectionWithData from '../src/plugin/dataPopulator';
import { issues } from './utils/data';
import { createFrameWithSecondaryProperties, createTextLayer } from './utils';

let requestCount = 0;

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

  it('Should warn when selection is invalid', async () => {
    figma.currentPage.selection = [
      {
        type: 'LINE',
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.lastNotification).toEqual('Invalid selection');
    figma.lastNotification = '';

    figma.currentPage.selection = [createTextLayer('title')];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.lastNotification).toEqual('No settable layer');
    figma.lastNotification = '';

    figma.currentPage.selection = [
      {
        type: 'FRAME',
        name: 'frame',
        children: [createTextLayer('foo'), createTextLayer('gino'), createTextLayer('doe')],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.lastNotification).toEqual('No settable layer');
  });

  it('Should populate when a children is settable', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        type: 'FRAME',
        name: 'frame',
        children: [createTextLayer('foo'), createTextLayer('gino'), createTextLayer('__title')],
      },
    ];
    figma.lastNotification = '';
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(figma.lastNotification).toEqual('');
    expect(figma.currentPage.selection[0].children[2].characters).toEqual('Cannot login with all social media account');
  });

  it('Should populate a simple selection of a layer', async () => {
    requestCount = 0;
    figma.currentPage.selection = [createTextLayer('__title')];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(requestCount).toEqual(1);
    expect(figma.currentPage.selection[0].characters).toEqual('Cannot login with all social media account');
  });

  it('Should populate a multiple selection', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      createFrameWithSecondaryProperties('Frame 1'),
      createFrameWithSecondaryProperties('Frame 2'),
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(requestCount).toEqual(2);
    const frames = figma.currentPage.selection;

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

  it('Should populate a list in a frame', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'Parent',
        type: 'FRAME',
        children: [createFrameWithSecondaryProperties('Frame 1'), createFrameWithSecondaryProperties('Frame 2')],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(requestCount).toEqual(2);
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

  it('Should populate a list in a frame of a frame', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'GrandParent',
        type: 'FRAME',
        children: [
          {
            name: 'Parent',
            type: 'FRAME',
            children: [createFrameWithSecondaryProperties('Frame 1'), createFrameWithSecondaryProperties('Frame 2')],
          },
        ],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(requestCount).toEqual(2);
    const frames = figma.currentPage.selection[0].children[0].children;

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

  it('Should parse properly', async () => {
    requestCount = 0;
    figma.currentPage.selection = [
      {
        name: 'Frame 1',
        type: 'FRAME',
        children: [createTextLayer('__title')],
      },
    ];
    await populateSelectionWithData({ type: 'issue', variable: '' });
    expect(requestCount).toEqual(1);
    expect(figma.currentPage.selection[0].children[0].characters).toEqual('Cannot login with all social media account');
  });
});
