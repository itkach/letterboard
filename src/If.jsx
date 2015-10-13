export default React.createClass({

  render: function() {
    return this.props.test ? this.props.children : null;
  }

});
