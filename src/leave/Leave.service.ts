import { Employee } from './Employee';
import { Result } from './Result.enum';

export class LeaveService {
  constructor(
    private database: LeaveDatabase,
    private messageBus: MessageBus,
    private emailSender: EmailSender,
    private escalationManager: EscalationManager,
  ) {}

  public requestPaidDaysOff(days: number, employeeId: number): Result {
    if (days < 0) {
      throw new Error('Invalid argument');
    }

    const employeeData = this.database.findByEmployeeId(employeeId);

    const result = employeeData.requestDaysOff(days);

    if (result === Result.Manual) {
      this.escalationManager.notifyNewPendingRequest(employeeId);
    }

    if (result === Result.Approved) {
      this.database.save(employeeData);
      this.messageBus.sendEvent('request approved');
    }

    if (result === Result.Denied) {
      this.emailSender.send('next time');
    }

    return result;
  }
}

export class LeaveDatabase {
  findByEmployeeId(_employeeId: number): Employee {
    return new Employee('', 10);
  }

  save(_employeeData: Employee): void {}
}

export class MessageBus {
  sendEvent(_msg: string): void {}
}

export class EmailSender {
  send(_msg: string): void {}
}

export class EscalationManager {
  notifyNewPendingRequest(_employeeId: number): void {}
}

export class Configuration {
  getMaxDaysForPerformers(): number {
    return 45;
  }

  getMaxDays(): number {
    return 26;
  }
}
