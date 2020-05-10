/**
 * Base Class unifying Controls behaviour
*/

class ControlsBase {
  constructor(options) {
    
    this.options = options;
  }

  animate() {}

  destroy() {}

  syncProps(prevProps, nextProps) {}

  update() {}

  static switchTo() {}
}

export default ControlsBase;