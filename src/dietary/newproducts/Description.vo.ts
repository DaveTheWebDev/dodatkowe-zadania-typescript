export class Description {
  private constructor(
    private desc: string,
    private longDesc: string,
  ) {
    if (desc === null || longDesc === null) {
      throw new Error('null or empty desc');
    }
    this.desc = desc;
    this.longDesc = longDesc;
  }

  static from(desc: string, longDesc: string): Description {
    return new Description(desc, longDesc);
  }

  replaceCharFromDesc(charToReplace: string, replaceWith: string): void {
    this.desc = this.desc.replace(charToReplace, replaceWith);
    this.longDesc = this.longDesc.replace(charToReplace, replaceWith);
  }

  formatDesc(): string {
    if (this.isAnyEmpty()) {
      return '';
    }

    return `${this.desc} *** ${this.longDesc}`;
  }

  private isAnyEmpty(): boolean {
    return this.desc.trim() === '' || this.longDesc.trim() === '';
  }
}
