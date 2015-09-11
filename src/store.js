import Reflux from 'reflux';
import Immutable from 'immutable';
import Actions from './actions';
import randomize from './randomize';

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
    this._data = {
      letters: generate(),
      columnCount: 12,
      fontSize: 20
    };
  },

  getInitialState() {
    return this.data;
  },

  get data() {
    return this._data;
  },

  set data(newValue) {
    this._data = newValue;
    this.trigger(this._data);
  },

  onRegenerate() {
    this.data = {...this.data, letters: generate()};
  },

  onSetFontSize(fontSize) {
    this.data = {...this.data, fontSize};
  }

});
