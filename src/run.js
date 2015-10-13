import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './style.css';

import ReactDOM from 'react-dom';
import initTapEventPlugin from 'react-tap-event-plugin';


export default function(Root, containerElementId = 'app') {

  initTapEventPlugin();

  function main() {
    ReactDOM.render(<Root />, document.getElementById(containerElementId));
  }

  if (document.readyState === "complete") {
    main();
  }
  else {
    document.addEventListener("DOMContentLoaded", main, false);
  }

}
