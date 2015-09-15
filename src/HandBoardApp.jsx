import React from 'react/addons';
import Reflux from 'reflux';
import {randomInt} from './randomize';
import localstorage from './localstorage';
import HandBoard from './HandBoard.jsx';

const storage = localstorage('handboard');

const Actions = Reflux.createActions([
  'initialize',
  'nextLetter',
  'placeLetter'
]);


const Store = Reflux.createStore({

  listenables: Actions,

  init() {
    const defaults = {
      letters: [],
      remainingLetters: [],
      columnCount: 12,
      fontFamily: 'serif',
      placedLetters: [],
      currentLetter: null,
      currentIndex: null
    };

    //const data = storage.get('state', {});
    //this.data = {...defaults, ...data};
    this.data = {...defaults};
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


  onInitialize(data) {
    let {letters, ...otherData} = data;
    letters = letters.split('');
    let count = letters.length,
        remainingLetters = [],
        placedLetters = new Array(count);
    for (let i = 0; i < count; i++) {
      remainingLetters[i] = {char: letters[i], index: i};
    }
    for (let i = 0; i < count; i++) {
      placedLetters[i] = {char: letters[i], shown: false};
    }
    this.data = {...this.data, ...otherData, letters, remainingLetters, placedLetters};
    Actions.nextLetter();
  },

  onNextLetter() {
    if (this.data.currentLetter) {
      return;
    }
    const remainingLetters = [...this.data.remainingLetters],
          randomIndex = randomInt(0, remainingLetters.length),
          [currentLetter] = remainingLetters.splice(randomIndex, 1);
    console.debug('Next letter is', currentLetter);
    this.data = {...this.data, currentLetter, remainingLetters};
  },

  onPlaceLetter(row, col) {
    if (!this.data.currentLetter) {
      return;
    }
    const {currentLetter, columnCount} = this.data,
          placedLetters = [...this.data.placedLetters],
          index = row * columnCount + col;
    console.debug('Selected index', index, 'should be', currentLetter.index);
    if (currentLetter.index === index) {
      placedLetters[index] = {char: currentLetter.char, shown: true};
      this.data = {...this.data,
                   currentLetter: null,
                   placedLetters};
      Actions.nextLetter();
    }
  }

});

const CurrentLetter = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  styleSmall: {
    fontSize: '15vw'
  },

  styleLarge: {
    fontSize: '20vw'
  },

  render: function() {

    const {char, index} = this.props.letter || {},
          small = (index % 2) === 1;

    const styleSmall = {
      ...this.styleSmall,
      color: small ? 'black' : 'lightgrey'
    };

    const styleLarge = {
      ...this.styleLarge,
      color: !small ? 'black' : 'lightgrey'
    };

    return (
      <div>
        <span style={styleSmall}>{char}</span>
        <span style={styleLarge}>{char}</span>
      </div>
    );
  }
});


export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin,
    Reflux.connect(Store)
  ],

  componentDidMount() {
    Actions.initialize(this.props.initialData);
  },

  nextLetter() {
    Actions.nextLetter();
  },

  placeLetter(row, col) {
    console.debug('place letter', row, col);
    Actions.placeLetter(row, col);
  },

  render: function() {

    const progress = 100 * (this.state.letters.length - this.state.remainingLetters.length) / this.state.letters.length;

    return (
      <div style={{margin: '0.5rem'}}>
        <div style={{textAlign: 'center'}}>
          <CurrentLetter letter={this.state.currentLetter} />
        </div>
        <div>
          <HandBoard onSelection={this.props.placeLetter}
                     letters={this.state.placedLetters}
                     fontFamily={this.props.fontFamily}
                     columnCount={this.state.columnCount}
                     onPlaceSelected={this.placeLetter}
          />
        </div>
        <div style={{height: '0.5rem',
                     width: ''+progress+'%',
                     border: 'thin solid grey',
                     backgroundColor: 'green'}}>
        </div>
      </div>
    );
  }
});
