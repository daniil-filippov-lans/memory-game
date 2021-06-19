import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
	return (
		<div id="root">
			<Component {...pageProps} />
			<style jsx global>
				{`
					body {
						overflow: hidden;
					}

					#__next {
						display: flex;
						justify-content: center;
						flex-direction: column;
						align-items: center;
					}

					#root {
						position: absolute;
						top: 50%;
						transform: translateY(-50%);
					}
					.container {
						display: flex;
						flex-direction: column;
						justify-content: center;
						align-self: center;
					}
				`}
			</style>
		</div>
	);
}

export default MyApp;
