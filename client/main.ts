import { render } from 'lit-html';
import { rootTemplate } from './render';
import { createStore } from  './state';

export default function init() {
  const store = createStore();
  render(rootTemplate(store), document.body);

  store.subscribe(() => {
    render(rootTemplate(store), document.body);
  });
}

init();
