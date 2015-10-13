import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './style.css';

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Reflux from 'reflux';
import Icon from 'react-fontawesome';

import {randomInt} from './randomize';
import localstorage from './localstorage';
import HandBoard from './HandBoard.jsx';
import If from './If.jsx';

import initTapEventPlugin from 'react-tap-event-plugin';
import keymaster from 'keymaster';

import run from './run';

import {
  Button,
  Modal
} from 'react-bootstrap';


initTapEventPlugin();

keymaster.filter = () => true;


const storage = localstorage('handboard');

const Actions = Reflux.createActions([
  'initialize',
  'start',
  'pause',
  'resume',
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
    currentIndex: null,
    elapsed: 0,
    paused: true,
    done: false
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

  onInitialize(data, force) {
    let {letters, ...otherData} = data,
        currentLetters =  this.data.letters.join('');
    if (letters === currentLetters && !force) {
      console.debug('Already initialized for these letters', letters);
      this.data = {...this.data, paused: true, fontFamily: data.fontFamily};
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

    this.data = {...this.defaults, ...otherData, letters,
                 remainingLetters, placedLetters, paused: true};
    Actions.nextLetter();
  },

  onStart() {
    this.data = {...this.data, elapsed: 0};
    Actions.resume();
  },

  stopTimer() {
    clearInterval(this.interval);
    this.interval = null;
  },

  onPause() {
    this.stopTimer();
    this.data = {...this.data, paused: true};
  },

  onResume() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(
      () => this.data = {...this.data, elapsed: this.data.elapsed + 1},
      1000
    );
    this.data = {...this.data, paused: false};
  },

  onNextLetter() {
    if (this.data.currentLetter) {
      return;
    }
    const remainingLetters = [...this.data.remainingLetters],
          randomIndex = randomInt(0, remainingLetters.length),
          [currentLetter] = remainingLetters.splice(randomIndex, 1);
    console.debug('Next letter is', currentLetter);
    const done = (this.data.remainingLetters.length === 0  && !currentLetter),
          paused = this.data.paused || done;
    if (done) {
      this.stopTimer();
    }
    this.data = {...this.data, currentLetter, remainingLetters, done, paused};
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
    PureRenderMixin
  ],

  styleSmall: {
    fontSize: '10vh'
  },

  styleLarge: {
    fontSize: '16vh'
  },

  onTouchTap() {
    Actions.pause();
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
        <span style={{cursor: 'pointer'}}
             onTouchTap={this.onTouchTap}>
          <span style={styleSmall}>{char}</span>
          <span style={styleLarge}>{char}</span>
        </span>
      </div>
    );
  }
});



const PlayButton = React.createClass({

  mixins: [
    PureRenderMixin
  ],

  onTouchTap() {
    Actions.resume();
  },

  render: function() {
    //Zero-width space ensures browsers such as Chrome on iOS
    //render this div with height as if it contains text
    return (
      <div style={{fontSize: '16vh'}}>
        {'\u200B'}
        <Icon name="play"
              style={{cursor: 'pointer'}}
              onTouchTap={this.onTouchTap} />
      </div>
    );
  }
});


const WellDone = React.createClass({

  mixins: [
    PureRenderMixin
  ],

  render: function() {
    return (
      <div style={{fontSize: '16vh', color: 'green'}}>
        <Icon name="check" />
      </div>
    );
  }
});


const Elapsed = React.createClass({

  mixins: [
    PureRenderMixin
  ],

  pad(value) {
    return (value < 10 ? '0' : '') + value;
  },

  style: {
    marginLeft: '0.5rem'
  },

  render: function() {

    const dt = this.props.value,
          minutes = Math.floor(dt / 60),
          seconds = Math.floor(dt % 60),
          paddedMinutes = this.pad(minutes),
          paddedSeconds = this.pad(seconds);

    return (
      <span style={this.style} className={this.props.className}>
        {paddedMinutes}:{paddedSeconds}
      </span>
    );
  }
});


const HandBoardApp = React.createClass({

  mixins: [
    PureRenderMixin,
    Reflux.connect(Store)
  ],

  componentDidMount() {
    this.reset();
  },

  nextLetter() {
    Actions.nextLetter();
  },

  placeLetter(row, col) {
    if (this.state.paused) {
      return;
    }
    console.debug('place letter', row, col);
    Actions.placeLetter(row, col);
  },

  hideConfirmReset() {
    this.setState({showConfirmReset: false});
  },

  showConfirmReset() {
    this.setState({showConfirmReset: true});
  },

  reset(force = false) {
    Actions.initialize(this.props.initialData, force);
  },

  confirmReset() {
    this.hideConfirmReset();
    this.reset(true);
  },

  togglePause() {
    if (this.state.done) {
      return;
    }
    if (this.state.paused) {
      Actions.resume();
    }
    else {
      Actions.pause();
    }
  },

  render: function() {

    const progress = 100 * (this.state.letters.length - (
      this.state.remainingLetters.length +
      (this.state.currentLetter ? 1 : 0))) / this.state.letters.length;

    return (
      <div>

        <Modal show={this.state.showConfirmReset} onHide={this.hideConfirmReset}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Reset</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{textAlign: 'center'}}>
              Are you sure you want to start over?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideConfirmReset}>No</Button>
            <Button onClick={this.confirmReset}>Yes</Button>
          </Modal.Footer>
        </Modal>

        <Button onTouchTap={this.togglePause}
                style={{position: 'absolute', margin: '0.5rem'}}>
          <If test={!this.state.done}>
            <Icon name={this.state.paused ? 'play' : 'pause'} />
          </If>
           <Elapsed value={this.state.elapsed} />
        </Button>

        <Button onTouchTap={this.showConfirmReset}
                style={{position: 'absolute', right: 0, margin: '0.5rem'}}>
          <Icon name="refresh" />
        </Button>


        <div style={{margin: '0.5rem'}}>
          <div style={{textAlign: 'center'}}>
            <If test={this.state.done}>
              <WellDone />
            </If>
            <If test={this.state.paused && !this.state.done}>
              <PlayButton />
            </If>
            <If test={!this.state.paused}>
              <CurrentLetter letter={this.state.currentLetter}
                             fontFamily={this.state.fontFamily}/>
            </If>
          </div>
          <div>
            <HandBoard letters={this.state.placedLetters}
                       fontFamily={this.state.fontFamily}
                       columnCount={this.state.columnCount}
                       onPlaceSelected={this.placeLetter}
            />
          </div>
          <div style={{height: '0.5rem',
                       width: '' + progress + '%',
                       marginTop: '1rem',
                       border: 'thin solid grey',
                       backgroundColor: 'green'}}>
          </div>
        </div>
      </div>
    );
  }
});


const Root = React.createClass({

  mixins: [
    PureRenderMixin
  ],

  render: function() {

    const hash = window.location.hash;
    if (hash) {
      console.debug('hash', hash);
      try {
        const data = JSON.parse(decodeURIComponent(hash.substr(1)));
        if (data) {
          return <HandBoardApp initialData={data}/>;
        }
      }
      catch (ex) {
        console.error(ex);
      }
    }

    return (
      <div>No valid init data given</div>
    );
  }
});


run(Root);
