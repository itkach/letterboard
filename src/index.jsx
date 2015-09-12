import './style.css';
import React from 'react/addons';
import Reflux from 'reflux';
import initTapEventPlugin from 'react-tap-event-plugin';

import  mui from 'material-ui';
import LetterBoard from './LetterBoard.jsx';

import Actions from './actions';
import Store from './store';

import {
  Toolbar, ToolbarGroup, FontIcon,
  DropDownIcon, DropDownMenu, RaisedButton,
  ToolbarTitle, ToolbarSeparator,
  TextField, IconButton, FlatButton
} from 'material-ui';

initTapEventPlugin();

const ThemeManager = new mui.Styles.ThemeManager();

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

  render: function() {
    return (
      <div >
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

        <div style={{position: 'fixed', bottom: 0}}>
          <TextField type="number"
                     floatingLabelText="Font Size"
                     value={this.state.fontSize}
                     onChange={this.changeFontSize}
                     min="1"/>

          <TextField type="number"
                     floatingLabelText="H Spacing"
                     value={this.state.letterHSpacing}
                     onChange={this.changeLetterHSpacing}
                     min="1"/>


          <TextField type="number"
                     floatingLabelText="V Spacing"
                     value={this.state.letterVSpacing}
                     onChange={this.changeLetterVSpacing}
                     min="1"/>


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
