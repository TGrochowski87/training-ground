import Controls from "./controls";

class DummyControls extends Controls {
  //private directionsArray: boolean[];

  constructor() {
    super();

    this.forward = true;
    this.left = true;
    //this.directionsArray = [this.forward, this.right, this.backward, this.left];
  }

  nextDirection = () => {
    // const amountOfDirections = this.directionsArray.length;
    // for (let i = 0; i < amountOfDirections; i++) {
    //   if (this.directionsArray[i]) {
    //     this.directionsArray[(i + 1) % amountOfDirections] = true;
    //     this.directionsArray[i] = false;
    //   }
    // }
  };
}

export default DummyControls;
