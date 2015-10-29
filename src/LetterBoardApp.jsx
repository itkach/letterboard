import 'babel-core/polyfill';
import React from 'react';
import Reflux from 'reflux';
import keymaster from 'keymaster';
import Icon from 'react-fontawesome';
import uuid from 'uuid';
import screenfull from 'screenfull';
import ColorPicker from 'react-color';

import LetterBoard from './LetterBoard.jsx';
import QRCode from './QRCode.jsx';
import If from './If.jsx';
import run from './run';
import Connect from './Connect.jsx';

import {
  Navbar,
  Nav,
  NavItem,
  Button,
  ButtonGroup,
  Input,
  Modal,
  Alert
} from 'react-bootstrap';

import randomize from './randomize';
import localstorage from './localstorage';

const defaultKeyFilter = keymaster.filter;

const Actions = Reflux.createActions([
  'setFontSize',
  'decreaseFontSize',
  'increaseFontSize',
  'setFontFamily',
  'nextFont',
  'setLetterVSpacing',
  'decreaseLetterVSpacing',
  'increaseLetterVSpacing',
  'setLetterHSpacing',
  'decreaseLetterHSpacing',
  'increaseLetterHSpacing',
  'setLetterSet',
  'nextLetterSet',
  'setBackground',
  'setForeground',
  'regenerate',
  'setProfile',
  'nextProfile',
  'saveProfile',
  'showSaveProfile',
  'hideSaveProfile',
  'deleteProfile',
  'showDeleteProfileConfirmation',
  'hideDeleteProfileConfirmation',
  'confirmDeleteProfile',
  'lockProfile',
  'unlockProfile',
  'toggleProfileLock',
  'moveUp',
  'moveDown',
  'moveLeft',
  'moveRight',
  'resetPosition',
  'showHandBoardQR',
  'hideHandBoardQR',
  'openHandBoard',
  'notifyFullScreen',
  'toggleFullScreen'
]);


keymaster('q', 'main', Actions.showHandBoardQR);
keymaster('shift+r', 'main', Actions.regenerate);
keymaster(']', 'main', Actions.increaseFontSize);
keymaster('[', 'main', Actions.decreaseFontSize);
keymaster('.', 'main', Actions.increaseLetterHSpacing);
keymaster(',', 'main', Actions.decreaseLetterHSpacing);
keymaster('\'', 'main', Actions.increaseLetterVSpacing);
keymaster(';', 'main', Actions.decreaseLetterVSpacing);
keymaster('l', 'main', Actions.nextLetterSet);
keymaster('shift+f', 'main', Actions.nextFont);
keymaster('f', 'main', Actions.toggleFullScreen);
keymaster('space', 'main', Actions.nextProfile);
keymaster('shift+l', 'main', Actions.toggleProfileLock);
keymaster('n', 'main', Actions.showSaveProfile);
keymaster('shift+d', 'main', Actions.showDeleteProfileConfirmation);
keymaster('enter', 'delete-confirmation-dialog', Actions.confirmDeleteProfile);
keymaster('up', 'main', () => Actions.moveUp(1));
keymaster('down', 'main', () => Actions.moveDown(1));
keymaster('left', 'main', () => Actions.moveLeft(1));
keymaster('right', 'main', () => Actions.moveRight(1));
keymaster('shift+up', 'main', () => Actions.moveUp(3));
keymaster('shift+down', 'main', () => Actions.moveDown(3));
keymaster('shift+left', 'main', () => Actions.moveLeft(3));
keymaster('shift+right', 'main', () => Actions.moveRight(3));
keymaster('0', 'main', Actions.resetPosition);
keymaster.setScope('main');


const storage = localstorage('letterboard');


const getAbsoluteURL = url => {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
};


