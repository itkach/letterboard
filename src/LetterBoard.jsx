import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Reflux from 'reflux';
import Store from './store';
import LetterRow from './LetterRow.jsx';


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
      const rowLetters = letters.slice(i * columnCount, (i + 1) * columnCount)
                                .map(letter => ({char: letter, shown: true}));
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
