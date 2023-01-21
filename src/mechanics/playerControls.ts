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
          event.preventDefault();
          this.left = true;
          break;
        case "ArrowRight":
          event.preventDefault();
          this.right = true;
          break;
        case "ArrowUp":
          event.preventDefault();
          this.forward = true;
          break;
        case "ArrowDown":
          event.preventDefault();
          this.backward = true;
          break;
        case " ":
          event.preventDefault();
          this.shoot = true;
          break;

        default:
          break;
      }
    };

    document.onkeyup = (event: KeyboardEvent) => {
      event.preventDefault();

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          this.left = false;
          break;
        case "ArrowRight":
          event.preventDefault();
          this.right = false;
          break;
        case "ArrowUp":
          event.preventDefault();
          this.forward = false;
          break;
        case "ArrowDown":
          event.preventDefault();
          this.backward = false;
          break;
        case " ":
          event.preventDefault();
          this.shoot = false;
          break;

        default:
          break;
      }
    };
  };
}

export default PlayerControls;
