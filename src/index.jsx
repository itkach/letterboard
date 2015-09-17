import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import React from 'react/addons';
import initTapEventPlugin from 'react-tap-event-plugin';

import LetterBoardApp from './LetterBoardApp.jsx';
import HandBoardApp from './HandBoardApp.jsx';

initTapEventPlugin();

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {

    const hash = window.location.hash;
    if (hash) {
      console.debug('hash', hash);
      try {
        const data = JSON.parse(hash.substr(1));
        if (data) {
          const {app, ...rest} = data;
          if (app === 'handboard') {
            return <HandBoardApp initialData={rest}/>;
          }
        }
      }
      catch (ex) {
        console.error(ex);
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
