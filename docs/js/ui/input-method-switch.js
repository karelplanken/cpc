/**
 * The radio buttons that choose between the input methods. Only the form of
 * the chosen method is visible; the other forms are reset and hidden.
 */
export class InputMethodSwitch {
  #options;

  /**
   * @param {{ radio: HTMLInputElement, form: { element: HTMLElement, reset(): void } }[]} options
   *   Each radio button with the form it reveals.
   */
  constructor(options) {
    this.#options = options;
    for (const { radio } of options) {
      radio.addEventListener('change', () => this.#update());
    }
    this.#update();
  }

  /** Deselects all methods, which hides and resets all forms. */
  reset() {
    for (const { radio } of this.#options) {
      radio.checked = false;
    }
    this.#update();
  }

  #update() {
    for (const { radio, form } of this.#options) {
      form.element.hidden = !radio.checked;
      if (!radio.checked) {
        form.reset();
      }
    }
  }
}
