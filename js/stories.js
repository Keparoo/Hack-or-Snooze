'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

const getAndShowStoriesOnStart = async () => {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
};

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

const generateStoryMarkup = (trash, story) => {
	// console.debug("generateStoryMarkup", story);
	let star = '';
	if (currentUser) {
		isFavorite(story)
			? (star = '<i class="fas fa-star"></i>')
			: (star = '<i class="far fa-star"></i>');
	}

	const hostName = story.getHostName();
	return $(`<li id="${story.storyId}">
        <span class="trash">${trash}</span>
        <span class="star">${star}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
};

const isFavorite = (story) => {
	// console.debug('isFavorite');
	for (let fav of currentUser.favorites) {
		if (fav.storyId === story.storyId) {
			return true;
		}
	}
	return false;
};

const getStory = (storyId) => {
	for (let story of storyList.stories) {
		if ((story.storyId = storyId)) {
			return story;
		}
	}
};

const toggleStar = (evt) => {
	console.debug('toggleStar');
	const $target = $(evt.target);
	const storyId = $target.parent().parent().attr('id');

	const story = getStory(storyId);
	if ($target.closest('i').hasClass('fas')) {
		currentUser.removeFavoriteStory(story);
		$target.closest('i').toggleClass('fas far');
	} else {
		currentUser.addFavoriteStory(story);
		$target.closest('i').toggleClass('fas far');
	}
};

$body.on('click', '.star', toggleStar);

const deleteStoryFromPage = async (evt) => {
	console.debug('deleteStory');
	const storyId = $(evt.target).parent().parent().attr('id');
	await storyList.deleteStory(currentUser, storyId);

	putmyStoriesOnPage();
};

$body.on('click', '.trash', deleteStoryFromPage);

/** Gets list of stories from server, generates their HTML, and puts on page. */

const putStoriesOnPage = () => {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	let trash = '';
	// let star = '';
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(trash, story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
};

const putFavoritesOnPage = () => {
	console.debug('putFavoritesOnPage');

	$favoriteStoriesList.empty();

	if (!currentUser.favorites.length) {
		$favoriteStoriesList.append('<h3>Favorite List Empty!</h3>');
	} else {
		const trash = '';
		// const star = '<i class="fas fa-star"></i>';
		// loop through all of favorites and generate HTML for them
		for (let story of currentUser.favorites) {
			const $story = generateStoryMarkup(trash, story);
			$favoriteStoriesList.append($story);
		}
	}
	$favoriteStoriesList.show();
};

const putmyStoriesOnPage = () => {
	console.debug('putmyStoriesOnPage');

	$myStoriesList.empty();

	if (!currentUser.ownStories.length) {
		$myStoriesList.append('<h3>My Stories List Empty!</h3>');
	} else {
		const trash = '<i class="fas fa-trash-alt"></i>';
		// let star = '';
		// loop through all of our stories and generate HTML for them
		for (let story of currentUser.ownStories) {
			// 	if (currentUser) {
			// 		isFavorite(story)
			// 			? (star = '<i class="fas fa-star"></i>')
			// 			: (star = '<i class="far fa-star"></i>');
			const $story = generateStoryMarkup(trash, story);
			$myStoriesList.append($story);
		}
	}
	$myStoriesList.show();
};

const submitNewStory = async (evt) => {
	evt.preventDefault();
	console.debug('submitNewStory', evt);
	const author = $('#story-author').val();
	const title = $('#story-title').val();
	const url = $('#story-url').val();

	const newStory = await storyList.addStory(currentUser, {
		title,
		author,
		url
	});
	const $story = generateStoryMarkup('', newStory);
	$allStoriesList.prepend($story);
	$submitStoryForm.hide();
	// $submitStoryForm.slideUp('slow');
	$submitStoryForm.trigger('reset');
};

$submitStoryForm.on('submit', submitNewStory);
