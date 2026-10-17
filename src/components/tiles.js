import { useContext, useEffect, useState } from 'react';
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
						<img
							className="rounded"
							alt={`${track.name} cover art`}
							src={track.image}
						/>
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
