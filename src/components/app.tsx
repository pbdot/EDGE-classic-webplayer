import { h } from 'preact';

import Header from './header';
import Player from './player';

const App = () => (
	<div id="app">
		<Header />
		<main>
			<Player/>
		</main>
	</div>
);

export default App;
