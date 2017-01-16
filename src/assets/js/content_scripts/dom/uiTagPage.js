import {$} from '../../helpers';
import {displayLoaderWithMessage} from './uiFooterTagsInRepo';
import {getTagIcon, getStarIcon, getJsonIcon} from './uiSvgIcons';
import {StoredReposMngr} from '../storageSync/StoredReposMngr';
import ghColors from './gh-language-colors.json';
import moment from 'moment';

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
      '<li class="d-block width-full py-4 border-bottom">' +
      '<a href="' + repo.html_url + '" data-repo="' + repo.id + '">' +
      repo.owner.login + ' / ' + '<strong>' + repo.name + '</strong>' +
      '</a>' +
      '<p>' + repoDesc + '</p>' +
      addRepoDetailsBar(repo) +
      '</li>';
  });

  repoListContent += '</ul></div>';
  $('.loading-repos-tag-page').remove();
  jsRepoFilter.innerHTML += repoListContent;
}

/**
 * @param {Object} repoDetails Details like Language used, Stars, Forks
 * @return {string}
 */
function addRepoDetailsBar(repoDetails) {
  /* eslint-disable max-len */

  // ghColors
  let repoDetailsContent = '';

  repoDetailsContent += `<div class="f6 text-gray mt-2">`;

  if (repoDetails.language) {
    for (let color in ghColors) {
      if (ghColors.hasOwnProperty(color)) {
        if (color === repoDetails.language) {
          repoDetailsContent += `
            <span class="repo-language-color ml-0" style="background-color:${ghColors[color]}">
            </span>
            <span class="mr-3" itemprop="programmingLanguage">
                ${repoDetails.language}
            </span>
          `;
        }
      }
    }
  }

  repoDetailsContent += `
    <a class="muted-link tooltipped tooltipped-s mr-3" href="${repoDetails.html_url}/stargazers" aria-label="Stargazers">
      <svg aria-hidden="true" class="octicon octicon-star" height="16" version="1.1" viewBox="0 0 14 16" width="14">
        <path fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74z"></path>
      </svg>
    ${repoDetails.stargazers_count}
    </a>
    
    <a class="muted-link tooltipped tooltipped-s mr-3" href="${repoDetails.html_url}/network" aria-label="Forks">
      <svg aria-hidden="true" class="octicon octicon-repo-forked" height="16" version="1.1" viewBox="0 0 10 16" width="10"><path fill-rule="evenodd" d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"></path>
      </svg>
    ${repoDetails.forks}
    </a>
    
    Updated <relative-time">${moment(repoDetails.pushed_at).fromNow()}</relative-time>
  `;
  repoDetailsContent += `</div>`;
  return repoDetailsContent;
  /* eslint-enable max-len */
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
