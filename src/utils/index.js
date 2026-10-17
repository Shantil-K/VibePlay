const apiUrl = process.env.REACT_APP_API_BASE_URL;
const reactAppDomain = process.env.REACT_APP_DOMAIN;

export const createUser = async (username, email, password) => {
	try {
		const response = await fetch(`${apiUrl}/user`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username,
				email: email,
				password: password,
			}),
		});
		const data = await response.json();
		document.cookie = `authToken=${data.token};max-age=604800;domain=${reactAppDomain}`;
		return {
			username: data.result.username,
			email: data.result.email,
			id: data.result._id,
		};
	} catch (error) {
		throw error;
	}
};

export const updateUser = async (username, email, password) => {
	try {
		const response = await fetch(`${apiUrl}/update`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('authToken')}`,
			},
			body: JSON.stringify({
				username: username,
				email: email,
				password: password,
			}),
		});
		const data = await response.json();
		return {
			username: data.result.username,
			email: data.result.email,
			id: data.result._id,
		};
	} catch (error) {
		throw error;
	}
};

export const deleteUser = async () => {
	try {
		await fetch(`${apiUrl}/delete`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('authToken')}`,
			},
		});
		return {
			message: 'success',
		};
	} catch (error) {
		throw error;
	}
};

export const login = async (email, password) => {
	try {
		const response = await fetch(`${apiUrl}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				password: password,
			}),
		});
		const data = await response.json();
		document.cookie = `authToken=${data.token};max-age=604800;domain=${reactAppDomain}`;
		return {
			username: data.user.username,
			email: data.user.email,
			id: data.user._id,
		};
	} catch (error) {
		throw error;
	}
};

export const attemptTokenLogin = async () => {
	try {
		const token = getCookie('authToken');
		if (token !== null) {
			const response = await fetch(`${apiUrl}/token`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});
			const data = await response.json();
			document.cookie = `authToken=${data.token};max-age=604800;domain=${reactAppDomain}`;
			return {
				username: data.user.username,
				email: data.user.email,
				id: data.user._id,
			};
		}
		return null;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const logOut = async () => {
	document.cookie = `authToken=loggedOut;max-age=0;domain=${reactAppDomain}`;
};

// Top songs chart from the iTunes RSS feed (free, no API key needed)
export const getTopTracks = async () => {
	const response = await fetch(
		'https://itunes.apple.com/us/rss/topsongs/limit=50/json',
	);
	const data = await response.json();
	const entries = data.feed?.entry ?? [];
	return entries.map((entry) => {
		const images = entry['im:image'] ?? [];
		const smallImage = images.length ? images[images.length - 1].label : '';
		// The 30-second audio preview is the link with rel="enclosure"
		const preview = (entry.link ?? []).find(
			(link) => link.attributes?.rel === 'enclosure',
		);
		return {
			name: entry['im:name'].label,
			artistName: entry['im:artist'].label,
			// Swap the small thumbnail size for a 500x500 version
			image: smallImage.replace(/\/\d+x\d+bb\.(png|jpg)$/, '/500x500bb.jpg'),
			previewUrl: preview?.attributes?.href ?? '',
		};
	});
};

export const addTrack = async (trackDetails) => {
	try {
		await fetch(`${apiUrl}/music`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('authToken')}`,
			},
			body: JSON.stringify(trackDetails),
		});
	} catch (error) {
		throw error;
	}
};

export const getSavedTracks = async () => {
	try {
		const request = await fetch(`${apiUrl}/music`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('authToken')}`,
			},
		});
		const result = await request.json();
		return result.map((track) => {
			return {
				...track,
				id: `${track.name}_${track.artistName}`,
			};
		});
	} catch (error) {
		throw error;
	}
};
//!!Need to code
export const deleteTrack = async (trackDetails) => {
	try {
		await fetch(`${apiUrl}/delete_track`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getCookie('authToken')}`,
			},
			body: JSON.stringify(trackDetails),
		});
	} catch (error) {
		throw error;
	}
};

function getCookie(cookiename) {
	if (typeof cookiename == 'string' && cookiename !== '') {
		const COOKIES = document.cookie.split(';');
		for (var i = 0; i < COOKIES.length; i++) {
			if (COOKIES[i].trim().startsWith(cookiename)) {
				return COOKIES[i].split('=')[1];
			}
		}
	}
	return null;
}
