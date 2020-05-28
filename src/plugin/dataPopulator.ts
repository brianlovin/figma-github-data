import {
  isFramelikeNode,
  getRandomElementFromArray,
  containsSettableLayers,
  isSettableNode,
  isTextNode,
  isValidShapeNode,
  childrenAreUsingDifferentProperties,
} from './utils';
import { users, orgs, repos, issuesRepos, pullsRepos, apps, config } from './data';
import transformNodeWithData from './transformNodeWithData';

function appendUrlWithVariable(variable, arr) {
  return variable ? variable : getRandomElementFromArray(arr);
}

export function getDataFromAPI(route, headers?) {
  let options = headers ? headers : {};

  figma.ui.postMessage({ type: 'networkRequest', route, options });
  return new Promise((res) => {
    figma.ui.once('message', (resource) => {
      return res(resource);
    });
  });
}

async function getUser(variable) {
  let route = config.apiRoot + `/users/`;
  route += appendUrlWithVariable(variable, users);

  return await getDataFromAPI(route);
}

async function getOrg(variable) {
  let route = config.apiRoot + `/users/`;
  route += appendUrlWithVariable(variable, orgs);

  return await getDataFromAPI(route);
}

async function getRepo(variable) {
  let route = config.apiRoot + `/repos/`;
  route += appendUrlWithVariable(variable, repos);

  return await getDataFromAPI(route);
}

async function getIssue(variable) {
  let route = config.apiRoot + `/repos/`;
  route += appendUrlWithVariable(variable, issuesRepos);
  route += `/issues`;
  return await getDataFromAPI(route);
}

async function getPull(variable) {
  let route = config.apiRoot + `/repos/`;
  route += appendUrlWithVariable(variable, pullsRepos);
  route += `/pulls`;
  return await getDataFromAPI(route);
}

async function getApp(variable) {
  // In order to GET apps, a custom media type is required
  // https://developer.github.com/v3/apps/#get-a-single-github-app
  const previewHeaders = {
    headers: {
      Accept: 'application/vnd.github.machine-man-preview+json',
    },
  };

  let route = config.apiRoot + `/apps/`;
  route += appendUrlWithVariable(variable, apps);

  return await getDataFromAPI(route, previewHeaders);
}

async function fetchAndPopulate(type, variable) {
  switch (type) {
    case 'user': {
      return await getUser(variable);
    }
    case 'org': {
      return await getOrg(variable);
    }
    case 'repo': {
      return await getRepo(variable);
    }
    case 'issue': {
      return getRandomElementFromArray(await getIssue(variable));
    }
    case 'pull': {
      return getRandomElementFromArray(await getPull(variable));
    }
    case 'app': {
      return await getApp(variable);
    }
  }
}

const fetchAndPopulateNode = async (node: SceneNode, type, variable) => {
  await fetchAndPopulate(type, variable).then(async (result) => await transformNodeWithData(node, result));
};

const populateNodeWithData = async (node: SceneNode, type, variable) => {
  // go down until more than a child has settable layers
  if (isFramelikeNode(node)) {
    // has children
    const frame = node as FrameNode;
    let childrenWithSettableLayers = 0;
    for (const child of frame.children) {
      if (containsSettableLayers([child])) {
        childrenWithSettableLayers++;
      }
    }
    if (childrenWithSettableLayers > 1 && childrenAreUsingDifferentProperties(frame.children)) {
      await fetchAndPopulateNode(node, type, variable);
      return;
    }
    for (const child of frame.children) {
      if (childrenWithSettableLayers > 1) {
        // get data
        await fetchAndPopulateNode(child, type, variable);
      } else {
        // go down
        await populateNodeWithData(child, type, variable);
      }
    }
  } else if (isSettableNode(node)) {
    await fetchAndPopulateNode(node, type, variable);
  }
};

export default async function populateSelectionWithData({ type, variable }) {
  const selection = figma.currentPage.selection;
  if (!selection || selection.length === 0) return figma.notify('No selection');

  if (selection.length === 1) {
    const node = selection[0];
    if (!isFramelikeNode(node) && !isTextNode(node) && !isValidShapeNode(node)) {
      return figma.notify('Invalid selection');
    }
  }

  if (!containsSettableLayers(selection as any)) {
    return figma.notify('No settable layer');
  }

  await populateNodeWithData(
    {
      name: 'Container',
      type: 'FRAME',
      children: selection, // bit dodgy, sorry! - Christian
    } as SceneNode,
    type,
    variable
  );
}
