import Controls from "./controls";

class DummyControls extends Controls {
  constructor(shouldMove: boolean) {
    super();

    if (shouldMove) {
      this.forward = true;
      this.left = true;
    }
  }
}

export default DummyControls;
