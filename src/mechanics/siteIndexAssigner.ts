import { firstSiteIndex, sites } from "configuration";
import { randomBetween } from "utilities/mathExtensions";

class SiteIndexAssigner {
  static unvisitedSites: number[];
  static siteTargetSequence: number[] = [firstSiteIndex];

  // Static constructor
  public static _initialize() {
    SiteIndexAssigner.fillUnvisitedSitesList();
  }

  static getNextTargetSiteIndex = (lastTargetSiteSequenceIndex: number): number => {
    if (lastTargetSiteSequenceIndex == SiteIndexAssigner.siteTargetSequence.length - 1) {
      SiteIndexAssigner.siteTargetSequence.push(SiteIndexAssigner.getNextRandomSiteIndex());
      console.log(SiteIndexAssigner.siteTargetSequence);
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
    SiteIndexAssigner.unvisitedSites = Array.from({ length: sites.length }, (v, k) => k);

    // Remove the last one from the list of possibilities.
    var indexOfLast = SiteIndexAssigner.unvisitedSites.indexOf(SiteIndexAssigner.siteTargetSequence.at(-1)!);
    SiteIndexAssigner.unvisitedSites.splice(indexOfLast, 1);
  };
}

SiteIndexAssigner._initialize();
export default SiteIndexAssigner;
