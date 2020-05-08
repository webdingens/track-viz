import React from 'react';

import styles from './PointerLockInstructions.module.scss';

const PointerLockInstructions = (props) => (
  <div className={styles.PointerLockInstructions}>
    <button onClick={props.onClick}>Click to control</button>
    <p>(Catches your mouse/pointer.<br/>Press Esc to exit afterwards.)</p>
    <p>
      Move: WASD<br/>
      Jump: SPACE<br/>
      Look: MOUSE
    </p>
  </div>
)

export default PointerLockInstructions;