import React from 'react/addons';

const TR = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
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
    React.addons.PureRenderMixin
  ],

  render() {
    return (
      <td style={{verticalAlign: 'baseline',
                  cursor: this.props.onTouchTap ? 'pointer' : null,
                  ...this.props.style}}
          onTouchTap={this.props.onTouchTap}>
        {this.props.char || '\u00A0'}
      </td>
    );
  }

});


const LARGE_SMALL_RATIO = 1.28;

const LetterRow = React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  onLetterTap(colIndex, event) {
    if (this.props.onTouchTap) {
      this.props.onTouchTap(colIndex, event);
    }
  },

  createItem(char, index) {
    console.debug('create item for char', char, 'at index', index);
    const small = index % 2 === 1,
          style = {
            fontSize: small ? '100%' : '' + LARGE_SMALL_RATIO * 100 + '%',
            padding: 0,
            border: 'thin solid grey'
          };
    style.paddingRight = style.paddingLeft = this.props.hSpacing / 2;
    style.paddingTop = style.paddingBottom = this.props.vSpacing / 2;
    return <Letter key={index} char={char}
                   style={style}
                   onTouchTap={this.onLetterTap.bind(this, index)} />;
  },

  render() {
    console.debug('Letters:', this.props.letters);
    return (
      <TR style={this.props.style}>
        {this.props.letters.map(this.createItem)}
      </TR>
    );
  }

});


export default React.createClass({

  mixins: [
    React.addons.PureRenderMixin
  ],

  onRowTap(rowIndex, colIndex, event) {
    if (event.isDefaultPrevented()) {
      return;
    }
    event.preventDefault();
    console.debug('tap', rowIndex, colIndex);
    if (this.props.onPlaceSelected) {
      this.props.onPlaceSelected(rowIndex, colIndex);
    }
  },

  render: function() {

    const letters = this.props.letters,
          count = letters.length,
          columnCount = this.props.columnCount,
          rowCount = Math.floor(count / columnCount) + (count % columnCount === 0 ? 0 : 1),
          rows = [];

    for (let i = 0; i < rowCount; i++) {
      console.debug('row', i);
      const rowLetters = letters.slice(i * columnCount, (i + 1) * columnCount);
      rows.push(<LetterRow key={i}
                           letters={rowLetters}
                           hSpacing={0}
                           vSpacing={0}
                           onTouchTap={this.onRowTap.bind(this, i)}
                />);
    }

    return (
      <table style={{fontFamily: this.props.fontFamily,
                     borderSpacing: 'collapse',
                     width: '100%', fontSize: '5vw'}}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});
