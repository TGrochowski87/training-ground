import Controls from "./controls";

class EnemyControls extends Controls {
  constructor() {
    super();
  }

  decideOnMove = (brainOutputs: number[]) => {
    const decisionThreshold = 0.8;

    if (brainOutputs[0] > decisionThreshold && brainOutputs[3] > decisionThreshold) {
      if (brainOutputs[0] > brainOutputs[3]) {
        this.forward = true;
        this.backward = false;
      } else if (brainOutputs[0] < brainOutputs[3]) {
        this.forward = false;
        this.backward = true;
      } else {
        this.forward = false;
        this.backward = false;
      }
    } else if (brainOutputs[0] > decisionThreshold) {
      this.forward = true;
      this.backward = false;
    } else if (brainOutputs[3] > decisionThreshold) {
      this.forward = false;
      this.backward = true;
    } else {
      this.forward = false;
      this.backward = false;
    }

    if (brainOutputs[1] > decisionThreshold && brainOutputs[2] > decisionThreshold) {
      if (brainOutputs[1] > brainOutputs[2]) {
        this.left = true;
        this.right = false;
      } else if (brainOutputs[1] < brainOutputs[2]) {
        this.left = false;
        this.right = true;
      } else {
        this.left = false;
        this.right = false;
      }
    } else if (brainOutputs[1] > decisionThreshold) {
      this.left = true;
      this.right = false;
    } else if (brainOutputs[2] > decisionThreshold) {
      this.left = false;
      this.right = true;
    } else {
      this.left = false;
      this.right = false;
    }

    if (brainOutputs[4] > decisionThreshold) {
      this.shoot = true;
    } else {
      this.shoot = false;
    }
  };
}

export default EnemyControls;
