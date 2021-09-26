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
	return $(`<li id="${story.storyId}">${star} 
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
	// console.log(currentUser, story);
	for (let fav of currentUser.favorites) {
		console.log(fav.storyId);
		if (fav.storyId === story.storyId) {
			return true;
		}
	}
	return false;
};

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	let star;
	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		if (!currentUser) {
			star = '';
		} else {
			isFavorite(story)
				? (star = '<i class="fas fa-star" />')
				: (star = '<i class="far fa-star" />');
		}
		const $story = generateStoryMarkup(star, story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
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
