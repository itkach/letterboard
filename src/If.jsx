export default React.createClass({

  render: function() {
    if (!this.props.test) {
      return null;
    }
    return this.props.children;
  }
});
