import { randomBetween } from "utilities/mathExtensions";
import { sites as configSites } from "configuration";
import Vector2D from "utilities/vector2d";

class TargetSiteDealer {
  static unvisitedSites: number[];
  static siteTargetSequence: number[];
  static siteList: Vector2D[] = [];

  static isTrainingMode: boolean;
  static dummyDisplacementSequence: Vector2D[] = [];

  // Static constructor
  public static initialize(sites: Vector2D[], specialInitialSequence?: number[]) {
    if (specialInitialSequence?.some(x => x > sites.length - 1)) {
      debugger;
      throw Error("Provided initial sequences contains out of range indexes.");
    }

    TargetSiteDealer.isTrainingMode = sites == configSites;
    TargetSiteDealer.siteList = sites.map(s => s.copy());
    TargetSiteDealer.siteTargetSequence = specialInitialSequence ?? Array.from({ length: sites.length }, (v, k) => k);
    TargetSiteDealer.fillUnvisitedSitesList();

    if (TargetSiteDealer.isTrainingMode) {
      TargetSiteDealer.dummyDisplacementSequence = [
        configSites[3].add(new Vector2D(randomBetween(-50, 150), randomBetween(-150, 150))),
        configSites[6].add(new Vector2D(randomBetween(-80, 80), randomBetween(-80, 80))),
      ];
    }

    console.log(`Current site sequence: ${TargetSiteDealer.siteTargetSequence}`);
  }

  static getNextTargetSite = (lastTargetSiteSequenceIndex: number): Vector2D => {
    if (lastTargetSiteSequenceIndex == TargetSiteDealer.siteTargetSequence.length - 1) {
      TargetSiteDealer.siteTargetSequence.push(TargetSiteDealer.getNextRandomSiteIndex());
    }
    return TargetSiteDealer.siteList[TargetSiteDealer.siteTargetSequence[lastTargetSiteSequenceIndex + 1]];
  };

  private static getNextRandomSiteIndex = (): number => {
    if (TargetSiteDealer.unvisitedSites.length == 0) {
      TargetSiteDealer.fillUnvisitedSitesList();
    }

    const nextIndex = TargetSiteDealer.unvisitedSites.splice(
      Math.floor(randomBetween(0, TargetSiteDealer.unvisitedSites.length)),
      1
    )[0];

    if (TargetSiteDealer.isTrainingMode && nextIndex % 3 == 0) {
      const nextDummyPos = TargetSiteDealer.randomizeDummyPosition(configSites[nextIndex]);
      TargetSiteDealer.dummyDisplacementSequence.push(nextDummyPos);
    }

    return nextIndex;
  };

  private static fillUnvisitedSitesList = () => {
    TargetSiteDealer.unvisitedSites = Array.from({ length: TargetSiteDealer.siteList.length }, (v, k) => k);

    // Remove the last one from the list of possibilities.
    var indexOfLast = TargetSiteDealer.unvisitedSites.indexOf(TargetSiteDealer.siteTargetSequence.at(-1)!);
    TargetSiteDealer.unvisitedSites.splice(indexOfLast, 1);
  };

  private static randomizeDummyPosition = (sitePos: Vector2D): Vector2D => {
    if (sitePos.x == configSites[0].x && sitePos.y == configSites[0].y) {
      const displacementVector = new Vector2D(randomBetween(-50, 150), randomBetween(-50, 150));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[1].x && sitePos.y == configSites[1].y) {
      const displacementVector = new Vector2D(randomBetween(-150, 50), randomBetween(-50, 150));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[2].x && sitePos.y == configSites[2].y) {
      const displacementVector = new Vector2D(randomBetween(-150, 150), randomBetween(-150, 50));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[3].x && sitePos.y == configSites[3].y) {
      const displacementVector = new Vector2D(randomBetween(-50, 150), randomBetween(-150, 150));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[4].x && sitePos.y == configSites[4].y) {
      const displacementVector = new Vector2D(randomBetween(-50, 150), randomBetween(-150, 50));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[5].x && sitePos.y == configSites[5].y) {
      const displacementVector = new Vector2D(randomBetween(-150, 50), randomBetween(-150, 50));
      return sitePos.add(displacementVector);
    }
    if (sitePos.x == configSites[6].x && sitePos.y == configSites[6].y) {
      const displacementVector = new Vector2D(randomBetween(-80, 80), randomBetween(-80, 80));
      return sitePos.add(displacementVector);
    }

    throw Error("Unknown site position.");
  };
}

export default TargetSiteDealer;
