abstract class Controls {
  forward: boolean;
  left: boolean;
  right: boolean;
  backward: boolean;
  shoot: boolean;

  constructor() {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.backward = false;
    this.shoot = false;
  }
}

export default Controls;
