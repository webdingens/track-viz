import React from 'react';
import SkaterDragWrappers from './SkaterDragWrappers';

import styles from './Skater.module.scss';
import classNames from 'classnames';

const Skater = (props) => {
  let {
    team,
    rotation,
    idx,
    label,
    hasFocus = false,
    isPivot = false,
    isJammer = false,
    inBounds = false,
    inPlay = false,
    packSkater = false
  } = props;

  return (
    <g
      className={classNames({
        [styles.skater]: true,
        [styles[`skater-${team}`]]: true,
        [styles['skater--has-focus']]: hasFocus,
        [styles['skater--in-bounds']]: inBounds,
        [styles['skater--in-play']]: inPlay,
        [styles['skater--pack-skater']]: packSkater,
      })}
      data-idx={idx}
    >
      <SkaterDragWrappers {...props}>

        <path className={styles.shield} d="M.1,.3 A.3 .3 90 1 0 .1,-.3" />
        <circle className={styles.skaterBackground} r=".3" fill="green" />
        {label ? (
          <text className={classNames({
            [styles.blockerNumber]: true,
            'js-blocker-number': true
            })}
            x="-.3em" y=".3em"
            fontSize=".3"
            transform={`rotate(${-rotation})`}>{ label }</text>
        ): null}
        {isPivot ? (
          <>
            <path className={styles.pivotStripe} d="M-.3,0 L .3,0"/>
            <circle className={styles.pivotOutline} r=".3" />
          </>
        ) : null}
        {isJammer ? (
          <>
            <path className={styles.jammerStar} d="m55,237 74-228 74,228L9,96h240" transform="translate(-.23, -.23) scale(.0018)" />
          </>
        ) : null}

      </SkaterDragWrappers>
    </g>
  )
}

export default Skater;