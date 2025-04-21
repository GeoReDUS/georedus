// A simple Comlink worker that doubles a number
import * as Comlink from 'comlink';

const api = {
  double(x: number) {

    console.log('worker ahjahjahsjahjahjs')

    return x * 2;
  },
};

Comlink.expose(api);
