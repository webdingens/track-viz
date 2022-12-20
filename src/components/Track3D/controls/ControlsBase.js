/**
 * Base Class unifying Controls behaviour
 */

class ControlsBase {
  constructor(options) {
    this.options = options;
  }

  animate() {}

  destroy() {}

  requestAnimate() {
    if (this.animationRequest) return;
    this.animationRequest = requestAnimationFrame(this.animate);
  }

  // eslint-disable-next-line no-unused-vars
  syncProps(prevProps, nextProps) {}

  update() {}

  static switchTo() {}
}

export default ControlsBase;
