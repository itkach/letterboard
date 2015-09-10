import React from 'react/addons';

const LETTERS = 'ABCDEFGHIJKLNOPRSTUVWXYZ';

// Returns a random integer between min (included) and max (excluded)
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

const swap = (array, i, j) => {
  const tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
};

const randomize = (letterString) => {
  const result = letterString.split(''),
        len = result.length;
  for (let i = 0; i < len - 2; i++) {
    const randomIndex = randomInt(i, len);
    swap(result, randomIndex, i);
  }
  return result;
};

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


const generate = () => {
  const large = randomize(LETTERS),
        small = randomize(LETTERS),
        count = large.length,
        result = [];

  for (let i = 0; i < count; i++) {
    result.push(large[i]);
    result.push(small[i]);
  }
  return result;
};


export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  getInitialState() {
    return {
      letters: generate(),
      columnCount: 12
    };
  },

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
      <table>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});
