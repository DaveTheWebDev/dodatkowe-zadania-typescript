import { Employee } from '@leave/Employee';
import { Result } from '@leave/Result.enum';
import { describe, it, expect } from 'vitest';
describe('Employee', () => {
  describe('requestDaysOff', () => {
    it('should throw an error for negative days', () => {
      const employee = new Employee('REGULAR', 0);
      expect(() => employee.requestDaysOff(-1)).toThrow('Invalid argument');
    });

    describe('PERFORMER', () => {
      it('should return Manual for requests exceeding 26 days but less than 45 days', () => {
        const employee = new Employee('PERFORMER', 20);
        expect(employee.requestDaysOff(10)).toBe(Result.Manual);
      });

      it('should return Denied for requests exceeding 45 days', () => {
        const employee = new Employee('PERFORMER', 20);
        expect(employee.requestDaysOff(26)).toBe(Result.Denied);
      });

      it('should return Approved for requests within 26 days', () => {
        const employee = new Employee('PERFORMER', 20);
        expect(employee.requestDaysOff(5)).toBe(Result.Approved);
      });
    });

    describe('SLACKER', () => {
      it('should return Denied for any request', () => {
        const employee = new Employee('SLACKER', 0);
        expect(employee.requestDaysOff(1)).toBe(Result.Denied);
      });
    });

    describe('REGULAR', () => {
      it('should return Denied for requests exceeding 26 days', () => {
        const employee = new Employee('REGULAR', 20);
        expect(employee.requestDaysOff(7)).toBe(Result.Denied);
      });

      it('should return Approved for requests within 26 days', () => {
        const employee = new Employee('REGULAR', 20);
        expect(employee.requestDaysOff(5)).toBe(Result.Approved);
      });
    });
  });
});
