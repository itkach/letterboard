import Reflux from 'reflux';
import Immutable from 'immutable';
import Actions from './actions';
import randomize from './randomize';
import localstorage from './localstorage';

const storage = localstorage('letterboard');

const LETTERS = 'ABCDEFGHIJKLNOPRSTUVWXYZ';

const generate = () => {
  const large = randomize(LETTERS),
        small = randomize(LETTERS),
        count = large.length,
        result = [];

  for (let i = 0; i < count; i++) {
    result.push(large[i]);
    result.push(small[i]);
  }
  return result;
};


export default Reflux.createStore({

  listenables: Actions,

  init() {

    const defaults = {
      letters: generate(),
      columnCount: 12,
      fontSize: 20
    };

    const data = storage.get('state', {});
    this._data = {...defaults, ...data};
  },

  getInitialState() {
    return this.data;
  },

  get data() {
    return this._data;
  },

  set data(newValue) {
    this._data = newValue;
    storage.set('state', this._data);
    this.trigger(this._data);
  },

  onRegenerate() {
    this.data = {...this.data, letters: generate()};
  },

  onSetFontSize(fontSize) {
    this.data = {...this.data, fontSize};
  }

});
