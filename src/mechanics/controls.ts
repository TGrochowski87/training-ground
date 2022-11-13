class Controls {
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

    this.addKeyboardListeners();
  }

  private addKeyboardListeners = () => {
    document.onkeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.backward = true;
          break;
        case " ":
          this.shoot = true;
          break;

        default:
          break;
      }
    };

    document.onkeyup = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.backward = false;
          break;
        case " ":
          this.shoot = true;
          break;

        default:
          break;
      }
    };
  };
}

export default Controls;
