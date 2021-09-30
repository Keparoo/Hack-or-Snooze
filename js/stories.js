'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

// Get and show stories when site first loads
const getAndShowStoriesOnStart = async () => {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
};

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

// Create the HTML for the update story button
const makeUpdateMarkup = () => {
	return '<button class="update-story-btn">update story</button>';
};

// Generate the HTML for a story listing
const generateStoryMarkup = (story, showTrash = false, showUpdate = false) => {
	// console.debug('generateStoryMarkup');

	let trash;
	let update;
	showTrash ? (trash = makeTrashMarkup()) : (trash = '');
	showUpdate ? (update = makeUpdateMarkup()) : (update = '');
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
        <span>${update}</span>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
};

// Toggle the Favorite Star for a story from Favorite to not Favorite or vice versa
const toggleStar = async (evt) => {
	console.debug('toggleStar');
	const $target = $(evt.target);
	const storyId = $target.closest('li').attr('id');

	const story = storyList.stories.find((s) => s.storyId === storyId);

	if ($target.closest('i').hasClass('fas')) {
		await currentUser.removeFavoriteStory(story);
		$target.closest('i').toggleClass('fas far');
	} else {
		await currentUser.addFavoriteStory(story);
		$target.closest('i').toggleClass('fas far');
	}
};

$body.on('click', '.star', toggleStar);

// Delete a story from the page and from the database
const deleteStoryFromPage = async (evt) => {
	console.debug('deleteStory');
	const storyId = $(evt.target).closest('li').attr('id');
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
			const showUpdate = true;
			const $story = generateStoryMarkup(story, showTrash, showUpdate);
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
	const $story = generateStoryMarkup(newStory);
	$allStoriesList.prepend($story);
	$submitStory.slideUp('slow');
	$submitStoryForm.trigger('reset');
};

$submitStoryForm.on('submit', submitNewStory);

// Get current story values and populate update show form with them
const showUpdateStoryForm = (evt) => {
	console.debug('showUpdateStoryForm', evt);
	const $target = $(evt.target);
	const storyId = $target.closest('li').attr('id');
	console.log(storyId);

	const story = storyList.stories.find((s) => s.storyId === storyId);
	console.log(story);

	$('#update-story-author').val(story.author);
	$('#update-story-title').val(story.title);
	$('#update-story-url').val(story.url);
	$('#update-story-form').data('storyId', storyId);
	$updateStory.show();
};

$body.on('click', '.update-story-btn', showUpdateStoryForm);

// Update list of favorites for current user
const updateFavorites = (storyId, author, title, url) => {
	const favStoryToUpdate = currentUser.favorites.find(
		(f) => f.storyId === storyId
	);
	if (favStoryToUpdate) {
		favStoryToUpdate.author = author;
		favStoryToUpdate.title = title;
		favStoryToUpdate.url = url;
	}
};

// Update list of own stories for current user
const updateOwnStories = (storyId, author, title, url) => {
	const ownStoryToUpdate = currentUser.ownStories.find(
		(o) => o.storyId === storyId
	);
	ownStoryToUpdate.author = author;
	ownStoryToUpdate.title = title;
	ownStoryToUpdate.url = url;
};

// Get values from updateStory form and pass them to API-call func and update locally
const submitUpdateStory = async (evt) => {
	evt.preventDefault();
	console.debug('submitUpdateStory');

	const author = $('#update-story-author').val();
	const title = $('#update-story-title').val();
	const url = $('#update-story-url').val();
	const storyId = $('#update-story-form').data('storyId');
	const story = storyList.stories.find((s) => s.storyId === storyId);

	const updatedStory = await story.updateStory({
		title,
		author,
		url
	});

	updateFavorites(storyId, author, title, url);
	updateOwnStories(storyId, author, title, url);

	$updateStory.slideUp('slow');
	$updateStoryForm.trigger('reset');
	hidePageComponents();
	putmyStoriesOnPage();
};

$body.on('click', '#submit-update-story-btn', submitUpdateStory);
