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
  Input,
  Glyphicon,
  Modal
} from 'react-bootstrap';


function getAbsoluteURL(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
}

const FONT_FAMILIES = [
  {payload: 'serif', text: 'Serif'},
  {payload: 'sans-serif', text: 'Sans Serif'},
  {payload: 'monospace', text: 'Monospace'}
];

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

  getHandBoardURL() {
    const letters = this.state.letters.join(''),
          fontFamily = this.state.fontFamily,
          app = 'handboard';
    return getAbsoluteURL('./') + '#' + JSON.stringify({letters, fontFamily, app});
  },

  showHandBoardQR() {
    this.setState({showQR: true});
  },

  hideHandBoardQR() {
    this.setState({showQR: false});
  },

  handleNavSelection(eventKey){
    console.debug('nav selected', eventKey);
    if (eventKey === 1) {
      this.showHandBoardQR();
    }
  },

  openHandBoardLink(url) {
    window.open(url);
  },

  render: function() {

    const url = this.getHandBoardURL();

    return (
      <div >

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
            <form className="navbar-form navbar-left" role="search">
              <div className="form-group">
                <Input type="select"
                       label={<Glyphicon glyph="font" />}
                       value={this.state.fontFamily}
                       onChange={this.changeFontFamily}
                       style={{marginLeft: 8, marginRight: 5}}
                       >
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
                       style={{marginLeft: 8, marginRight: 5, maxWidth: '7rem'}}
                />

              </div>
            </form>

          </Nav>
          <Nav right bsStyle="tabs" onSelect={this.handleNavSelection}>
            <NavItem eventKey={1}><Glyphicon glyph="qrcode" /></NavItem>
          </Nav>
        </Navbar>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <LetterBoard />
        </div>

      </div>
    );
  }
});