const generate = letterSet => {
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


const profileStorageKey = id => 'p:' + id,
      DEFAULT_PROFILE_ID = 'default';


const Profiles = Reflux.createStore({

  listenables: Actions,

  defaults: {
    current: DEFAULT_PROFILE_ID,
    available: {[DEFAULT_PROFILE_ID]: 'Default'}
  },

  profileComparator: (a, b) => {
    const [aName] = a, [bName] = b;
    return aName.localeCompare(bName);
  },

  init() {
    const data = storage.get('profiles', {});
    this.data = {...this.defaults, ...data};
  },

  getInitialState() {
    const profileNames = new Map(this.getSorted());
    return {...this._data, profileNames};
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
    const profileNames = new Map(this.getSorted());
    this.trigger({...this._data, profileNames});
  },

  set(change) {
    this.data = {...this.data, ...change};
  },

  onSetProfile(id) {
    this.set({current: id});
  },

  getSorted() {
    const asObj = this.data.available,
          result = [];
    for (let id of Object.keys(asObj)) {
      let name = asObj[id];
      result.push([name, id]);
    }
    return result.sort(this.profileComparator);
  },

  onNextProfile() {
    console.log('Next profile');
    const currentId = this.data.current;
    this.getSorted().every(([name, id], index, list) => {
      console.log(currentId, id, name);
      if (currentId === id) {
        let next = index + 1 < list.length ? list[index + 1] : list[0],
            nextId = next[1];
        Actions.setProfile(nextId);
        return false;
      }
      return true;
    });
  },

  onSaveProfile(name, settings) {
    Actions.hideSaveProfile();
    const id = uuid.v4();
    storage.set(profileStorageKey(id), settings);
    const available = {...this.data.available, [id]: name};
    this.set({available, current: id});
  },

  onShowSaveProfile() {
    keymaster.filter = () => true;
    keymaster.setScope('save-as-dialog');
    this.set({showSaveProfile: true});
  },

  onHideSaveProfile() {
    keymaster.filter = defaultKeyFilter;
    keymaster.setScope('main');
    this.set({showSaveProfile: false});
  },

  onDeleteProfile(id) {
    storage.remove(profileStorageKey(id));
    const available = {...this.data.available};
    delete available[id];
    this.set({available, current: Object.keys(available)[0]});
  },

  onShowDeleteProfileConfirmation() {
    keymaster.setScope('delete-confirmation-dialog');
    this.set({showDeleteProfileConfirmation: true});
  },

  onHideDeleteProfileConfirmation() {
    keymaster.setScope('main');
    this.set({showDeleteProfileConfirmation: false});
  },

  onConfirmDeleteProfile() {
    Actions.hideDeleteProfileConfirmation();
    Actions.deleteProfile(this.data.current);
  }

});


function ifUnlocked(target, key, descriptor) {
  const newFunc = function() {
    if (this.data.locked) {
      return;
    }
    return descriptor.value.apply(this, arguments);
  };
  return {
    ...descriptor,
    value: newFunc
  };
}


const Settings = Reflux.createStore({

  LETTER_SETS: [
    'ABCDEFGHIJKLNOPRSTUVWXYZ',
    'АБВГДЕЖЗИКЛМНОПРСТУФХЧШЯ',
    'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
    'ԺԻԽԾԿՀՁՂՃՄՅՆՇՈՉՊՋՍՎՐՑՒՔՖ',
    'ႠႡႢႣႥႦႧႨႩႫႬႭႮႰႱႲႵႹႻႼႾႿჁჄ',
    'अइऊऋऌएऑकखगघङचछजझञटठडढणतथ',
    'オカキクケコシスセソタテトナニヌノヒフヘホマミヨ',
    'תשרקץצףפעסנמלךכטחזוהדגבא',
    'กขคงจฉชฑดถทธนบผมยรลวศหอฯ',
    'ፏሃለሐመሠረሰየቀጦበቧቨተግኀነአከወዐዠጠ',
    'ᚠᚢᚦᚨᚱᚳᚷᚹᚻᛇᛈᛉᛏᛒᛖᛗᛚᛟᛝᛞᚣᛡᛠᚾ'
  ],

  FONT_FAMILIES: [
    'sans-serif',
    'serif',
    'monospace'
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
      background: {a: 1, r: 255, g: 255, b: 255},
      foreground: {a: 1, r: 0, g: 0, b: 0},
      top: 0,
      left: 0,
      showQR: false
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

  set(change) {
    this.data = {...this.data, ...change};
  },

  _onProfileChange(profiles) {
    console.debug('Profiles changed', profiles);
    this.profiles = profiles;
    this.loadCurrentProfile();
  },

  loadCurrentProfile() {
    const data = storage.get(this.storageKey, {});
    data.fullScreen = screenfull.enabled && screenfull.isFullscreen;
    this.data = {...this.defaults, ...data};
  },

  get handboardUrl() {
    const {letters, fontFamily} = this.data;
    return getAbsoluteURL('./handboard.html') + '#' +
           encodeURIComponent(JSON.stringify({letters, fontFamily}));
  },

  onRegenerate() {
    this.set({letters: generate(this.data.letterSet)});
  },

  @ifUnlocked
  onSetFontSize(fontSize) {
    if (fontSize < 1) {
      fontSize = 1;
    }
    this.set({fontSize});
  },

  onIncreaseFontSize() {
    const {fontSize} = this.data;
    Actions.setFontSize(fontSize + 1);
  },

  onDecreaseFontSize() {
    const {fontSize} = this.data;
    Actions.setFontSize(fontSize - 1);
  },

  @ifUnlocked
  onSetFontFamily(fontFamily) {
    this.set({fontFamily});
  },

  @ifUnlocked
  onSetLetterVSpacing(letterVSpacing) {
    if (letterVSpacing < 0) {
      letterVSpacing = 0;
    }
    this.set({letterVSpacing});
  },

  onIncreaseLetterVSpacing() {
    const {letterVSpacing} = this.data;
    Actions.setLetterVSpacing(letterVSpacing + 1);
  },

  onDecreaseLetterVSpacing() {
    const {letterVSpacing} = this.data;
    Actions.setLetterVSpacing(letterVSpacing - 1);
  },

  @ifUnlocked
  onSetLetterHSpacing(letterHSpacing) {
    this.set({letterHSpacing});
  },

  onIncreaseLetterHSpacing() {
    const {letterHSpacing} = this.data;
    Actions.setLetterHSpacing(letterHSpacing + 1);
  },

  onDecreaseLetterHSpacing() {
    const {letterHSpacing} = this.data;
    Actions.setLetterHSpacing(letterHSpacing - 1);
  },

  @ifUnlocked
  onSetLetterSet(letterSet) {
    const letters = generate(letterSet);
    this.set({letterSet, letters});
  },

  @ifUnlocked
  onSetBackground(background) {
    this.set({background});
  },

  @ifUnlocked
  onSetForeground(foreground) {
    this.set({foreground});
  },

  onLockProfile() {
    this.set({locked: true});
  },

  onUnlockProfile() {
    this.set({locked: false});
  },

  onToggleProfileLock() {
    if (this.data.locked) {
      Actions.unlockProfile();
    }
    else {
      Actions.lockProfile();
    }
  },

  @ifUnlocked
  onMoveUp(speed = 1) {
    const {top} = this.data;
    this.set({top: top - speed});
  },

  @ifUnlocked
  onMoveDown(speed = 1) {
    const {top} = this.data;
    this.set({top: top + speed});
  },

  @ifUnlocked
  onMoveLeft(speed = 1) {
    const {left} = this.data;
    this.set({left: left - speed});
  },

  @ifUnlocked
  onMoveRight(speed = 1) {
    const {left} = this.data;
    this.set({left: left + speed});
  },

  @ifUnlocked
  onResetPosition() {
    this.set({top: 0, left: 0});
  },

  onShowHandBoardQR() {
    keymaster.setScope('open-handboard-dialog');
    const handboardUrl = this.handboardUrl;
    this.set({showQR: true, handboardUrl});
  },

  onHideHandBoardQR() {
    keymaster.setScope('main');
    this.set({showQR: false});
  },

  onOpenHandBoard() {
    Actions.hideHandBoardQR();
    window.open(this.handboardUrl);
  },

  nextValue(values, stateAttr, action) {
    const current = values.indexOf(this.data[stateAttr]),
          next = current + 1 < values.length ? current + 1 : 0;
    action(values[next]);
  },

  onNextLetterSet() {
    this.nextValue(this.LETTER_SETS,
                   'letterSet',
                   Actions.setLetterSet);
  },

  onNextFont() {
    this.nextValue(this.FONT_FAMILIES,
                   'fontFamily',
                   Actions.setFontFamily);
  },

  onNotifyFullScreen(fullScreen) {
    this.set({fullScreen});
  }

});


if (screenfull.enabled) {
  document.addEventListener(
    screenfull.raw.fullscreenchange,
    () => Actions.notifyFullScreen(screenfull.isFullscreen)
  );
}

Actions.toggleFullScreen.listen(() => {
  if (screenfull.enabled) {
    screenfull.toggle();
  }
});


const OpenHandBoardDialog = ({showQR, handboardUrl}) => {

  return <Modal show={showQR} onHide={Actions.hideHandBoardQR}>
    <Modal.Header closeButton>
      <Modal.Title>Hand Board Link</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        <QRCode size={'50vmin'} text={handboardUrl} />
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={() => Actions.openHandBoard()}>Open</Button>
    </Modal.Footer>
  </Modal>;
};


const DeleteConfirmationDialog = ({show, profile}) =>
  <Modal show={show}
         onHide={Actions.hideDeleteProfileConfirmation}>
    <Modal.Header closeButton>
      <Modal.Title>Delete {profile}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        Are you sure you want to delete profile <em>{profile}</em>?
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={Actions.hideDeleteProfileConfirmation}>No</Button>
      <Button bsStyle="danger" onClick={Actions.confirmDeleteProfile}>Yes</Button>
    </Modal.Footer>
  </Modal>
;


class NewProfileDialog extends React.Component {

  constructor() {
    super();
    this.updateName = this.updateName.bind(this);
    this.save = this.save.bind(this);
    this.state = {name: ''};
  }

  updateName(e) {
    this.setState({name: e.target.value});
  }

  canSave() {
    const name = this.state.name,
          {profileNames} = this.props,
          exists = profileNames.has(name);
    return name && !exists;
  }

  save() {
    if (this.canSave()) {
      Actions.saveProfile(this.state.name, this.props.settings);
      this.setState({name: ''});
    }
  }

  componentWillMount() {
    keymaster('enter', 'save-as-dialog', this.save);
  }

  componentWillUnmount() {
    keymaster.unbind('enter');
  }

  render() {

    const {name} = this.state,
          {show, profileNames} = this.props,
          exists = profileNames.has(name);

    return   <Modal show={show} onHide={Actions.hideSaveProfile}>
    <Modal.Header closeButton>
      <Modal.Title>Create New Profile</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        <Input type="text" autoFocus value={name} onChange={this.updateName} />
        <If test={exists}>
          <Alert bsStyle="danger">
            Profile <em>{name}</em> already exists
          </Alert>
        </If>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={Actions.hideSaveProfile}>Cancel</Button>
      <Button bsStyle="success" onClick={this.save}
              disabled={!this.canSave()}>
        Ok
      </Button>
    </Modal.Footer>
    </Modal>;
  }
}


const ProfileSelector = ({profiles, profileId}) => {

  const changeProfile = e => {
    const selection = e.target.value;
    if (selection === '_new') {
      Actions.showSaveProfile();
    }
    else if (selection === '_delete'){
      Actions.showDeleteProfileConfirmation();
    }
    else {
      Actions.setProfile(selection);
    }
  };

  return <form className="navbar-form navbar-left"
        style={{paddingLeft: 0, marginLeft: 0}}>
    <Input type="select"
           value={profileId}
           onChange={changeProfile}
           style={{marginLeft: 0}} >
    <optgroup label="Profiles">
      {
        Array.from(profiles).map(
          ([name, id]) => <option key={id} value={id}>{name}</option>
        )
      }
    </optgroup>
    <optgroup label="Manage" >
      <option value="_new">New...</option>
      <option value="_delete">Delete...</option>
    </optgroup>
      </Input>
  </form>;
};


const ColorLabel = ({color}) =>
  <div style={{width: '20px',
               height: '100%',
               borderRadius: '2px',
               background: color}} />
;


const rgba = ({a, r, g, b}) => `rgba(${r}, ${g}, ${b}, ${a})`;


class ColorButton extends React.Component {

  constructor() {
    super();
    this.state = {
      displayColorPicker: false,
      color: {rgb: {a: 1, r: 255, g: 255, b: 255}}
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleClick() {
    if (this.props.locked) {
      return;
    }
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  }

  handleClose() {
    this.setState({ displayColorPicker: false });
  }

  handleChange(color) {
    this.props.onChange(color.rgb);
  }

  render() {

    const color = rgba(this.props.value);

    return (
      <div style={{display: 'inline-block', marginLeft: 2, marginRight: 2}}>
        <div className="form-control" onClick={ this.handleClick }>
          <ColorLabel color={color} />
        </div>
        <ColorPicker
            color={color}
            position="below"
            display={this.state.displayColorPicker}
            onChange={this.handleChange}
            onClose={this.handleClose}
            type="chrome" />
      </div>
    );
  }
}


const SettingsEditor = ({settings, locked}) => {

  const labelStyle = {marginLeft: 8, marginRight: 20, maxWidth: '7rem'},
        changeFontFamily = e => {
          Actions.setFontFamily(e.target.value);
        },
        changeFontSize =  e => {
          const fontSize = parseFloat(e.target.value);
          Actions.setFontSize(fontSize);
        },
        changeLetterHSpacing = e => {
          const value = parseFloat(e.target.value);
          Actions.setLetterHSpacing(value);
        },
        changeLetterVSpacing = e => {
          const value = parseFloat(e.target.value);
          Actions.setLetterVSpacing(value);
        };


  return (
    <form className="navbar-form navbar-left">
      <div className="form-group">

        <Input type="select"
               disabled={locked}
               label={<Icon name="font" />}
                            value={settings.fontFamily}
                            onChange={changeFontFamily}
                            style={{marginLeft: 8, marginRight: 2}} >
        {Settings.FONT_FAMILIES.map(x => <option key={x} value={x}>{x}</option>)}
        </Input>

        <Input type="number"
               disabled={locked}
               value={settings.fontSize}
               onChange={changeFontSize}
               min="1"
               style={{...labelStyle, marginLeft: 2, marginRight: 2}} />

        <ButtonGroup style={{marginRight: 20}} >
          <ColorButton value={settings.foreground}
                       onChange={Actions.setForeground}
                       locked={locked} />
          <ColorButton value={settings.background}
                       onChange={Actions.setBackground}
                       locked={locked} />
        </ButtonGroup>


        <Input type="number"
               disabled={locked}
               label={<Icon name="text-width" />}
                            value={settings.letterHSpacing}
                            onChange={changeLetterHSpacing}
                            min="0"
                            style={labelStyle} />


        <Input type="number"
               disabled={locked}
               label={<Icon name="text-height" />}
                            value={settings.letterVSpacing}
                            onChange={changeLetterVSpacing}
                            min="0"
                            style={labelStyle} />

      </div>
    </form>
  );
};


const LetterSetSelector = ({settings, locked}) =>
  <form className="navbar-form navbar-left">
    <Input type="select"
           disabled={locked}
           value={settings.letterSet}
           onChange={e => Actions.setLetterSet(e.target.value)} >
      {
        Settings.LETTER_SETS.map(
          s => <option key={s} value={s}>{s.substr(0, 6)}</option>
        )
      }
    </Input>
  </form>
;


const App = ({profiles, settings}) => {

  const {fullScreen, locked} = settings,
        profileId = profiles.current,
        profile = profiles.available[profileId],
        {profileNames} = profiles,
        letters = settings.letters.map(letter => ({char: letter, shown: true}));

  return <div style={{position: 'absolute',
                      top: 0, bottom: 0, left: 0, right: 0,
                      backgroundColor: rgba(settings.background)
                     }}>

    <OpenHandBoardDialog {...settings} />

    <DeleteConfirmationDialog show={profiles.showDeleteProfileConfirmation}
                              profile={profile} />

    <NewProfileDialog show={profiles.showSaveProfile}
                      profileNames={profileNames}
                      settings={settings} />

    <If test={!fullScreen}>
      <Navbar fluid>

        <Nav>
          <NavItem onSelect={Actions.toggleProfileLock}>
            <Icon name={locked ? "lock" : "unlock"}/>
          </NavItem>
          <ProfileSelector profiles={profileNames}
                           profileId={profileId}/>
        </Nav>

        <Nav>
          <SettingsEditor settings={settings} locked={locked} />
        </Nav>

        <Nav right>
          <LetterSetSelector settings={settings} locked={locked} />
          <NavItem onSelect={Actions.showHandBoardQR}><Icon name="qrcode" /></NavItem>
          <NavItem onSelect={Actions.toggleFullScreen} disabled={!screenfull.enabled}>
            <Icon name="tv" />
          </NavItem>
          <NavItem onSelect={Actions.regenerate}><Icon name="refresh" /></NavItem>
        </Nav>

      </Navbar>
    </If>

    <div style={{position: 'relative', color: rgba(settings.foreground)}}>
      <LetterBoard {...settings}
                   letters = {letters}
                   style={{position: 'relative',
                           top: settings.top,
                           left: settings.left}}
      />
    </div>

  </div>;

};

const Root = () =>
  <Connect
      component={App}
      to={[[Settings, 'settings'], [Profiles, 'profiles']]}
  />
;

run(Root);
