import { isFramelikeNode, getRandomElementFromArray, selectionContainsSettableLayers } from './utils';
import { users, orgs, repos, issuesRepos, pullsRepos, config } from './data';
import transformNodeWithData from './transformNodeWithData';

function appendUrlWithVariable(variable, arr) {
  return variable ? variable : getRandomElementFromArray(arr);
}

export function getDataFromAPI(route) {
  figma.ui.postMessage({ type: 'networkRequest', route });
  return new Promise(res => {
    figma.ui.once('message', resource => {
      return res(resource);
    });
  });
}

async function getUser(variable) {
  let route = config.apiRoot + `/users/`;
  route += appendUrlWithVariable(variable, users)

  return await getDataFromAPI(route);
}

async function getOrg(variable) {
  let route = config.apiRoot + `/users/`;
  route += appendUrlWithVariable(variable, orgs)

  return await getDataFromAPI(route);
}

async function getRepo(variable) {
  let route = config.apiRoot + `/repos/`;
  route += appendUrlWithVariable(variable, repos)

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
  }
}

export default async function populateSelectionWithData({ type, variable }) {
  const selection = figma.currentPage.selection;
  if (!selection || selection.length === 0) return figma.notify('No selection');

  if (selection.length === 1) {
    const curr = selection[0] as FrameNode | InstanceNode | ComponentNode
    
    // if the user selected a framelike node...
    if (isFramelikeNode(curr)) {
      // ...that only contains children that are framelike, they are probably
      // trying to populate a list of elements with data
      if (curr.children.every(isFramelikeNode)) {
        const nodes = curr.children;
        for (let node of nodes) {
          await fetchAndPopulate(type, variable)
            .then(async result => await transformNodeWithData(node, result));
        }
      } 
      // ...the user is just populating a single node, proceed with population
      else {
        await fetchAndPopulate(type, variable)
          .then(async result => await transformNodeWithData(curr, result));
      }
    }
  } 
  
  // if the user selected multiple elements, and all of them are framelike, populate
  // them each with data
  else if (selection.every(isFramelikeNode)) {
    for (let node of selection) {
      await fetchAndPopulate(type, variable).then(async result => await transformNodeWithData(node, result));
    }
  } 

  // some individual layers were selected, populate them
  else if (selectionContainsSettableLayers(selection)) {
    for (let node of selection) {
      await fetchAndPopulate(type, variable).then(async result => await transformNodeWithData(node, result));
    }
  }

  // 
  else {
    return figma.notify('Invalid selection');
  }
}
