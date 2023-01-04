import Controls from "./controls";

class EnemyControls extends Controls {
  constructor() {
    super();
  }

  decideOnMove = (brainOutputs: number[]) => {
    const decisionThreshold = 0.8;

    if (brainOutputs[0] > decisionThreshold) {
      this.forward = true;
    } else {
      this.forward = false;

      if (brainOutputs[3] > decisionThreshold) {
        this.backward = true;
      } else {
        this.backward = false;
      }
    }

    if (brainOutputs[1] > decisionThreshold) {
      this.left = true;
    } else {
      this.left = false;

      if (brainOutputs[2] > decisionThreshold) {
        this.right = true;
      } else {
        this.right = false;
      }
    }

    if (brainOutputs[4] > decisionThreshold) {
      this.shoot = true;
    } else {
      this.shoot = false;
    }
  };
}

export default EnemyControls;
