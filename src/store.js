import Reflux from 'reflux';
import Actions from './actions';
import randomize from './randomize';
import localstorage from './localstorage';

const storage = localstorage('letterboard');

const LETTERS = 'ABCDEFGHIJKLNOPRSTUVWXYZ';

const generate = (letterSet=LETTERS) => {
  const large = randomize(letterSet),
        small = randomize(letterSet),
        count = large.length,
        result = [];

  for (let i = 0; i < count; i++) {
    result.push(large[i]);
    result.push(small[i]);
  }
  return result;
};


export default Reflux.createStore({

  LETTER_SETS: [
  'ABCDEFGHIJKLNOPRSTUVWXYZ',
  'АБВГДЕЖЗИКЛМНОПРСТУФХЧШЯ',
  'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
  'ԺԻԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՍՎՐՑՒՔՖ',
  'オカキクケコシスセソタテトナニヌノヒフヘホマミヨ'
  ],

  listenables: Actions,

  init() {

    const letterSet = this.LETTER_SETS[0];

    const defaults = {
      letters: generate(letterSet),
      letterSet,
      columnCount: 12,
      fontSize: 20,
      letterHSpacing: 0,
      letterVSpacing: 0,
      fontFamily: 'serif',
      overlayColor: null
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
    this.data = {...this.data, letters: generate(this.data.letterSet)};
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
  },

  onSetLetterSet(letterSet) {
    const letters = generate(letterSet);
    this.data = {...this.data, letterSet, letters};
  },

  onSetOverlayColor(overlayColor) {
    this.data = {...this.data, overlayColor};
  }

});
