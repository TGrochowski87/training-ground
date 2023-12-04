import { Method, Mode, UserSettings } from "models/UserSettings";

export default class UserSettingsReader {
  static getConfig = (): UserSettings => {
    const urlParams = new URLSearchParams(window.location.search);

    let config: UserSettings = {
      mode: UserSettingsReader.readMode(urlParams),
      method: UserSettingsReader.readMethod(urlParams),
    };

    return config;
  };

  private static readMode = (urlParams: URLSearchParams): Mode => {
    const modeString: string | null = urlParams.get("mode")!;

    switch (modeString) {
      case "movement":
        return "movement";
      case "full":
        return "full";
      default:
        throw Error("Training mode could not be determined from query string.");
    }
  };

  private static readMethod = (urlParams: URLSearchParams): Method => {
    const methodString: string | null = urlParams.get("method")!;

    switch (methodString) {
      case "conventional":
        return "conventional";
      case "NEAT":
        return "NEAT";
      default:
        throw Error("Training method could not be determined from query string.");
    }
  };
}
