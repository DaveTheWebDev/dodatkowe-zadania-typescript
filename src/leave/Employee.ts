import { Result } from './Result.enum';

export class Employee {
  constructor(
    private status: string,
    private daysSoFar: number,
  ) {}

  requestDaysOff(days: number): Result {
    if (days < 0) {
      throw new Error('Invalid argument');
    }

    if (this.daysSoFar + days > 26) {
      if (this.status === 'PERFORMER' && this.daysSoFar + days < 45) {
        return Result.Manual;
      } else {
        return Result.Denied;
      }
    } else {
      if (this.status === 'SLACKER') {
        return Result.Denied;
      } else {
        this.daysSoFar += days;
        return Result.Approved;
      }
    }
  }
}
