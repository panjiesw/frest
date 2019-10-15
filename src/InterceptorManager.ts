export class InterceptorManager<T> {
  get handlers(): T[] {
    return this._int;
  }

  private _int: T[] = [];

  public use(handler: T): number {
    this._int.push(handler);
    return this._int.length - 1;
  }

  public eject(id: number) {
    this._int.splice(id, 1);
  }
}
