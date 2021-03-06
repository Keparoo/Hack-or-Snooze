'use strict';

const $body = $('body');

// Find and store page elements for manipulation
const $storiesLoadingMsg = $('#stories-loading-msg');
const $allStoriesList = $('#all-stories-list');
const $favoriteStoriesList = $('#favorite-stories-list');
const $myStoriesList = $('#my-stories-list');
const $submitStory = $('#submit-story');
const $userProfileInfo = $('#user-profile-info');

const $navLogin = $('#nav-login');
const $navLogOut = $('#nav-logout');
const $navSubmit = $('#nav-submit');
const $navFavorites = $('#nav-favorites');
const $navMyStories = $('#nav-my-stories');
const $navUserProfile = $('#nav-user-profile');

const $loginForm = $('#login-form');
const $signupForm = $('#signup-form');
const $submitStoryForm = $('#submit-story-form');
const $updateUserForm = $('#update-user-form');
const $updateError = $('#update-error');
const $updateStory = $('#update-story');
const $updateStoryForm = $('#update-story-form');

const $loginError = $('#login-error');
const $signupError = $('#signup-error');

// Hide all page components before a screen redraw
const hidePageComponents = () => {
	const components = [
		$allStoriesList,
		$loginForm,
		$signupForm,
		$submitStory,
		$favoriteStoriesList,
		$myStoriesList,
		$userProfileInfo,
		$updateUserForm
	];
	components.forEach((c) => c.hide());
};

// Start web app
const start = async () => {
	console.debug('start');

	// "Remember logged-in user" and log in, if credentials in localStorage
	await checkForRememberedUser();
	await getAndShowStoriesOnStart();

	// if we got a logged-in user
	if (currentUser) updateUIOnUserLogin();
};

// Once the DOM is entirely loaded, begin the app

$(start);
