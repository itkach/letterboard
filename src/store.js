import Reflux from 'reflux';
import Actions from './actions';
import randomize from './randomize';
import localstorage from './localstorage';
import uuid from 'uuid';

const storage = localstorage('letterboard');

const LETTERS = 'ABCDEFGHIJKLNOPRSTUVWXYZ';

const generate = (letterSet = LETTERS) => {
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


const profileStorageKey = id => 'p:' + id;

export const DEFAULT_PROFILE_ID = 'default';


export const Profiles = Reflux.createStore({

  listenables: Actions,

  defaults: {
    current: DEFAULT_PROFILE_ID,
    available: {[DEFAULT_PROFILE_ID]: 'Default'}
  },

  init() {
    const data = storage.get('profiles', {});
    this.data = {...this.defaults, ...data};
  },

  getInitialState() {
    return this.data;
  },

  get data() {
    return this._data;
  },

  set data(newValue) {
    const available = newValue.available;
    if (!available ||
        Object.keys(available).length === 0) {
      this._data = {...this.defaults};
    }
    else {
      this._data = newValue;
    }
    storage.set('profiles', this._data);
    this.trigger(this._data);
  },

  onSetProfile(id) {
    this.data = {...this.data, current: id};
  },

  onSaveProfile(name, settings) {
    const id = uuid.v4();
    storage.set(profileStorageKey(id), settings);
    const available = {...this.data.available, [id]: name};
    this.data = {...this.data, available, current: id};
  },

  onDeleteProfile(id) {
    storage.remove(profileStorageKey(id));
    const available = {...this.data.available};
    delete available[id];
    this.data = {...this.data, available, current: Object.keys(available)[0]};
  }

});


export default Reflux.createStore({

  LETTER_SETS: [
    'ABCDEFGHIJKLNOPRSTUVWXYZ',
    'АБВГДЕЖЗИКЛМНОПРСТУФХЧШЯ',
    'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    'ԺԻԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՍՎՐՑՒՔՖ',
    'ႠႡႢႣႥႦႧႨႩႫႬႭႮႰႱႲႵႹႻႼႾႿჁჂ',
    'अइऊऋऌएऑकखगघङचछजझञटठडढणतथ',
    'オカキクケコシスセソタテトナニヌノヒフヘホマミヨ',
    'תשרקץצףפעסנמלךכטחזוהדגבא'
  ],

  FONT_FAMILIES: [
    'sans-serif',
    'serif',
    'monospace'
  ],

  OVERLAY_COLORS: [
    null,
    'red',
    'green',
    'black'
  ],

  listenables: Actions,

  init() {

    const letterSet = this.LETTER_SETS[0];

    this.defaults = {
      letters: generate(letterSet),
      letterSet,
      columnCount: 12,
      fontSize: 20,
      letterHSpacing: 0,
      letterVSpacing: 0,
      fontFamily: 'serif',
      overlayColor: null
    };

    this._onProfileChange(Profiles.getInitialState());
    this.listenTo(Profiles, this._onProfileChange);
  },

  getInitialState() {
    return this.data;
  },

  get storageKey() {
    return profileStorageKey(this.profiles.current);
  },

  get data() {
    return this._data;
  },

  set data(newValue) {
    this._data = newValue;
    storage.set(this.storageKey, this._data);
    this.trigger(this._data);
  },

  _onProfileChange(profiles) {
    console.debug('Profiles changed', profiles);
    this.profiles = profiles;
    this.loadCurrentProfile();
  },

  loadCurrentProfile() {
    const data = storage.get(this.storageKey, {});
    this.data = {...this.defaults, ...data};
  },

  onRegenerate() {
    this.data = {...this.data, letters: generate(this.data.letterSet)};
  },

  onSetFontSize(fontSize) {
    if (this.data.locked) {
      return;
    }
    this.data = {...this.data, fontSize};
  },

  onSetFontFamily(fontFamily) {
    if (this.data.locked) {
      return;
    }
    this.data = {...this.data, fontFamily};
  },

  onSetLetterVSpacing(letterVSpacing) {
    if (this.data.locked) {
      return;
    }
    this.data = {...this.data, letterVSpacing};
  },

  onSetLetterHSpacing(letterHSpacing) {
    if (this.data.locked) {
      return;
    }
    this.data = {...this.data, letterHSpacing};
  },

  onSetLetterSet(letterSet) {
    if (this.data.locked) {
      return;
    }
    const letters = generate(letterSet);
    this.data = {...this.data, letterSet, letters};
  },

  onSetOverlayColor(overlayColor) {
    if (this.data.locked) {
      return;
    }
    this.data = {...this.data, overlayColor};
  },

  onLockProfile() {
    this.data = {...this.data, locked: true};
  },

  onUnlockProfile() {
    this.data = {...this.data, locked: false};
  }

});
