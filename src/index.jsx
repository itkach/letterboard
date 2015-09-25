import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import React from 'react/addons';
import initTapEventPlugin from 'react-tap-event-plugin';
import keymaster from 'keymaster';

import LetterBoardApp from './LetterBoardApp.jsx';

initTapEventPlugin();

keymaster.filter = () => true;


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
