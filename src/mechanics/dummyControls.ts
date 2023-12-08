import Controls from "./controls";

class DummyControls extends Controls {
  constructor() {
    super();

    this.forward = true;
    this.left = true;
  }
}

export default DummyControls;
