import React from 'react/addons';

const LETTERS = 'ABCDEFGHIJKLNOPRSTUVWXYZ'.split('');


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


const LetterRow = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  createItem(char, index) {
    const small = index % 2 === 1,
          style = {fontSize: small ? '100%' : '200%'};
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
    React.addons.PureRenderMixin
  ],

  render: function() {
    return (
      <table>
        <tbody>
          <LetterRow letters={LETTERS.slice(0, 12)} />
          <LetterRow letters={LETTERS.slice(6, 18)} />
          <LetterRow letters={LETTERS.slice(12, 24)} />
          <LetterRow letters={LETTERS.slice(3, 15)} />
        </tbody>
      </table>
    );
  }
});
