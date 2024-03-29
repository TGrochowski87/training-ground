import { weightMutationRate, weightPerturbationChance } from "configuration";
import { gaussianRandom, randomBetween } from "./mathExtensions";

class Matrix {
  rows: number;
  cols: number;
  matrix: number[][];

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;

    let matrix = new Array<number[]>(rows);
    for (let i = 0; i < matrix.length; i++) {
      matrix[i] = new Array<number>(cols);
    }
    this.matrix = matrix;
  }

  display = (): void => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        console.log(this.matrix[i][j] + " ");
      }
      console.log(" ");
    }
    console.log();
  };

  export = (): string => {
    let stringRepresentation = "";
    for (let i = 0; i < this.rows; i++) {
      let row = "";
      for (let j = 0; j < this.cols; j++) {
        row += this.matrix[i][j] + " ";
      }
      stringRepresentation += `${row}\n`;
    }

    return stringRepresentation;
  };

  multiplyByScalar = (num: number): void => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.matrix[i][j] *= num;
      }
    }
  };

  randomize = (): void => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.matrix[i][j] = randomBetween(-1, 1);
      }
    }
  };

  addScalar = (num: number): void => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.matrix[i][j] += num;
      }
    }
  };

  dot = (other: Matrix): Matrix => {
    if (this.cols != other.rows) {
      throw Error(
        "First matrix's column amount does not equal the amount of rows in second matrix. " +
          `First matrix: (${this.rows}x${this.cols}), second matrix: (${other.rows}x${other.cols})`
      );
    }

    let result = new Matrix(this.rows, other.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum: number = 0.0;

        for (let k = 0; k < this.cols; k++) {
          sum += this.matrix[i][k] * other.matrix[k][j];
        }
        result.matrix[i][j] = sum;
      }
    }

    return result;
  };

  add = (other: Matrix): Matrix => {
    if (this.cols !== other.cols || this.rows !== other.rows) {
      throw Error(
        "Marices' dimensions are not the same. " +
          `First matrix: (${this.rows}x${this.cols}), second matrix: (${other.rows}x${other.cols})`
      );
    }

    let result = new Matrix(this.rows, this.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.matrix[i][j] = this.matrix[i][j] + other.matrix[i][j];
      }
    }

    return result;
  };

  subtract = (other: Matrix): Matrix => {
    if (this.cols !== other.cols || this.rows !== other.rows) {
      throw Error(
        "Marices' dimensions are not the same. " +
          `First matrix: (${this.rows}x${this.cols}), second matrix: (${other.rows}x${other.cols})`
      );
    }

    let result = new Matrix(this.cols, this.rows);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.matrix[i][j] = this.matrix[i][j] - other.matrix[i][j];
      }
    }

    return result;
  };

  transpose = (): Matrix => {
    let result = new Matrix(this.rows, this.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.matrix[j][i] = this.matrix[i][j];
      }
    }

    return result;
  };

  toArray = (): number[] => {
    let result: number[] = new Array<number>(this.rows * this.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result[j + i * this.cols] = this.matrix[i][j];
      }
    }

    return result;
  };

  // ======== EVOLUTION =========================
  clone = (): Matrix => {
    let clone: Matrix = new Matrix(this.rows, this.cols);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        clone.matrix[i][j] = this.matrix[i][j];
      }
    }

    return clone;
  };

  crossover = (other: Matrix): Matrix => {
    let newMatrix: Matrix = new Matrix(this.rows, this.cols);

    const randRow: number = Math.floor(Math.random() * this.rows);
    const randCol: number = Math.floor(Math.random() * this.cols);
    const threshold = randRow * this.cols + randCol;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (i * this.cols + j < threshold) {
          newMatrix.matrix[i][j] = this.matrix[i][j];
        } else {
          newMatrix.matrix[i][j] = other.matrix[i][j];
        }
      }
    }

    return newMatrix;
  };

  mutate = (): void => {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (Math.random() > weightMutationRate) {
          continue;
        }

        if (Math.random() < weightPerturbationChance) {
          this.matrix[i][j] += gaussianRandom() / 5;
        } else {
          this.matrix[i][j] = randomBetween(-1, 1);
        }

        if (this.matrix[i][j] > 1) {
          this.matrix[i][j] = 1;
        }
        if (this.matrix[i][j] < -1) {
          this.matrix[i][j] = -1;
        }
      }
    }
  };
  // ======== EVOLUTION =========================

  static singleColumnMatrixFromArray = (array: number[]): Matrix => {
    let result = new Matrix(array.length, 1);

    for (let i = 0; i < array.length; i++) {
      result.matrix[i][0] = array[i];
    }

    return result;
  };
}

export default Matrix;
