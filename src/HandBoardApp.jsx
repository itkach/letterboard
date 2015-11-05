import 'babel-core/polyfill';
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './style.css';

import Icon from 'react-fontawesome';
import Reflux from 'reflux';
import initTapEventPlugin from 'react-tap-event-plugin';
import screenfull from 'screenfull';

import {
  Button,
  Modal,
  Alert
} from 'react-bootstrap';

import Connect from './Connect.jsx';
import If from './If.jsx';
import LetterBoard from './LetterBoard.jsx';
import localstorage from './localstorage';
import run from './run';
import {randomInt} from './randomize';


initTapEventPlugin();


const storage = localstorage('handboard');


const Actions = Reflux.createActions([
  'initialize',
  'start',
  'pause',
  'togglePause',
  'resume',
  'nextLetter',
  'placeLetter',
  'showConfirmReset',
  'hideConfirmReset',
  'confirmReset'
]);


Actions.resume.listen(() => {
  if (screenfull.enabled) {
    screenfull.request();
  }
});


Actions.pause.listen(() => {
  if (screenfull.enabled) {
    screenfull.exit();
  }
});


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

    const hash = window.location.hash;

    if (hash) {
      try {
        this.initialData = JSON.parse(decodeURIComponent(hash.substr(1)));
        Actions.initialize(this.initialData);
      }
      catch (ex) {
        console.error(ex);
        this.set({letters: []});
      }
    }
    else {
      this.set({letters: []});
    }

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

  set(change) {
    this.data = {...this.data, ...change};
  },

  onInitialize(data, force) {
    this.stopTimer();
    let {letters, ...otherData} = data,
        currentLetters =  this.data.letters.join('');
    if (letters === currentLetters && !force) {
      console.debug('Already initialized for these letters', letters);
      this.set({paused: true, done: false, fontFamily: data.fontFamily});
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
    this.set({paused: false, elapsed: 0});
    Actions.resume();
  },

  stopTimer() {
    clearInterval(this.interval);
    this.interval = null;
  },

  onPause() {
    this.stopTimer();
    this.set({paused: true});
  },

  togglePause() {
    if (this.data.done) {
      return;
    }
    if (this.data.paused) {
      Actions.resume();
    }
    else {
      Actions.pause();
    }
  },

  onResume() {
    if (this.interval) {
      return;
    }
    this.interval = setInterval(
      () => this.set({elapsed: this.data.elapsed + 1}),
      1000
    );
    this.set({paused: false});
  },

  onNextLetter(override) {
    if (this.data.currentLetter && !override) {
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
    this.set({currentLetter, remainingLetters, done, paused});
  },

  onPlaceLetter(row, col) {
    if (this.data.paused) {
      return;
    }
    if (!this.data.currentLetter) {
      return;
    }
    const {currentLetter, columnCount} = this.data,
          placedLetters = [...this.data.placedLetters],
          index = row * columnCount + col;
    console.debug('Selected index', index, 'should be', currentLetter.index);
    if (currentLetter.index === index) {
      placedLetters[index] = {char: currentLetter.char, shown: true};
      this.set({placedLetters});
      Actions.nextLetter(true);
    }
  },

  onHideConfirmReset() {
    this.set({showConfirmReset: false});
  },

  onShowConfirmReset() {
    Actions.pause();
    this.set({showConfirmReset: true});
  },

  onConfirmReset() {
    Actions.hideConfirmReset();
    Actions.initialize(this.initialData, true);
  }

});


const CurrentLetter = ({letter, fontFamily}) => {

    const {char, index} = letter || {},
          small = (index % 2) === 1;

    const styleSmall = {
      fontSize: '60%',
      fontFamily,
      color: small ? 'black' : 'lightgrey'
    };

    const styleLarge = {
      fontFamily,
      color: !small ? 'black' : 'lightgrey'
    };

    return (
      <div>
        <span style={{cursor: 'pointer'}}
              onTouchTap={Actions.pause}>
          <span style={styleSmall}>{char}</span>
          <span style={styleLarge}>{char}</span>
        </span>
      </div>
    );
  }
;


const PlayButton = () =>
  //Zero-width space ensures browsers such as Chrome on iOS
  //render this div with height as if it contains text
  <div>
    {'\u200B'}
    <Icon
        name="play"
        style={{cursor: 'pointer'}}
        onTouchTap={Actions.resume}
    />
  </div>
;


const WellDone = () =>
  <div style={{color: 'green'}}>
    <Icon name="check" />
  </div>
;


const Elapsed = ({className, value}) => {

  const dt = value,
        minutes = Math.floor(dt / 60),
        seconds = Math.floor(dt % 60),
        pad = value => (value < 10 ? '0' : '') + value,
        paddedMinutes = pad(minutes),
        paddedSeconds = pad(seconds);
  return (
    <span style={{marginLeft: '0.5rem'}}
          className={className}>
      {paddedMinutes}:{paddedSeconds}
    </span>
  );
};


const ConfirmResetDialog = ({show}) =>
  <Modal show={show} onHide={Actions.hideConfirmReset}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Reset</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        Are you sure you want to start over?
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={Actions.hideConfirmReset}>No</Button>
      <Button onClick={Actions.confirmReset}>Yes</Button>
    </Modal.Footer>
  </Modal>
;


const ButtonTogglePause = ({done, paused, elapsed}) =>
  <Button onTouchTap={Actions.togglePause}
          style={{position: 'absolute', margin: '0.5rem'}}>
    <If test={!done}>
      <Icon name={paused ? 'play' : 'pause'} />
    </If>
    <Elapsed value={elapsed} />
  </Button>
;


const ButtonReset = () =>
  <Button onTouchTap={Actions.showConfirmReset}
          style={{position: 'absolute', right: 0, margin: '0.5rem'}}>
    <Icon name="refresh" />
  </Button>
;


const Progress = ({value}) =>
  <div style={{height: '0.5rem',
               width: `${value}%`,
               marginTop: '1rem',
               border: 'thin solid grey',
               backgroundColor: 'green'}}>
</div>
;


const CurrentLetterBox = ({size, children}) =>
  <div style={{textAlign: 'center',
               fontSize: size,
               lineHeight: size,
               height: size}} >
    {children}
  </div>
;


const HandBoardApp = (
  {
    letters,
    placedLetters,
    remainingLetters,
    currentLetter,
    fontFamily,
    columnCount,
    done,
    paused,
    elapsed,
    showConfirmReset
  }
) => {

  const count = letters.length,
        remainingCount = remainingLetters.length,
        progress = 100 * (count - (remainingCount + (currentLetter ? 1 : 0))) / count;

  if (count === 0) {
    return <Alert bsStyle="danger">No valid data given</Alert>;
  }

  return <div>
    <ConfirmResetDialog show={showConfirmReset} />

    <ButtonTogglePause {...{done, paused, elapsed}} />

    <ButtonReset />

    <div style={{margin: '0.5rem'}}>

      <CurrentLetterBox size='18vh'>
        <If test={done}>
          <WellDone />
        </If>
        <If test={paused && !done}>
          <PlayButton />
        </If>
        <If test={!paused}>
          <CurrentLetter letter={currentLetter} fontFamily={fontFamily} />
        </If>
      </CurrentLetterBox>

      <LetterBoard
          columnCount={columnCount}
          fontFamily={fontFamily}
          fontSize='5vw'
          letters={placedLetters}
          onSelection={Actions.placeLetter}
          showBorder
          style={{width: '100%', marginTop: '0.5rem'}}
      />

      <Progress value={progress} />

    </div>

  </div>;
};


run(
  () => <Connect component={HandBoardApp} to={[[Store]]} />
);
