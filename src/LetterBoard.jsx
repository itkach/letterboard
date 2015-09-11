import React from 'react/addons';
import Reflux from 'reflux';
import Store from './store';


const TR = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render() {
    return (
      <tr style={{textAlign: 'center'}}>
        {this.props.children}
      </tr>
    );
  }

});


const Letter = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  render() {
    return (
      <td style={{verticalAlign: 'baseline', ...this.props.style}}>
        {this.props.char}
      </td>
    );
  }

});


const LARGE_SMALL_RATIO = 1.28;

const LetterRow = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  createItem(char, index) {
    const small = index % 2 === 1,
          style = {fontSize: small ? '100%' : '' + LARGE_SMALL_RATIO * 100 + '%'};
    return <Letter char={char} style={style} />;
  },

  render() {
    return (
      <TR>
        {this.props.letters.map(this.createItem)}
      </TR>
    );
  }

});


export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin,
    Reflux.connect(Store)
  ],

  render: function() {

    const letters = this.state.letters,
          count = letters.length,
          columnCount = this.state.columnCount,
          rowCount = Math.floor(count / columnCount) + (count % columnCount === 0 ? 0 : 1),
          rows = [];

    for (let i = 0; i < rowCount; i++) {
      const rowLetters = letters.slice(i * columnCount, (i + 1) * columnCount);
      rows.push(<LetterRow letters={rowLetters} />);
    }

    return (
      <table style={{fontSize: this.state.fontSize}}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});
