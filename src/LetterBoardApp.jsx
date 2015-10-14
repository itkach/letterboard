import 'babel-core/polyfill';
import React from 'react';
import Reflux from 'reflux';
import keymaster from 'keymaster';
import Icon from 'react-fontawesome';
import LetterBoard from './LetterBoard.jsx';
import Actions from './actions';
import Store from './store';
import {Profiles} from './store';
import QRCode from './QRCode.jsx';
import If from './If.jsx';
import run from './run';

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


const defaultKeyFilter = keymaster.filter;


const getAbsoluteURL = url => {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
};


const NBSP = '\u00A0';


const OverlayToggleButton = ({color, disabled}) =>
  <Button style={{backgroundColor: color, opacity: color ? 0.3 : null}}
          onTouchTap={() => Actions.setOverlayColor(color)}
          disabled={disabled}>
    {NBSP}
  </Button>
;


const ColorOverlay = ({color}) =>
  <div style={{zIndex: 1000,
               backgroundColor: color,
               position: 'absolute',
               top: 0,
               bottom: 0,
               left: 0,
               right: 0,
               opacity: 0.4,
               width: '100%'}} />
;


const OpenHandBoardDialog = ({show, url, onHide, onOpenLink}) =>
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Hand Board Link</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        <QRCode size={'50vmin'} text={url} />
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={() => onOpenLink(url)}>Open Link</Button>
    </Modal.Footer>
  </Modal>
;


const DeleteConfirmationDialog = ({show, profile, onHide, onConfirm}) =>
  <Modal show={show}
         onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Delete {profile}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        Are you sure you want to delete profile <em>{profile}</em>?
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onHide}>No</Button>
      <Button bsStyle="danger" onClick={onConfirm}>Yes</Button>
    </Modal.Footer>
  </Modal>
;


const NewProfileDialog = ({show, name, exists, onChange, onHide, onSave}) =>
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Create New Profile</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div style={{textAlign: 'center'}}>
        <Input type="text" autoFocus value={name} onChange={onChange} />
        <If test={exists}>
          <Alert bsStyle="danger">
            Profile <em>{name}</em> already exists
          </Alert>
        </If>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={onHide}>Cancel</Button>
      <Button bsStyle="success" onClick={onSave}
              disabled={!name || exists}>
        Ok
      </Button>
    </Modal.Footer>
  </Modal>
;


const ProfileSelector = ({profiles, profileId, onChange}) =>
  <form className="navbar-form navbar-left"
        style={{paddingLeft: 0, marginLeft: 0}}>
    <Input type="select"
           value={profileId}
           onChange={onChange}
           style={{marginLeft: 0}} >
    <optgroup label="Profiles">
      {
        profiles.map(
          ([name, id]) => <option key={id} value={id}>{name}</option>
        )
      }
    </optgroup>
    <optgroup label="Manage" >
      <option value="_new">New...</option>
      <option value="_delete">Delete...</option>
    </optgroup>
      </Input>
  </form>
;


const OverlayColorSelector = ({locked}) =>
  <ButtonGroup>
    {
      Store.OVERLAY_COLORS.map(
        x => <OverlayToggleButton key={x} color={x} disabled={locked} />
      )
    }
  </ButtonGroup>
;


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
                            style={{marginLeft: 8, marginRight: 5}} >
        {Store.FONT_FAMILIES.map(x => <option key={x} value={x}>{x}</option>)}
        </Input>

        <Input type="number"
               disabled={locked}
               value={settings.fontSize}
               onChange={changeFontSize}
               min="1"
               style={labelStyle} />


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

        <OverlayColorSelector locked={locked} />

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
        Store.LETTER_SETS.map(
          s => <option key={s} value={s}>{s.substr(0, 6)}</option>
        )
      }
    </Input>
  </form>
;


const profileComparator = (a, b) => {
  const [aName] = a, [bName] = b;
  return aName.localeCompare(bName);
};


