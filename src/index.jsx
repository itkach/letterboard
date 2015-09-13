import './style.css';
import React from 'react/addons';
import Reflux from 'reflux';
import initTapEventPlugin from 'react-tap-event-plugin';

import  mui from 'material-ui';
import LetterBoard from './LetterBoard.jsx';

import Actions from './actions';
import Store from './store';
import QRCode from './QRCode.jsx';


import {
  Toolbar, ToolbarGroup, FontIcon,
  DropDownIcon, DropDownMenu, RaisedButton,
  ToolbarTitle, ToolbarSeparator,
  TextField, IconButton, FlatButton, Dialog
} from 'material-ui';

initTapEventPlugin();

const ThemeManager = new mui.Styles.ThemeManager();

function getAbsoluteURL(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
}

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin,
    Reflux.connect(Store)
  ],

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

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

  getHandBoardURL() {
    return getAbsoluteURL('./#/handboard/' + this.state.letters.join(''));
  },

  showHandBoardQR() {
    this.setState({showQR: true});
  },

  hideHandBoardQR() {
    this.setState({showQR: false});
  },

  render: function() {

    let qrCodeDialog = null;
    if (this.state.showQR) {
      const url = this.getHandBoardURL();
      const actions = [
        (
          <FlatButton label="Close"
                      key="btnClose"
                      secondary={true}
                      onTouchTap={this.hideHandBoardQR} />
        )
      ];

      qrCodeDialog = (
        <Dialog openImmediately={true}
                actions={actions}
                modal={true}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <QRCode size={200} text={url} />
              <a href={url} target="_blank">Open</a>
          </div>
        </Dialog>
      );
    }

    return (
      <div >
        {qrCodeDialog}
        <Toolbar>
          <ToolbarGroup key={0} float="left">
            <ToolbarTitle text="Anonymous" />
          </ToolbarGroup>
          <ToolbarGroup key={1} float="right">
            <FontIcon className="material-icons"
                      onTouchTap={this.regenerate}>cached</FontIcon>
          </ToolbarGroup>
        </Toolbar>

        <div style={{display: 'flex', justifyContent: 'center'}}>
          <LetterBoard />
        </div>

        <div style={{position: 'fixed',
                     bottom: 0,
                     display: 'flex',
                     left: 5,
                     right: 5,
                     alignItems: 'center',
                     justifyContent: 'space-between'}}>
          <div>
            <TextField type="number"
                       floatingLabelText="Font Size"
                       value={this.state.fontSize}
                       onChange={this.changeFontSize}
                       min="1"
                       style={{marginLeft: 5, marginRight: 5}}
            />

            <TextField type="number"
                       floatingLabelText="H Spacing"
                       value={this.state.letterHSpacing}
                       onChange={this.changeLetterHSpacing}
                       min="1"
                       style={{marginLeft: 5, marginRight: 5}}
            />


            <TextField type="number"
                       floatingLabelText="V Spacing"
                       value={this.state.letterVSpacing}
                       onChange={this.changeLetterVSpacing}
                       min="1"
                       style={{marginLeft: 5, marginRight: 5}}
            />
          </div>

          <FlatButton label="Hand Board"
                      secondary={true}
                      onTouchTap={this.showHandBoardQR} />

        </div>
      </div>
    );
  }
});

function main() {
  React.render(<Root />, document.body);
}

if (document.readyState === "complete") {
  main();
}
else {
  document.addEventListener("DOMContentLoaded", main, false);
}
