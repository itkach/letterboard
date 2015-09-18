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

  defaults: {
    letters: [],
    remainingLetters: [],
    columnCount: 12,
    fontFamily: 'serif',
    placedLetters: [],
    currentLetter: null,
    currentIndex: null
  },

  init() {
    const data = storage.get('state', {});
    this.data = {...this.defaults, ...data};
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
    let {letters, ...otherData} = data,
        currentLetters =  this.data.letters.join('');
    if (letters === currentLetters) {
      console.debug('Already initialized for these letters', letters);
      this.data = {...this.data, fontFamily: data.fontFamily};
      return;
    }
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

    const startTime = new Date().getTime();
    this.data = {...this.defaults, ...otherData, letters,
                 remainingLetters, placedLetters, startTime};
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

    const endTime = (this.data.remainingLetters.length === 0  && !currentLetter) ? new Date().getTime() : null;

    this.data = {...this.data, currentLetter, remainingLetters, endTime};
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
    fontSize: '10vh'
  },

  styleLarge: {
    fontSize: '16vh'
  },

  render: function() {

    const {char, index} = this.props.letter || {},
          small = (index % 2) === 1;

    const styleSmall = {
      ...this.styleSmall,
      fontFamily: this.props.fontFamily,
      color: small ? 'black' : 'lightgrey'
    };

    const styleLarge = {
      ...this.styleLarge,
      fontFamily: this.props.fontFamily,
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


const WellDone = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  style: {
    fontSize: '12vw',
    color: 'green'
  },

  render: function() {

    if (!this.props.done) {
      return null;
    }

    return (
      <div style={this.style}>
        Well done!
      </div>
    );
  }
});

const Elapsed = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {

    if (!this.props.start || !this.props.end) {
      return null;
    }

    const duration = Math.round((this.props.end - this.props.start) / (1000 * 60));

    return (
      <div>
        Done in {duration} min
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

    const progress = 100 * (this.state.letters.length - (
      this.state.remainingLetters.length +
      (this.state.currentLetter ? 1 : 0))) / this.state.letters.length;

    return (
      <div style={{margin: '0.5rem'}}>
        <div style={{textAlign: 'center'}}>
          <WellDone done={this.state.endTime} />
          <Elapsed start={this.state.startTime} end={this.state.endTime} />
          <CurrentLetter letter={this.state.currentLetter}
                         fontFamily={this.state.fontFamily}/>
        </div>
        <div>
          <HandBoard onSelection={this.props.placeLetter}
                     letters={this.state.placedLetters}
                     fontFamily={this.state.fontFamily}
                     columnCount={this.state.columnCount}
                     onPlaceSelected={this.placeLetter}
          />
        </div>
        <div style={{height: '0.5rem',
                     width: ''+progress+'%',
                     marginTop: '0.5rem',
                     border: 'thin solid grey',
                     backgroundColor: 'green'}}>
        </div>
      </div>
    );
  }
});
