/**
 * Altered version of three/examples/jsm/controls/DragControls.js
 *
 * Changes:
 * - picks object, but moves it along the floor plane,
 *     not perpendicular to the camera
 * - hover makes the bounding object visible
 * - intersection is computed with the bounding object, child of
 *     a skater3D object
 * - position is set on the skater3D object
 */

import { EventDispatcher, Plane, Raycaster, Vector2, Vector3 } from "three";

var DragControls = function (_objects, _camera, _domElement) {
  var _plane = new Plane(new Vector3(0, 1, 0));
  var _raycaster = new Raycaster();

  var _mouse = new Vector2();
  var _offset = new Vector3();
  var _intersection = new Vector3();
  var _worldPosition = new Vector3();
  var _intersections = [];

  var _selected = null,
    _hovered = null,
    _selectedIntersection = null;
  var _selectedIntersectionOffset = new Vector3();
  var _isDragging = false;

  //

  var scope = this;

  function activate() {
    _domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.addEventListener("mouseup", onDocumentMouseCancel, false);
    _domElement.addEventListener("mouseleave", onDocumentMouseCancel, false);
    _domElement.addEventListener("touchmove", onDocumentTouchMove, false);
    _domElement.addEventListener("touchstart", onDocumentTouchStart, false);
    _domElement.addEventListener("touchend", onDocumentTouchEnd, false);
  }

  function deactivate() {
    _domElement.removeEventListener("mousemove", onDocumentMouseMove, false);
    _domElement.removeEventListener("mousedown", onDocumentMouseDown, false);
    _domElement.removeEventListener("mouseup", onDocumentMouseCancel, false);
    _domElement.removeEventListener("mouseleave", onDocumentMouseCancel, false);
    _domElement.removeEventListener("touchmove", onDocumentTouchMove, false);
    _domElement.removeEventListener("touchstart", onDocumentTouchStart, false);
    _domElement.removeEventListener("touchend", onDocumentTouchEnd, false);
  }

  function dispose() {
    deactivate();
  }

  function getObjects() {
    return _objects;
  }

  function onDocumentMouseMove(event) {
    event.preventDefault();

    _moveSelectedToCursor(event);

    //
    //	Hover Effect
    //	make bounding objects visible
    //
    if (_isDragging) return;

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    if (_intersections.length > 0) {
      var object = _intersections[0].object;

      if (_hovered !== object) {
        _domElement.style.cursor = "pointer";

        if (_hovered) {
          _hovered.material.opacity = 0;
          _hovered.material.needsUpdate = true;
        }

        _hovered = object;

        _hovered.material.opacity = 0.4;
        _hovered.material.needsUpdate = true;

        scope.dispatchEvent({ type: "hoveron", object: object });
      }
    } else {
      if (_hovered !== null) {
        _domElement.style.cursor = "auto";

        _hovered.material.opacity = 0;
        _hovered.material.needsUpdate = true;

        scope.dispatchEvent({ type: "hoveroff", object: _hovered });

        _hovered = null;
      }
    }
  }

  function _getParentSkater(object) {
    let ret = object;
    while (ret.parent && ret.name !== "Skater3D") {
      ret = ret.parent;
    }
    if (ret.name === "Skater3D") return ret;
    return false;
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();

    _selectFromCursor(event);
  }

  function onDocumentMouseCancel(event) {
    event.preventDefault();

    if (_selected) {
      scope.dispatchEvent({ type: "dragend", object: _selected });

      _selected = null;
    }

    _domElement.style.cursor = _hovered ? "pointer" : "auto";
    _isDragging = false;
  }

  function _moveSelectedToCursor(event) {
    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, _camera);

    if (_selected && scope.enabled) {
      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        let dir = _raycaster.ray.direction;
        let invDir = new Vector3(0, 0, 0).sub(dir);
        let angleFromFloor = new Vector3(invDir.x, 0, invDir.z).angleTo(invDir);

        let y = Math.sin(angleFromFloor);
        let factorToSelectedIntersection = _selectedIntersection.point.y / y;
        let _selectedIntersectionCurrent = _intersection
          .clone()
          .add(invDir.clone().multiplyScalar(factorToSelectedIntersection));

        _selected.position.copy(
          _selectedIntersectionCurrent.sub(_selectedIntersectionOffset)
        );
      }

      scope.dispatchEvent({ type: "drag", object: _selected });

      return;
    }
  }

  function onDocumentTouchMove(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    _moveSelectedToCursor(event);
  }

  function _selectFromCursor(event) {
    var rect = _domElement.getBoundingClientRect();

    _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    _intersections.length = 0;

    _raycaster.setFromCamera(_mouse, _camera);
    _raycaster.intersectObjects(_objects, true, _intersections);

    if (_intersections.length > 0) {
      _selected = _intersections[0].object;
      _selected = _getParentSkater(_selected);
      _selectedIntersection = _intersections[0];
      _selectedIntersectionOffset = _selectedIntersectionOffset
        .copy(_selectedIntersection.point)
        .sub(_selected.position);

      if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
        _offset
          .copy(_intersection)
          .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
      }

      _domElement.style.cursor = "move";
      _isDragging = true;

      scope.dispatchEvent({ type: "dragstart", object: _selected });
    }
  }

  function onDocumentTouchStart(event) {
    event.preventDefault();
    event = event.changedTouches[0];

    _selectFromCursor(event);
  }

  function onDocumentTouchEnd(event) {
    event.preventDefault();

    if (_selected) {
      scope.dispatchEvent({ type: "dragend", object: _selected });

      _selected = null;
    }

    _domElement.style.cursor = "auto";
    _isDragging = false;
  }

  activate();

  // API

  this.enabled = true;

  this.activate = activate;
  this.deactivate = deactivate;
  this.dispose = dispose;
  this.getObjects = getObjects;
};

DragControls.prototype = Object.create(EventDispatcher.prototype);
DragControls.prototype.constructor = DragControls;

export { DragControls };
