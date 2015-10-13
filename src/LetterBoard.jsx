import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Reflux from 'reflux';
import Store from './store';


const TR = React.createClass({

  mixins: [
    PureRenderMixin
  ],

  render() {

    const style = {
      textAlign: 'center',
      ...this.props.style
    };

    return (
      <tr style={style}>
        {this.props.children}
      </tr>
    );
  }

});


const Letter = React.createClass({

  mixins: [
    PureRenderMixin
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
    PureRenderMixin
  ],

  createItem(char, index) {
    const small = index % 2 === 1,
          style = {
            fontSize: small ? '100%' : '' + LARGE_SMALL_RATIO * 100 + '%',
            padding: 0
          };
    style.paddingRight = style.paddingLeft = this.props.hSpacing / 2;
    style.paddingTop = style.paddingBottom = this.props.vSpacing;
    return <Letter key={index} char={char} style={style} />;
  },

  render() {
    return (
      <TR style={this.props.style}>
        {this.props.letters.map(this.createItem)}
      </TR>
    );
  }

});


export default React.createClass({

  mixins: [
    PureRenderMixin,
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
      rows.push(<LetterRow key={i}
                           letters={rowLetters}
                           hSpacing={this.state.letterHSpacing}
                           vSpacing={this.state.letterVSpacing} />);
    }

    return (
      <table style={{marginLeft: 'auto',
                     marginRight: 'auto',
                     fontSize: this.state.fontSize,
                     fontFamily: this.state.fontFamily}}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});
