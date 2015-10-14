import LetterRow from './LetterRow.jsx';


export default ({letters, columnCount, letterHSpacing, letterVSpacing,
                 fontSize, fontFamily, style, onSelection, showBorder}) =>
{

  const onRowTap = (rowIndex, colIndex, event) => {
    if (event.isDefaultPrevented()) {
      return;
    }
    event.preventDefault();
    console.debug('tap', rowIndex, colIndex);
    if (onSelection) {
      onSelection(rowIndex, colIndex);
    }
  };


  const count = letters.length,
        rowCount = Math.floor(count / columnCount) + (count % columnCount === 0 ? 0 : 1),
        rows = [];

  for (let i = 0; i < rowCount; i++) {
    const rowLetters = letters.slice(i * columnCount, (i + 1) * columnCount);
    rows.push(<LetterRow key={i}
                         letters={rowLetters}
                         hSpacing={letterHSpacing || 0}
                         vSpacing={letterVSpacing || 0}
                         onTouchTap={onRowTap.bind(this, i)}
                         showBorder={showBorder}
              />);
  }

  return (
    <table style={{marginLeft: 'auto',
                   marginRight: 'auto',
                   borderCollapse: 'collapse',
                   fontSize: fontSize,
                   fontFamily: fontFamily,
                    ...style}}>
      <tbody>
        {rows}
      </tbody>
    </table>
  );

};
