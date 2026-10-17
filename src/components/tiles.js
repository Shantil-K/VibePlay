import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { addTrack, deleteTrack, getSavedTracks, getTopTracks } from '../utils';
import { AppContext } from '../AppContext';

const Tiles = ({ onlyShowSaved = false }) => {
	const { user, savedTracks, setSavedTracks } = useContext(AppContext);
	const [tracks, setTracks] = useState();
	const loggedIn = user.username !== '';
	useEffect(() => {
		async function fetchData() {
			// Saved tracks need the backend. If it can't be reached,
			// fall back to an empty list so the chart still loads.
			if (loggedIn && savedTracks === null) {
				try {
					setSavedTracks(await getSavedTracks());
				} catch (error) {
					console.error('Could not load saved tracks:', error);
					setSavedTracks([]);
				}
			}
			if (onlyShowSaved === false) {
				try {
					setTracks(await getTopTracks());
				} catch (error) {
					console.error('Could not load top tracks:', error);
					setTracks([]);
				}
			} else {
				setTracks(savedTracks);
			}
		}
		fetchData();
	}, [loggedIn, onlyShowSaved, savedTracks, setSavedTracks]);

	// One shared audio player, so only one preview plays at a time
	const audioRef = useRef(null);
	const [playingUrl, setPlayingUrl] = useState(null);

	useEffect(() => {
		const audio = new Audio();
		audio.addEventListener('ended', () => setPlayingUrl(null));
		audioRef.current = audio;
		// Stop playback when leaving the page
		return () => audio.pause();
	}, []);

	const togglePreview = (url) => {
		const audio = audioRef.current;
		if (playingUrl === url) {
			audio.pause();
			setPlayingUrl(null);
			return;
		}
		audio.src = url;
		audio.play().catch((error) => {
			console.error('Could not play preview:', error);
			setPlayingUrl(null);
		});
		setPlayingUrl(url);
	};

	return (
		<div className="flex flex-wrap">
			{onlyShowSaved && (!tracks || tracks.length === 0) && (
				<div>Oops, doesn't look like you've saved any tracks!</div>
			)}
			{tracks &&
				tracks.map((track) => (
					<div
						key={`${track.name}_${track.artistName}`}
						className="flex flex-col w-full xs:w-1/2 sm:w-1/3 md:w-1/4 p-2">
						<div className="relative">
							<img
								className="rounded w-full"
								alt={`${track.name} cover art`}
								src={track.image}
							/>
							{track.previewUrl && (
								<button
									type="button"
									onClick={() => togglePreview(track.previewUrl)}
									aria-label={
										playingUrl === track.previewUrl
											? `Pause preview of ${track.name}`
											: `Play preview of ${track.name}`
									}
									title={
										playingUrl === track.previewUrl ? 'Pause preview' : 'Play preview'
									}
									className="absolute bottom-2 right-2 w-12 h-12 flex items-center justify-center rounded-full bg-pink-500 hover:bg-black text-white shadow-lg">
									{playingUrl === track.previewUrl ? (
										<svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
											<rect x="6" y="5" width="4" height="14" rx="1" />
											<rect x="14" y="5" width="4" height="14" rx="1" />
										</svg>
									) : (
										<svg viewBox="0 0 24 24" className="w-6 h-6 ml-0.5" fill="currentColor">
											<path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
										</svg>
									)}
								</button>
							)}
						</div>
						<div className="text-sm truncate">{track.name}</div>
						<div className="text-xs">{track.artistName}</div>
						{!loggedIn ? (
							<Link
								to="/login"
								className="mt-auto bg-pink-500 hover:bg-black p-1.5 rounded text-white text-center">
								Log in to save
							</Link>
						) : (
						<button
							onClick={() => {
								if (onlyShowSaved) {
									const newSavedTracks = savedTracks.filter(
										(savedTrack) =>
											savedTrack.id !== `${track.name}_${track.artistName}`,
									);
									setSavedTracks(newSavedTracks);
									deleteTrack(track);
									setTracks(newSavedTracks);
								} else {
									if (
										savedTracks.some(
											(savedTrack) =>
												savedTrack.id === `${track.name}_${track.artistName}`,
										) === false
									) {
										const currentTracks = savedTracks ?? [];
										addTrack(track);
										track.id = `${track.name}_${track.artistName}`;
										setSavedTracks([...currentTracks, track]);
									}
								}
							}}
							type="submit"
							className="mt-auto bg-pink-500 hover:bg-black p-1.5 rounded text-white">
							{(savedTracks ?? []).some(
								(savedTrack) =>
									savedTrack.id === `${track.name}_${track.artistName}`,
							)
								? onlyShowSaved
									? 'Remove Track'
									: 'Track Saved'
								: 'Save Track'}
						</button>
						)}
					</div>
				))}
		</div>
	);
};

export default Tiles;
