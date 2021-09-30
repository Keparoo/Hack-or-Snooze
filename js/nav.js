'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 *****************************************************************************/

// Show main list of all stories when click site name
const navAllStories = (evt) => {
	console.debug('navAllStories');
	hidePageComponents();
	putStoriesOnPage();
};

$body.on('click', '#nav-all', navAllStories);

// Show login/signup on click on "login"
const navLoginClick = (evt) => {
	console.debug('navLoginClick');
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
};

// Display the submit, favorites and mystories nav elements
const showUserNavElements = () => {
	console.debug('showUserNavElements');
	$navSubmit.show();
	$navFavorites.show();
	$navMyStories.show();
};

$navLogin.on('click', navLoginClick);

// When a user first logins in, update the navbar to reflect that.
const updateNavOnLogin = () => {
	console.debug('updateNavOnLogin');
	$('.main-nav-links').show();
	$navLogin.hide();
	$navLogOut.show();
	$navUserProfile.text(`${currentUser.username}`).show();
	showUserNavElements();
};

// Show submit new story form
const navSubmitClick = (evt) => {
	console.debug('navSubmitClick');
	hidePageComponents();
	$allStoriesList.show();
	$submitStory.show();
};

$body.on('click', '#nav-submit', navSubmitClick);

// Show list of user's favorite stories
const navFavoritesClick = (evt) => {
	console.debug('navFavoritesClick');
	hidePageComponents();
	putFavoritesOnPage();
};

$body.on('click', '#nav-favorites', navFavoritesClick);

// Show list of user's own stories
const myStoriesClick = (evt) => {
	console.debug('myStoriesClick');
	hidePageComponents();
	putmyStoriesOnPage();
};

$body.on('click', '#nav-my-stories', myStoriesClick);

// Display user profile info
const showUserProfileInfo = () => {
	console.debug('showUserProfileInfo');
	hidePageComponents();
	createUserProfile();
	$userProfileInfo.show();
};

$body.on('click', '#nav-user-profile', showUserProfileInfo);

const showUpdateUserForm = () => {
	console.debug('showUpdateUserForm');
	$updateUserForm.show();
};

$body.on('click', '#update-user-btn', showUpdateUserForm);
