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

  syncProps(prevProps, nextProps) {}

  update() {}

  static switchTo() {}
}

export default ControlsBase;
