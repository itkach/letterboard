import 'babel-core/polyfill';
import React from 'react/addons';
import Reflux from 'reflux';
import keymaster from 'keymaster';
import Icon from 'react-fontawesome';
import LetterBoard from './LetterBoard.jsx';
import Actions from './actions';
import Store from './store';
import {Profiles} from './store';
import QRCode from './QRCode.jsx';
import If from './If.jsx';


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


function getAbsoluteURL(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
}


const OverlayToggleButton = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  onTouchTap() {
    Actions.setOverlayColor(this.props.color);
  },

  render: function() {
    const style = this.props.color ?
                  {backgroundColor: this.props.color, opacity: 0.3} : null;
    return (
      <Button style={style}
              onTouchTap={this.onTouchTap}
              disabled={this.props.disabled}>
        {'\u00A0'}
      </Button>
    );

  }

});


const ColorOverlay = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {

    const style = {
      zIndex: 1000,
      backgroundColor: this.props.color,
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      opacity: 0.4,
      width: '100%'
    };

    return (
      <div style={style} />
    );

  }

});

const profileComparator = (a, b) => {
  const [aName] = a, [bName] = b;
  return aName.localeCompare(bName);
};

export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin,
    Reflux.connect(Store, 'settings'),
    Reflux.connect(Profiles, 'profiles')
  ],

  regenerate() {
    Actions.regenerate();
  },

  changeLetterVSpacing(e) {
    const value = parseFloat(e.target.value);
    Actions.setLetterVSpacing(value);
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

  changeLetterHSpacing(e) {
    const value = parseFloat(e.target.value);
    Actions.setLetterHSpacing(value);
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

  changeFontSize(e) {
    const fontSize = parseFloat(e.target.value);
    Actions.setFontSize(fontSize);
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

  changeFontFamily(e) {
    console.log('changeFontFamily', e.target.value);
    Actions.setFontFamily(e.target.value);
  },

  changeLetterSet(e) {
    Actions.setLetterSet(e.target.value);
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
          profileId = this.state.profiles.current,
          profile = this.state.profiles.available[profileId],
          newProfileName = this.state.newProfileName,
          availableProfiles = this.getAvailableProfiles(),
          profileNames = new Map(availableProfiles),
          newProfileNameExists = profileNames.has(newProfileName),
          locked = this.state.settings.locked;

    return (
      <div>
        <Modal show={this.state.showQR} onHide={this.hideHandBoardQR}>
          <Modal.Header closeButton>
            <Modal.Title>Hand Board Link</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{textAlign: 'center'}}>
              <QRCode size={'50vmin'} text={url} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.openHandBoardLink.bind(this, url)}>Open Link</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showDeleteConfirmation}
               onHide={this.hideDeleteConfirmation}>
          <Modal.Header closeButton>
            <Modal.Title>Delete {profile}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{textAlign: 'center'}}>
              Are you sure you want to delete profile <em>{profile}</em>?
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideDeleteConfirmation}>No</Button>
            <Button bsStyle="danger"
                    onClick={this.confirmDelete}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showSaveAsDialog}
               onHide={this.hideSaveAsDialog}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{textAlign: 'center'}}>
              <Input type="text"
                     autoFocus
                     value={this.state.newProfileName}
                     onChange={this.setNewProfileName} />
              <If test={newProfileNameExists}>
                <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                  Profile <em>{newProfileName}</em> already exists
                </Alert>
              </If>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.hideSaveAsDialog}>
              Cancel
            </Button>
            <Button bsStyle="success"
                    onClick={this.saveProfile}
                    disabled={!newProfileName || newProfileNameExists}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>

        <Navbar fluid>

          <Nav onSelect={(eventKey, event) => this.toggleProfileLock(event)}>
            <NavItem eventKey={1}><Icon name={locked ? "lock" : "unlock"}/></NavItem>
            <form className="navbar-form navbar-left"
                  style={{paddingLeft: 0, marginLeft: 0}}>
              <Input type="select"
                     value={profileId}
                     onChange={this.changeProfile}
                     style={{marginLeft: 0}}
              >
              <optgroup label="Profiles">
                {
                  availableProfiles.map(
                    ([name, id]) =>
                      <option key={id} value={id}>
                    {name}
                      </option>
                  )
                }
              </optgroup>
              <optgroup label="Manage" >
                <option value="_new">New...</option>
                <option value="_delete">Delete...</option>
              </optgroup>
                </Input>
            </form>
          </Nav>

          <Nav>
            <form className="navbar-form navbar-left">
              <div className="form-group">

                <Input type="select"
                       disabled={locked}
                       label={<Icon name="font" />}
                       value={this.state.settings.fontFamily}
                       onChange={this.changeFontFamily}
                       style={{marginLeft: 8, marginRight: 5}} >
                {Store.FONT_FAMILIES.map(x => <option key={x} value={x}>{x}</option>)}
              </Input>

              <Input type="number"
                     disabled={locked}
                     value={this.state.settings.fontSize}
                     onChange={this.changeFontSize}
                     min="1"
                     style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
              />


              <Input type="number"
                     disabled={locked}
                     label={<Icon name="text-width" />}
                                  value={this.state.settings.letterHSpacing}
                                  onChange={this.changeLetterHSpacing}
                                  min="1"
                                  style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
                            />


              <Input type="number"
                     disabled={locked}
                     label={<Icon name="text-height" />}
                                  value={this.state.settings.letterVSpacing}
                                  onChange={this.changeLetterVSpacing}
                                  min="1"
                                  style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
                            />

              <ButtonGroup>
                {
                  Store.OVERLAY_COLORS.map(
                    x => <OverlayToggleButton key={x} color={x} disabled={locked} />
                  )
                }
                </ButtonGroup>

              </div>
            </form>

          </Nav>
          <Nav right onSelect={this.handleNavSelection}>
            <form className="navbar-form navbar-left">
                <Input type="select"
                       disabled={locked}
                       value={this.state.settings.letterSet}
                       onChange={this.changeLetterSet}
                       style={{marginLeft: 8, marginRight: 5}}
                       >
                {
                  Store.LETTER_SETS.map(
                    s => <option key={s} value={s}>{s.substr(0, 6)}</option>
                  )
                }
                </Input>
            </form>
            <NavItem eventKey={1}><Icon name="qrcode" /></NavItem>
            <NavItem eventKey={2}><Icon name="refresh" /></NavItem>
          </Nav>
        </Navbar>

        <div style={{position: 'relative'}}>
          <ColorOverlay color={this.state.settings.overlayColor} />
          <LetterBoard />
        </div>

      </div>
    );
  }
});
