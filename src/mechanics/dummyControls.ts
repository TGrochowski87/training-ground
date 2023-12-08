import Controls from "./controls";

class DummyControls extends Controls {
  constructor() {
    super();

    this.forward = false;
    this.left = false;
  }
}

export default DummyControls;
