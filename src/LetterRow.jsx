import Tr from './Tr.jsx';
import Letter from './Letter.jsx';

const LetterCell = ({letter, index, onTouchTap, hSpacing, vSpacing, showBorder = false}) => {

  const small = index % 2 === 1,
        hSpacingHalf = hSpacing / 2,
        fontSize = small ? '100%' : '128%',
        border = showBorder ? 'thin solid grey' : null,
        style = {
          fontSize,
          border,
          paddingRight: hSpacingHalf,
          paddingLeft: hSpacingHalf,
          paddingTop: vSpacing,
          paddingBottom: vSpacing
        },
        tapped = onTouchTap ? onTouchTap.bind(this, index) : null;

  return <Letter key={index}
                 letter={letter}
                 style={style}
                 onTouchTap={tapped} />;

};


export default ({letters, style, ...otherProps}) =>
  <Tr style={style}>
    {
      letters.map(
        (letter, index) =>
          <LetterCell key={index} letter={letter} index={index} {...otherProps} />
      )
    }
  </Tr>
;
