import { sites } from "configuration";
import { randomBetween } from "utilities/mathExtensions";
import Vector2D from "utilities/vector2d";

class SiteIndexAssigner {
  static unvisitedSites: number[];
  static siteTargetSequence: number[];

  private static siteList: Vector2D[] = [];

  // Static constructor
  public static reset(sites: Vector2D[]) {
    SiteIndexAssigner.siteList = sites;
    SiteIndexAssigner.siteTargetSequence = [0, 1, 2, 3, 4];
    SiteIndexAssigner.fillUnvisitedSitesList();
    console.log(`Current site sequence: ${SiteIndexAssigner.siteTargetSequence}`);
  }

  static getNextTargetSiteIndex = (lastTargetSiteSequenceIndex: number): number => {
    if (lastTargetSiteSequenceIndex == SiteIndexAssigner.siteTargetSequence.length - 1) {
      SiteIndexAssigner.siteTargetSequence.push(SiteIndexAssigner.getNextRandomSiteIndex());
      console.log(`Current site sequence: ${SiteIndexAssigner.siteTargetSequence}`);
    }
    return SiteIndexAssigner.siteTargetSequence[lastTargetSiteSequenceIndex + 1];
  };

  private static getNextRandomSiteIndex = () => {
    if (SiteIndexAssigner.unvisitedSites.length == 0) {
      SiteIndexAssigner.fillUnvisitedSitesList();
    }

    return SiteIndexAssigner.unvisitedSites.splice(
      Math.floor(randomBetween(0, SiteIndexAssigner.unvisitedSites.length)),
      1
    )[0];
  };

  private static fillUnvisitedSitesList = () => {
    SiteIndexAssigner.unvisitedSites = Array.from({ length: SiteIndexAssigner.siteList.length }, (v, k) => k);

    // Remove the last one from the list of possibilities.
    var indexOfLast = SiteIndexAssigner.unvisitedSites.indexOf(SiteIndexAssigner.siteTargetSequence.at(-1)!);
    SiteIndexAssigner.unvisitedSites.splice(indexOfLast, 1);
  };
}

SiteIndexAssigner.reset(sites);
export default SiteIndexAssigner;
