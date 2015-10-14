export default ({onTouchTap, style, letter: {char, shown}}) =>
  <td style={{verticalAlign: 'baseline',
              cursor: onTouchTap ? 'pointer' : null,
                  ...style}}
      onTouchTap={onTouchTap} >
    <div style={{opacity: shown ? 1 : 0}}>
      {char}
    </div>
  </td>
;
