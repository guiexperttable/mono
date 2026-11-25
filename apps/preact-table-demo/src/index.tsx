import { render } from 'preact';

// the table CSS of this repository (not the CDN copy of the last npm release – the code comes from packages/table/src, too)
import '../../../packages/table/css/main.css';
import './index.css';
import App from './App';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<App />, document.getElementById('root')!);
