'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

const navAllStories = (evt) => {
	console.debug('navAllStories', evt);
	hidePageComponents();
	putStoriesOnPage();
};

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

const navLoginClick = (evt) => {
	console.debug('navLoginClick', evt);
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
};

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

const updateNavOnLogin = () => {
	console.debug('updateNavOnLogin');
	$('.main-nav-links').show();
	$navLogin.hide();
	$navLogOut.show();
	$navUserProfile.text(`${currentUser.username}`).show();
};

const navSubmitClick = (evt) => {
	console.debug('submitStory', evt);
	$submitStory.show();
};

$body.on('click', '#nav-submit', navSubmitClick);

const navFavoritesClick = (evt) => {
	console.debug('navFavoritesClick');
	hidePageComponents();
	putFavoritesOnPage();
};

$body.on('click', '#nav-favorites', navFavoritesClick);

const myStoriesClick = (evt) => {
	console.debug('myStoriesClick');
	hidePageComponents();
	putmyStoriesOnPage();
};

$body.on('click', '#nav-my-stories', myStoriesClick);
