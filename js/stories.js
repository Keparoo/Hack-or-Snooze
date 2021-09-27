'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(star, story) {
	// console.debug("generateStoryMarkup", story);
	const hostName = story.getHostName();
	return $(`<li id="${story.storyId}">
        <span class="star">${star}</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

const isFavorite = (story) => {
	// console.debug('isFavorite');
	for (let fav of currentUser.favorites) {
		if (fav.storyId === story.storyId) {
			return true;
		}
	}
	return false;
};

const toggleStar = (evt) => {
	console.debug('toggleStar');
	// console.log($(evt.target).parent().parent().attr('id'));
	const storyId = $(evt.target).parent().parent().attr('id');
	let removed = false;
	for (let fav of currentUser.favorites) {
		if (fav.storyId === storyId) {
			console.log('to be removed');
			User.removeFavoriteStory(currentUser, fav);
			removed = true;
			putStoriesOnPage();
		}
	}
	if (!removed) {
		console.log('to be added');
		for (let story of storyList.stories) {
			if (story.storyId === storyId) User.addFavoriteStory(currentUser, story);
			putStoriesOnPage();
		}
	}
};

$body.on('click', '.star', toggleStar);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	let star = '';
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		if (currentUser) {
			isFavorite(story)
				? (star = '<i class="fas fa-star"></i>')
				: (star = '<i class="far fa-star"></i>');
		}
		const $story = generateStoryMarkup(star, story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

function putFavoritesOnPage() {
	console.debug('putFavoritesOnPage');

	$favoriteStoriesList.empty();

	let star = '<i class="fas fa-star"></i>';
	// loop through all of favorites and generate HTML for them
	for (let story of user.favorites) {
		const $story = generateStoryMarkup(star, story);
		$favoriteStoriesList.append($story);
	}
	$favoriteStoriesList.show();
}

$submitStoryForm.on('submit', submitNewStory);

function submitNewStory(evt) {
	evt.preventDefault();
	console.debug('submitNewStory', evt);
	const author = $('#story-author').val();
	const title = $('#story-title').val();
	const url = $('#story-url').val();

	const newStory = storyList.addStory(currentUser, { title, author, url });
}
