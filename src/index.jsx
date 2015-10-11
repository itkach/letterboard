import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './style.css';

import React from 'react/addons';
import initTapEventPlugin from 'react-tap-event-plugin';

import LetterBoardApp from './LetterBoardApp.jsx';

initTapEventPlugin();

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {
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
