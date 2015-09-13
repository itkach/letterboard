import React from 'react/addons';
import qrcode from 'yaqrcode';

export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  getDefaultProps() {
    return {size: 200, text: 'Hello'};
  },

  render() {

    const imgData = qrcode(this.props.text);

    return (
      <img src={imgData} style={{width: this.props.size, height: this.props.size}}/>
    );
  }

});
