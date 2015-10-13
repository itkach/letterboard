import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import LetterRow from './LetterRow.jsx';


export default React.createClass({

  mixins: [
    PureRenderMixin
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
      const rowLetters = letters.slice(i * columnCount, (i + 1) * columnCount);
      rows.push(<LetterRow key={i}
                           letters={rowLetters}
                           hSpacing={0}
                           vSpacing={0}
                           onTouchTap={this.onRowTap.bind(this, i)}
                           showBorder
                />);
    }

    return (
      <table style={{fontFamily: this.props.fontFamily,
                     borderCollapse: 'collapse',
                     width: '100%', fontSize: '5vw'}}>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
});
