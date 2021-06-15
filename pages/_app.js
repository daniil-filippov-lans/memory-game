import '../styles/globals.css';
import '../styles/index.css';

function MyApp({ Component, pageProps }) {
	return (
		<div id="root">
			<Component {...pageProps} />
		</div>
	);
}

export default MyApp;
