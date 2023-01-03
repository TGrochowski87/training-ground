import Controls from "./controls";

class PlayerControls extends Controls {
  constructor() {
    super();

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
          this.shoot = false;
          break;

        default:
          break;
      }
    };
  };
}

export default PlayerControls;
