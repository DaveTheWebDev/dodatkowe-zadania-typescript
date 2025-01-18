import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  LeaveService,
  LeaveDatabase,
  EscalationManager,
  MessageBus,
  EmailSender,
} from '@leave/Leave.service';
import { Result } from '@leave/Result.enum';
import { Employee } from '@leave/Employee';

describe('LeaveService', () => {
  const ONE = 1;

  let leaveService: LeaveService;
  let database: LeaveDatabase;
  let escalationManager: EscalationManager;
  let messageBus: MessageBus;
  let emailSender: EmailSender;

  beforeEach(() => {
    database = {
      findByEmployeeId: vi.fn(),
      save: vi.fn(),
    };
    escalationManager = { notifyNewPendingRequest: vi.fn() };
    messageBus = { sendEvent: vi.fn() };
    emailSender = { send: vi.fn() };

    leaveService = new LeaveService(
      database,
      messageBus,
      emailSender,
      escalationManager,
    );
  });

  describe('Performer', () => {
    it('should require manual processing for requests exceeding 26 days', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('PERFORMER', 10),
      );

      const result = leaveService.requestPaidDaysOff(30, ONE);

      expect(result).toBe(Result.Manual);
      expect(escalationManager.notifyNewPendingRequest).toHaveBeenCalledWith(
        ONE,
      );
      expect(emailSender.send).not.toHaveBeenCalled();
      expect(messageBus.sendEvent).not.toHaveBeenCalled();
      expect(database.save).not.toHaveBeenCalled();
    });

    it('should deny requests for more than 45 days', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('PERFORMER', 10),
      );

      const result = leaveService.requestPaidDaysOff(50, ONE);

      expect(result).toBe(Result.Denied);
      expect(emailSender.send).toHaveBeenCalledWith('next time');
      expect(escalationManager.notifyNewPendingRequest).not.toHaveBeenCalled();
      expect(messageBus.sendEvent).not.toHaveBeenCalled();
      expect(database.save).not.toHaveBeenCalled();
    });
  });

  describe('Slacker', () => {
    it('should deny all leave requests', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('SLACKER', 10),
      );

      const result = leaveService.requestPaidDaysOff(1, ONE);

      expect(result).toBe(Result.Denied);
    });

    it('should send a polite rejection email', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('SLACKER', 10),
      );

      leaveService.requestPaidDaysOff(1, ONE);

      expect(emailSender.send).toHaveBeenCalledWith('next time');
    });
  });

  describe('Regular employee', () => {
    it('should deny requests exceeding 26 days', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('REGULAR', 10),
      );

      const result = leaveService.requestPaidDaysOff(20, ONE);

      expect(result).toBe(Result.Denied);
      expect(emailSender.send).toHaveBeenCalledWith('next time');
      expect(escalationManager.notifyNewPendingRequest).not.toHaveBeenCalled();
      expect(messageBus.sendEvent).not.toHaveBeenCalled();
      expect(database.save).not.toHaveBeenCalled();
    });

    it('should approve requests within the 26-day limit', () => {
      vi.spyOn(database, 'findByEmployeeId').mockReturnValue(
        new Employee('REGULAR', 10),
      );

      const result = leaveService.requestPaidDaysOff(5, ONE);

      expect(result).toBe(Result.Approved);
      expect(messageBus.sendEvent).toHaveBeenCalledWith('request approved');
      expect(escalationManager.notifyNewPendingRequest).not.toHaveBeenCalled();
      expect(emailSender.send).not.toHaveBeenCalled();
      expect(database.save).toHaveBeenCalledWith(new Employee('REGULAR', 15));
    });
  });
});
