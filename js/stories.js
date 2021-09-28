'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

// Get and show stories when site first loads
const getAndShowStoriesOnStart = async () => {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
};

// Returns true if the passed in story is a favorite
// const isFavorite = (story) => {
// 	// console.debug('isFavorite');
// 	for (let fav of currentUser.favorites) {
// 		if (fav.storyId === story.storyId) {
// 			return true;
// 		}
// 	}
// 	return false;
// };

// Create the HTML for the favorite/not favorite star
const makeStarMarkup = (user, story) => {
	let star = '';
	if (user) {
		user.isFavorite(story)
			? (star = '<i class="fas fa-star"></i>')
			: (star = '<i class="far fa-star"></i>');
	}
	return star;
};

// Create the HTML for the delete button (trash can)
const makeTrashMarkup = () => {
	return '<i class="fas fa-trash-alt"></i>';
};

// Generate the HTML for a story listing
const generateStoryMarkup = (story, showTrash = false) => {
	// console.debug("generateStoryMarkup", story);

	let trash;
	showTrash ? (trash = makeTrashMarkup()) : (trash = '');
	const star = makeStarMarkup(currentUser, story);
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

// Return a story object that matches the passed in storyId
const getStory = (storyId) => {
	for (let story of storyList.stories) {
		if ((story.storyId = storyId)) {
			return story;
		}
	}
};

// Toggle the Favorite Star for a story from Favorite to not Favorite or vice versa
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

// Delete a story from the page and from the database
const deleteStoryFromPage = async (evt) => {
	console.debug('deleteStory');
	const storyId = $(evt.target).parent().parent().attr('id');
	await storyList.deleteStory(currentUser, storyId);

	putmyStoriesOnPage();
};

$body.on('click', '.trash', deleteStoryFromPage);

// Gets list of stories from server, generates their HTML, and puts on page.
const putStoriesOnPage = () => {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
};

// Display a list of a user's favorited stories
const putFavoritesOnPage = () => {
	console.debug('putFavoritesOnPage');

	$favoriteStoriesList.empty();

	if (!currentUser.favorites.length) {
		$favoriteStoriesList.append('<h3>Favorite List Empty!</h3>');
	} else {
		// loop through all of favorites and generate HTML for them
		for (let story of currentUser.favorites) {
			const $story = generateStoryMarkup(story);
			$favoriteStoriesList.append($story);
		}
	}
	$favoriteStoriesList.show();
};

// Display a list of a user's added stories
const putmyStoriesOnPage = () => {
	console.debug('putmyStoriesOnPage');

	$myStoriesList.empty();

	if (!currentUser.ownStories.length) {
		$myStoriesList.append('<h3>My Stories List Empty!</h3>');
	} else {
		// loop through all of our stories and generate HTML for them
		for (let story of currentUser.ownStories) {
			const showTrash = true;
			const $story = generateStoryMarkup(story, showTrash);
			$myStoriesList.append($story);
		}
	}
	$myStoriesList.show();
};

// Create a new story and add it to the page and database
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