const App = React.createClass({

  mixins: [
    Reflux.connect(Store, 'settings'),
    Reflux.connect(Profiles, 'profiles')
  ],

  regenerate() {
    Actions.regenerate();
  },

  increaseLetterVSpacing() {
    const value = this.state.settings.letterVSpacing + 1;
    Actions.setLetterVSpacing(value);
  },

  decreaseLetterVSpacing() {
    const value = this.state.settings.letterVSpacing - 1;
    if (value > 0) {
      Actions.setLetterVSpacing(value);
    }
  },

  increaseLetterHSpacing() {
    const value = this.state.settings.letterHSpacing + 1;
    Actions.setLetterHSpacing(value);
  },

  decreaseLetterHSpacing() {
    const value = this.state.settings.letterHSpacing - 1;
    if (value > 0) {
      Actions.setLetterHSpacing(value);
    }
  },

  increaseFontSize() {
    const fontSize = this.state.settings.fontSize + 1;
    Actions.setFontSize(fontSize);
  },

  decreaseFontSize() {
    const fontSize = this.state.settings.fontSize - 1;
    if (fontSize > 0) {
      Actions.setFontSize(fontSize);
    }
  },

  changeProfile(e) {
    e.preventDefault();
    const selection = e.target.value;
    console.debug("Selected:", selection);
    if (selection === '_new') {
      this.showSaveAsDialog();
    }
    else if (selection === '_delete'){
      this.showDeleteConfirmation();
    }
    else {
      Actions.setProfile(selection);
    }
  },

  showSaveAsDialog(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({showSaveAsDialog: true});
    keymaster.filter = () => true;
    keymaster.setScope('save-as-dialog');
  },

  hideSaveAsDialog() {
    keymaster.filter = defaultKeyFilter;
    keymaster.setScope('main');
    this.setState({showSaveAsDialog: false});
  },

  showDeleteConfirmation() {
    keymaster.setScope('delete-confirmation-dialog');
    this.setState({showDeleteConfirmation: true});
  },

  hideDeleteConfirmation() {
    keymaster.setScope('main');
    this.setState({showDeleteConfirmation: false});
  },

  getHandBoardURL() {
    const letters = this.state.settings.letters.join(''),
          fontFamily = this.state.settings.fontFamily;
    return getAbsoluteURL('./handboard.html') + '#' +
           encodeURIComponent(JSON.stringify({letters, fontFamily}));
  },

  showHandBoardQR() {
    this.setState({showQR: true});
  },

  hideHandBoardQR() {
    this.setState({showQR: false});
  },

  handleNavSelection(eventKey){
    console.debug('nav selected', eventKey);
    return {
      1: this.showHandBoardQR,
      2: Actions.regenerate
    }[eventKey]();
  },

  openHandBoardLink(url) {
    this.hideHandBoardQR();
    window.open(url);
  },

  nextValue(values, stateAttr, action) {
    const current = values.indexOf(this.state.settings[stateAttr]),
          next = current + 1 < values.length ? current + 1 : 0;
    action(values[next]);
  },

  nextOverlayColor() {
    this.nextValue(Store.OVERLAY_COLORS,
                   'overlayColor',
                   Actions.setOverlayColor);
  },

  nextLetterSet() {
    this.nextValue(Store.LETTER_SETS,
                   'letterSet',
                   Actions.setLetterSet);
  },

  nextFont() {
    this.nextValue(Store.FONT_FAMILIES,
                   'fontFamily',
                   Actions.setFontFamily);
  },

  nextProfile() {
    console.log('Next profile');
    const available = this.getAvailableProfiles(),
          currentId = this.state.profiles.current;
    available.every(([name, id], index, list) => {
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

  setNewProfileName(e) {
    this.setState({newProfileName: e.target.value});
  },

  confirmDelete(e) {
    if (e) {
      e.preventDefault();
    }
    this.hideDeleteConfirmation();
    Actions.deleteProfile(this.state.profiles.current);
  },

  saveProfile(e) {
    if (e) {
      e.preventDefault();
    }
    this.hideSaveAsDialog();
    const {newProfileName, settings} = this.state;
    Actions.saveProfile(newProfileName, settings);
    this.setState({newProfileName: ''});
  },

  toggleProfileLock(e) {
    if (e) {
      e.preventDefault();
    }
    if (this.state.settings.locked) {
      Actions.unlockProfile();
    }
    else {
      Actions.lockProfile();
    }
  },

  componentDidMount() {
    keymaster('q', 'main', this.showHandBoardQR);
    keymaster('shift+r', 'main', Actions.regenerate);
    keymaster(']', 'main', this.increaseFontSize);
    keymaster('[', 'main', this.decreaseFontSize);
    keymaster('.', 'main', this.increaseLetterHSpacing);
    keymaster(',', 'main', this.decreaseLetterHSpacing);
    keymaster('\'', 'main', this.increaseLetterVSpacing);
    keymaster(';', 'main', this.decreaseLetterVSpacing);
    keymaster('c', 'main', this.nextOverlayColor);
    keymaster('l', 'main', this.nextLetterSet);
    keymaster('f', 'main', this.nextFont);
    keymaster('space', 'main', this.nextProfile);
    keymaster('shift+l', 'main', this.toggleProfileLock);
    keymaster('n', 'main', this.showSaveAsDialog);
    keymaster('shift+d', 'main', this.showDeleteConfirmation);
    keymaster('enter', 'save-as-dialog', this.saveProfile);
    keymaster('enter', 'delete-confirmation-dialog', this.confirmDelete);
    keymaster.setScope('main');
  },

  getAvailableProfiles() {
    const asObj = this.state.profiles.available,
          result = [];
    for (let id of Object.keys(asObj)) {
      let name = asObj[id];
      result.push([name, id]);
    }
    return result.sort(profileComparator);
  },

  render: function() {

    const url = this.getHandBoardURL(),
          {profiles, newProfileName, settings} = this.state,
          profileId = profiles.current,
          profile = profiles.available[profileId],
          availableProfiles = this.getAvailableProfiles(),
          profileNames = new Map(availableProfiles),
          newProfileNameExists = profileNames.has(newProfileName),
          locked = settings.locked,
          letters = settings.letters.map(letter => ({char: letter, shown: true}));

    return (
      <div>

        <OpenHandBoardDialog show={this.state.showQR}
                             url={url}
                             onHide={this.hideHandBoardQR}
                             onOpenLink={this.openHandBoardLink} />

        <DeleteConfirmationDialog show={this.state.showDeleteConfirmation}
                                  profile={profile}
                                  onHide={this.hideDeleteConfirmation}
                                  onConfirm={this.confirmDelete} />

        <NewProfileDialog show={this.state.showSaveAsDialog}
                          onHide={this.hideSaveAsDialog}
                          name={newProfileName}
                          exists={newProfileNameExists}
                          onChange={this.setNewProfileName}
                          onSave={this.saveProfile} />

        <Navbar fluid>

          <Nav onSelect={(eventKey, event) => this.toggleProfileLock(event)}>
            <NavItem eventKey={1}><Icon name={locked ? "lock" : "unlock"}/></NavItem>
            <ProfileSelector profiles={availableProfiles}
                             profileId={profileId}
                             onChange={this.changeProfile} />
          </Nav>

          <Nav>
            <SettingsEditor settings={settings} locked={locked} />
          </Nav>

          <Nav right onSelect={this.handleNavSelection}>
            <LetterSetSelector settings={settings} locked={locked} />
            <NavItem eventKey={1}><Icon name="qrcode" /></NavItem>
            <NavItem eventKey={2}><Icon name="refresh" /></NavItem>
          </Nav>

        </Navbar>

        <div style={{position: 'relative'}}>
          <ColorOverlay color={settings.overlayColor} />
          <LetterBoard {...settings} letters = {letters} />
        </div>

      </div>
    );
  }
});

run(App);
