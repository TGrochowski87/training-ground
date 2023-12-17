import Controls from "./controls";

class DummyControls extends Controls {
  constructor(shouldMove: boolean) {
    super();

    if (shouldMove) {
      this.forward = true;
      this.left = true;
    }
  }

  stop = () => {
    this.forward = false;
    this.left = false;
  };

  go = () => {
    this.forward = true;
    this.left = true;
  };
}

export default DummyControls;
