import './style.css';
import React from 'react/addons';
import initTapEventPlugin from 'react-tap-event-plugin';

import LetterBoard from './LetterBoard.jsx';

initTapEventPlugin();

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <LetterBoard />
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
