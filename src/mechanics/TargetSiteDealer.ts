import { randomBetween } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";

class TargetSiteDealer {
  static unvisitedSites: number[];
  static siteTargetSequence: number[];
  static siteList: Vector2D[] = [];

  // Static constructor
  public static initialize(sites: Vector2D[], specialInitialSequence?: number[]) {
    if (specialInitialSequence?.some(x => x > sites.length - 1)) {
      debugger;
      throw Error("Provided initial sequences contains out of range indexes.");
    }

    TargetSiteDealer.siteList = sites.map(s => s.copy());
    TargetSiteDealer.siteTargetSequence = specialInitialSequence ?? Array.from({ length: sites.length }, (v, k) => k);
    TargetSiteDealer.fillUnvisitedSitesList();
    console.log(`Current site sequence: ${TargetSiteDealer.siteTargetSequence}`);
  }

  static getNextTargetSite = (lastTargetSiteSequenceIndex: number): Vector2D => {
    if (lastTargetSiteSequenceIndex == TargetSiteDealer.siteTargetSequence.length - 1) {
      TargetSiteDealer.siteTargetSequence.push(TargetSiteDealer.getNextRandomSiteIndex());
      console.log(`Current site sequence: ${TargetSiteDealer.siteTargetSequence}`);
    }
    return TargetSiteDealer.siteList[TargetSiteDealer.siteTargetSequence[lastTargetSiteSequenceIndex + 1]];
  };

  private static getNextRandomSiteIndex = () => {
    if (TargetSiteDealer.unvisitedSites.length == 0) {
      TargetSiteDealer.fillUnvisitedSitesList();
    }

    return TargetSiteDealer.unvisitedSites.splice(
      Math.floor(randomBetween(0, TargetSiteDealer.unvisitedSites.length)),
      1
    )[0];
  };

  private static fillUnvisitedSitesList = () => {
    TargetSiteDealer.unvisitedSites = Array.from({ length: TargetSiteDealer.siteList.length }, (v, k) => k);

    // Remove the last one from the list of possibilities.
    var indexOfLast = TargetSiteDealer.unvisitedSites.indexOf(TargetSiteDealer.siteTargetSequence.at(-1)!);
    TargetSiteDealer.unvisitedSites.splice(indexOfLast, 1);
  };
}

export default TargetSiteDealer;
