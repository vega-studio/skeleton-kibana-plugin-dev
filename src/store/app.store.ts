import { computed, observable } from "mobx";

/**
 * The current state of the application. Makes it easy to bubble changes and reactions throughout the
 * application.
 */
export class AppStore {
  // KEEP ME: This is the element the application renders into: SHOULD NEVER BE OBSERVABLE
  container: HTMLElement;
  // Populates with the size of the screen
  @observable screenSize: [number, number] = [0, 0];

  @observable example = 0;

  @computed
  get exampleComputed() {
    return this.example;
  }
}

export const store = new AppStore();
