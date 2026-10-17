import { AppContext } from '../AppContext';
import { useContext } from 'react';
import Tiles from '../components/tiles';

const Home = () => {
	const { user } = useContext(AppContext);

	return user.username === '' ? (
		<div className="mt-8 px-4 flex flex-col items-center">
			<div className="text-3xl mb-4">Welcome to VibePlay</div>
			<div className="text-xl mt-4 mb-4 self-start ml-2.5">Top Songs</div>
			<Tiles />
		</div>
	) : (
		<div className="mt-4 px-4">
			<div className="text-xl mb-4 ml-2.5">
				<div className="flex">Hi {user.username}, welcome to VibePlay!</div>
			</div>
			<Tiles />
		</div>
	);
};

export default Home;
