import './style.css';
import React from 'react/addons';
import initTapEventPlugin from 'react-tap-event-plugin';
import  mui from 'material-ui';

import LetterBoardApp from './LetterBoardApp.jsx';
import HandBoardApp from './HandBoardApp.jsx';

initTapEventPlugin();

const ThemeManager = new mui.Styles.ThemeManager();

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  render: function() {

    const hash = window.location.hash;
    if (hash) {
      const data = JSON.parse(hash.substr(1));
      if (data) {
        const {app, ...rest} = data;
        if (app === 'handboard') {
          return <HandBoardApp initialData={rest}/>;
        }
      }
    }

    return (
      <LetterBoardApp />
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
