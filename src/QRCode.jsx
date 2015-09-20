import React from 'react/addons';
import Halogen from 'halogen';
import WorkerLoader from 'worker!./qrcode-worker.js';

export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  getDefaultProps() {
    return {size: 200, text: 'Hello'};
  },

  getInitialState() {
    return {
      imageData: null
    };
  },

  componentWillMount() {
    const worker = new WorkerLoader();
    worker.onmessage = (e) => {
      this.setState({imageData: e.data});
    };
    worker.postMessage(this.props.text);
  },

  render() {

    const style = {width: this.props.size, height: this.props.size};

    if (!this.state.imageData) {
      return (
        <div style={{...style,
                     display: 'block',
                     border: 'thin solid grey',
                     marginLeft: 'auto',
                     marginRight: 'auto',
                     textAlign: 'center',
                     verticalAlign: 'middle'}}>
          <div style={{...style,
                       display: 'table-cell',
                       verticalAlign: 'middle'}}>
            <Halogen.PulseLoader color="black" />
          </div>
        </div>
      );
    }

    return (
      <img src={this.state.imageData} style={style} />
    );
  }

});
