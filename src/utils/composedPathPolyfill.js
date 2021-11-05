// Event.composedPath
(function (e, d, w) {
  if (!e.composedPath) {
    e.composedPath = function () {
      if (this.path) {
        return this.path;
      }
      var target = this.target;

      this.path = [];
      while (target.parentNode !== null) {
        this.path.push(target);
        target = target.parentNode;
      }
      this.path.push(d, w);
      return this.path;
    };
  }
})(Event.prototype, document, window);
