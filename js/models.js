'use strict';

const BASE_URL = 'https://hack-or-snooze-v3.herokuapp.com';

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
	/* Make instance of Story from data object about story:
     *   - {title, author, url, username, storyId, createdAt}
     */

	constructor({ storyId, title, author, url, username, createdAt }) {
		this.storyId = storyId;
		this.title = title;
		this.author = author;
		this.url = url;
		this.username = username;
		this.createdAt = createdAt;
	}

	// Parses hostname out of URL and returns it.
	getHostName = () => {
		const urlObj = new URL(this.url);
		return urlObj.hostname;
	};

	// This will update a story in the API & Locally
	updateStory = async (newVals) => {
		console.debug('updateStory');

		const res = await axios({
			url: `${BASE_URL}/stories/${this.storyId}`,
			method: 'PATCH',
			data: { token: currentUser.loginToken, story: newVals }
		});

		// Update the values locally
		this.author = newVals.author;
		this.title = newVals.title;
		this.url = newVals.url;
		return res.data.story;
	};
}

/**********************************************************************************/

// List of Story instances: used by UI to show story lists in DOM.
class StoryList {
	constructor(stories) {
		this.stories = stories;
	}

	/** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

	static getStories = async () => {
		// Note presence of `static` keyword: this indicates that getStories is
		//  **not** an instance method. Rather, it is a method that is called on the
		//  class directly. Why doesn't it make sense for getStories to be an
		//  instance method?

		// query the /stories endpoint (no auth required)
		const response = await axios({
			url: `${BASE_URL}/stories`,
			method: 'GET'
		});

		// turn plain old story objects from API into instances of Story class
		const stories = response.data.stories.map((story) => new Story(story));

		// build an instance of our own class using the new array of stories
		return new StoryList(stories);
	};

	/** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

	addStory = async (user, newStory) => {
		const res = await axios.post(`${BASE_URL}/stories`, {
			token: user.loginToken,
			story: {
				author: newStory.author,
				title: newStory.title,
				url: newStory.url
			}
		});

		const story = new Story(res.data.story);
		this.stories.unshift(story);
		user.ownStories.unshift(story);

		return new Story(res.data.story);
	};

	// Deletes a story from API, updates the users favorites and ownStories lists
	deleteStory = async (user, storyId) => {
		console.debug('deleteStory');

		const res = await axios.delete(`${BASE_URL}/stories/${storyId}`, {
			data: { token: user.loginToken }
		});

		this.stories = this.stories.filter((story) => story.storyId !== storyId);
		user.favorites = user.favorites.filter(
			(story) => story.storyId !== storyId
		);
		user.ownStories = user.ownStories.filter(
			(story) => story.storyId !== storyId
		);
	};
}

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
	/** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

	constructor(
		{ username, name, createdAt, favorites = [], ownStories = [] },
		token
	) {
		this.username = username;
		this.name = name;
		this.createdAt = createdAt;

		// Instantiate Story instances for the user's favorites and ownStories
		this.favorites = favorites.map((s) => new Story(s));
		this.ownStories = ownStories.map((s) => new Story(s));

		// store the login token on the user so it's easy to find for API calls.
		this.loginToken = token;
	}

	/** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

	static signup = async (username, password, name) => {
		const response = await axios({
			url: `${BASE_URL}/signup`,
			method: 'POST',
			data: { user: { username, password, name } }
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories
			},
			response.data.token
		);
	};

	/** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

	static login = async (username, password) => {
		const response = await axios({
			url: `${BASE_URL}/login`,
			method: 'POST',
			data: { user: { username, password } }
		});

		let { user } = response.data;

		return new User(
			{
				username: user.username,
				name: user.name,
				createdAt: user.createdAt,
				favorites: user.favorites,
				ownStories: user.stories
			},
			response.data.token
		);
	};

	/** When we already have credentials (token & username) for a user,
     *   we can log them in automatically. This function does that.
     */

	static loginViaStoredCredentials = async (token, username) => {
		try {
			const response = await axios({
				url: `${BASE_URL}/users/${username}`,
				method: 'GET',
				params: { token }
			});

			let { user } = response.data;

			return new User(
				{
					username: user.username,
					name: user.name,
					createdAt: user.createdAt,
					favorites: user.favorites,
					ownStories: user.stories
				},
				token
			);
		} catch (err) {
			console.error('loginViaStoredCredentials failed', err);
			return null;
		}
	};

	/** Update user in API, make User instance & return it.
   *
   * - opt username: a new username
   * - opt password: a new password
   * - opt name: the user's full name
   */

	updateUser = async (newUserData) => {
		console.debug('updateUser');

		const response = await axios({
			url: `${BASE_URL}/users/${this.username}`,
			method: 'PATCH',
			data: { token: this.loginToken, user: newUserData }
		});

		let { user } = response.data;
		this.name = user.name;
	};

	// Add a favorite story from API
	addFavoriteStory = async (story) => {
		console.debug('addFavoriteStory');

		const res = await axios.post(
			`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
			{ token: this.loginToken }
		);
		this.favorites.push(story);

		return this.favorites;
	};

	// Remove a favorite from the API
	removeFavoriteStory = async (story) => {
		console.debug('removeFavoriteStory');

		const res = await axios.delete(
			`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
			{ data: { token: this.loginToken } }
		);

		this.favorites = this.favorites.filter((s) => {
			return s.storyId != story.storyId;
		});

		return this.favorites;
	};

	// Return true if the passed in story is a favorite
	isFavorite = (story) => {
		// console.debug('isFavorite');

		return this.favorites.find((st) => st.storyId === story.storyId);
	};
}
