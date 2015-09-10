import './style.css';
import initTapEventPlugin from 'react-tap-event-plugin';

import React from 'react/addons';

initTapEventPlugin();

const Root = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render: function() {
    return (
      <div>
        Hello
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
