import React, { PropsWithChildren } from "react";

import styles from "./Skater.module.scss";
import classNames from "classnames";

import { SkaterProps } from "./Skater";

type SkaterDragWrapperProps = PropsWithChildren<SkaterProps>;

class SkaterDragWrapper extends React.Component<SkaterDragWrapperProps> {
  shouldComponentUpdate(nextProps: SkaterDragWrapperProps) {
    if (nextProps.preventDragUpdate) return false;
    return true;
  }

  render() {
    return (
      <g
        className="js-skater"
        transform={`translate(${this.props.x},${this.props.y})`}
        data-idx={this.props.idx}
      >
        <g
          className="js-skater-rotation-wrapper"
          transform={`rotate(${this.props.rotation})`}
          data-idx={this.props.idx}
        >
          <g className="js-skater-body-wrapper">{this.props.children}</g>

          <g
            className={classNames({
              [styles.rotationHandle]: true,
              "js-rotation-handle": true,
            })}
            transform="translate(.7, 0)"
          >
            <circle r=".15" />
          </g>
        </g>
      </g>
    );
  }
}

export default SkaterDragWrapper;
