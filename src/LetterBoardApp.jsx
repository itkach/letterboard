import React from 'react/addons';
import Reflux from 'reflux';

import LetterBoard from './LetterBoard.jsx';
import Actions from './actions';
import Store from './store';
import QRCode from './QRCode.jsx';

import {
  Navbar,
  Nav,
  NavItem,
  Button,
  ButtonGroup,
  Input,
  Glyphicon,
  Modal
} from 'react-bootstrap';


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
      <Button style={style} onTouchTap={this.onTouchTap}>
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



export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin,
    Reflux.connect(Store)
  ],

  regenerate() {
    Actions.regenerate();
  },

  changeLetterVSpacing(e) {
    const fontSize = parseFloat(e.target.value);
    Actions.setLetterVSpacing(fontSize);
  },

  changeLetterHSpacing(e) {
    const fontSize = parseFloat(e.target.value);
    Actions.setLetterHSpacing(fontSize);
  },

  changeFontSize(e) {
    const fontSize = parseFloat(e.target.value);
    Actions.setFontSize(fontSize);
  },

  changeFontFamily(e) {
    console.log('changeFontFamily', e.target.value);
    Actions.setFontFamily(e.target.value);
  },

  changeLetterSet(e) {
    Actions.setLetterSet(e.target.value);
  },

  getHandBoardURL() {
    const letters = this.state.letters.join(''),
          fontFamily = this.state.fontFamily,
          app = 'handboard';
    return getAbsoluteURL('./') + '#' +
           encodeURIComponent(JSON.stringify({letters, fontFamily, app}));
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
    window.open(url);
  },

  render: function() {

    const url = this.getHandBoardURL();

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

        <Navbar brand="Anonymous" fluid>
          <Nav>
            <form className="navbar-form navbar-left">
              <div className="form-group">
                <Input type="select"
                       label={<Glyphicon glyph="font" />}
                       value={this.state.fontFamily}
                       onChange={this.changeFontFamily}
                       style={{marginLeft: 8, marginRight: 5}} >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </Input>

                <Input type="number"
                       value={this.state.fontSize}
                       onChange={this.changeFontSize}
                       min="1"
                       style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
                />


                <Input type="number"
                       label={<Glyphicon glyph="text-width" />}
                       value={this.state.letterHSpacing}
                       onChange={this.changeLetterHSpacing}
                       min="1"
                       style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
                />


                <Input type="number"
                       label={<Glyphicon glyph="text-height" />}
                       value={this.state.letterVSpacing}
                       onChange={this.changeLetterVSpacing}
                       min="1"
                       style={{marginLeft: 8, marginRight: 20, maxWidth: '7rem'}}
                />

                <ButtonGroup>
                  <OverlayToggleButton />
                  <OverlayToggleButton color="red"/>
                  <OverlayToggleButton color="green"/>
                  <OverlayToggleButton color="black"/>
                </ButtonGroup>

              </div>
            </form>

          </Nav>
          <Nav right onSelect={this.handleNavSelection}>
            <form className="navbar-form navbar-left">
                <Input type="select"
                       value={this.state.letterSet}
                       onChange={this.changeLetterSet}
                       style={{marginLeft: 8, marginRight: 5}}
                       >
                {Store.LETTER_SETS.map(
                  s => <option key={s} value={s}>{s.substr(0, 6)}</option>
                 )}
                </Input>
            </form>
            <NavItem eventKey={1}><Glyphicon glyph="qrcode" /></NavItem>
            <NavItem eventKey={2}><Glyphicon glyph="refresh" /></NavItem>
          </Nav>
        </Navbar>

        <div style={{position: 'relative'}}>
          <ColorOverlay color={this.state.overlayColor} />
          <LetterBoard />
        </div>

      </div>
    );
  }
});
