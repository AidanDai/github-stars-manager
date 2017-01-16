import {$} from '../../helpers';
import {displayLoaderWithMessage} from './uiFooterTagsInRepo';
import {getTagIcon, getStarIcon, getJsonIcon} from './uiSvgIcons';
import {StoredReposMngr} from '../storageSync/StoredReposMngr';

/**
 * Function to run when user enter tag page
 */
export async function enterTagPage() {
  hideStarredRepos();
  if (!$('.ghstarsmngr-sidebar')) {
    exportTagsBts();
    await sidebarListTags();
  }
  $('.ghstarsmngr-sidebar-tag-list-link').click();
}

/**
 * Function to run when user leave tag page
 */
export function leaveTagPage() {
  showStarredRepos();
}

/**
 * Add menu header Tag
 */
export function addHeaderTagMenu() {
  $('.header-nav.float-left').innerHTML +=
    '<li class="header-nav-item">' +
    '<a class="header-nav-link ghstarmngr-tag-header-link">' +
    getTagIcon({width: 14, height: 13}) +
    'Tags</a>' +
    '</li>';
}

/**
 * Create sidebar for listing tags
 */
export async function sidebarListTags() {
  $('.js-repo-filter').innerHTML +=
    '<div class="ghstarsmngr-tag-page-loader">' +
    displayLoaderWithMessage('Loading tag page...') +
    '</div>';

  let tagsAndRelatedRepos = await getTagsAndRelatedRepos();
  tagsAndRelatedRepos = tagsAndRelatedRepos.sort((a, b) => {
    if (a.tag !== null && b.tag !== null) {
      let tagA = a.tag.tagName;
      let tagB = b.tag.tagName;
      return (tagA < tagB) ? -1 : (tagA > tagB) ? 1 : 0;
    }
  });

  $('.js-repo-filter').querySelector('.ghstarsmngr-tag-page-loader').remove();
  let sidebarContent =
        '<div class="col-3 float-left pr-3 ghstarsmngr-sidebar">' +
        '<p class="ghstarsmngr-sidebar-title">Tags </p>' +
        '<ul class="ghstarsmngr-sidebar-tag-list">';

  tagsAndRelatedRepos.map((tagAndRepos) => {
    if (tagAndRepos.tag !== null) {
      sidebarContent +=
        '<li class="border-bottom">' +
        '<a  class="ghstarsmngr-sidebar-tag-list-link" href="#" ' +
        'data-tag="' + tagAndRepos.tag.tagID + '">' +
        getTagIcon({width: 14, height: 13}) +
        tagAndRepos.tag.tagName +
        '<span class="ghstarsmngr-tag-count">' + tagAndRepos.repos.length + '</span>' +
        '</a></li>';
    } else {
      sidebarContent +=
        '<li class="untagged-repos">' +
        '<a class="ghstarsmngr-sidebar-tag-list-link" href="#">' +
        getStarIcon({width: 14, height: 13}) +
        'untagged' +
        '<span class="ghstarsmngr-tag-count">' + tagAndRepos.repos.length + '</span>' +
        '</a></li>';
      sidebarContent += '</ul></div>';
    }
  });
  $('.js-repo-filter').innerHTML += sidebarContent;
}

/**
 * @return {Object}
 */
export async function getTagsAndRelatedRepos() {
  return await StoredReposMngr.getTagsAndRelatedRepos();
}

/**
 * @param {Object} target Element being clicked
 */
export function tagLinkOnTagPageShowRepos(target) {
  changeRepoListInTagPage(target);
}

/**
 * @param {Object} tagItem
 */
export async function changeRepoListInTagPage(tagItem) {
  let ghstarsmngrRepoListContainer = $('.ghstarsmngr-repo-list-container');
  if (ghstarsmngrRepoListContainer) {
    ghstarsmngrRepoListContainer.remove();
  }
  let jsRepoFilter = $('.js-repo-filter');
  jsRepoFilter.innerHTML +=
    '<div class="col-9 float-left pl-3 loading-repos-tag-page">' +
    displayLoaderWithMessage('Loading repositories...the more ⭐ the more it takes') +
    '</div>';

  let storedRepos = await StoredReposMngr.getTagsAndRelatedRepos();

  let repoListContent =
        '<div class="col-9 float-left pl-3 ghstarsmngr-repo-list-container">' +
        '<ul class="ghstarsmngr-repo-list">';

  let reposSelectedByTag = storedRepos.filter((storedRepo) => {
    if (storedRepo.tag) {
      return storedRepo.tag.tagID === Number(tagItem.dataset.tag);
    }

    if (!tagItem.dataset.tag) {
      return storedRepo.tag === null;
    }
  })[0];

  reposSelectedByTag.repos.map((repo) => {
    let repoDesc = repo.description ? repo.description : '';
    repoListContent +=
      '<li class="py-4 border-bottom">' +
      '<a href="' + repo.html_url + '" data-repo="' + repo.repoID + '">' +
      repo.full_name +
      '</a>' +
      '<p>' + repoDesc + '</p>' +
      '</li>';
  });

  repoListContent += '</ul></div>';
  $('.loading-repos-tag-page').remove();
  jsRepoFilter.innerHTML += repoListContent;
}

/**
 * Create section to export tags
 */
export function exportTagsBts() {
  $('.js-repo-filter').innerHTML +=
    '<div class="col-12 ghstarsmngr-export-bts-container">' +
    '<p class="main-title">Export all your ⭐ arranged by tags</p>' +
    '<button class="ghstarsmngr-export-bt btn btn-sm ghstarsmngr-export-bt-bookmarks">' +
    getStarIcon({width: 14, height: 13}) +
    'Export to bookmarks</button>' +
    '<button class="ghstarsmngr-export-bt btn btn-sm ghstarsmngr-export-bt-json">' +
    getJsonIcon({width: 14, height: 13}) +
    'Export to JSON file</button>' +
    '<p class="ghstarsmngr-feedback-export">&nbsp;</p>' +
    '</div>';
}

/**
 * Hide all starred repos to enter on the Tag page
 */
export function hideStarredRepos() {
  $('.user-profile-repo-filter').classList.add('ghstarsmngr-hide');
  $('.paginate-container').classList.add('ghstarsmngr-hide');
  document.querySelectorAll('.d-block.width-full.py-4').forEach((div) => {
    div.classList.add('ghstarsmngr-hide');
  });
}

/**
 * Show all starred repos when leave the Tag page
 */
export function showStarredRepos() {
  $('.paginate-container').classList.remove('ghstarsmngr-hide');
  $('.user-profile-repo-filter').classList.remove('ghstarsmngr-hide');
  document.querySelectorAll('.d-block.width-full.py-4').forEach((div) => {
    div.classList.remove('ghstarsmngr-hide');
  });
}
