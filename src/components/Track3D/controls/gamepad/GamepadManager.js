import "joypad.js";

class GamepadManager {
  threshold = 0.1;

  isAxisActive(gamepad) {
    const _gamepad = gamepad ? gamepad : this.getActiveGamepad();
    if (!_gamepad) return false;
    return !!_gamepad.axes.find((axis) => Math.abs(axis) > this.threshold);
  }

  isButtonActive(gamepad) {
    const _gamepad = gamepad ? gamepad : this.getActiveGamepad();
    if (!_gamepad) return false;
    return !!_gamepad.buttons.find(
      (button) => button.pressed || button.touched
    );
  }

  getGamepads() {
    return navigator.getGamepads().filter(Boolean);
  }

  getActiveGamepad() {
    const gamepads = this.getGamepads();
    return gamepads.find((gamepad) => {
      const activeAxis = this.isAxisActive(gamepad);
      const activeButton = this.isButtonActive(gamepad);
      return activeAxis || activeButton;
    });
  }

  on(event, callback) {
    return window.joypad.on(event, callback);
  }

  destroy() {}
}

export default new GamepadManager();
