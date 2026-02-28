import '../styles/global.css';
import type { AppProps } from 'next/app';
import { AudioProvider } from '../context/AudioContext'; // Adjust path if needed

const MyApp = ({ Component, pageProps }: AppProps) => (
  <AudioProvider>
    <Component {...pageProps} />
  </AudioProvider>
);

export default MyApp;