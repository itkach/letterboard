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
      fontSize: 20,
      letterHSpacing: 0,
      letterVSpacing: 0,
      fontFamily: 'serif'
    };

    const data = storage.get('state', {});
    this.data = {...defaults, ...data};
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
  },

  onSetFontFamily(fontFamily) {
    this.data = {...this.data, fontFamily};
  },

  onSetLetterVSpacing(letterVSpacing) {
    this.data = {...this.data, letterVSpacing};
  },

  onSetLetterHSpacing(letterHSpacing) {
    this.data = {...this.data, letterHSpacing};
  }


});
