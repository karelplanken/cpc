import { describe, expect, it, vi } from 'vitest';
import { ReportStore } from '../../docs/js/state/report-store.js';

describe('ReportStore', () => {
  it('assigns a unique id to every added report', () => {
    const store = new ReportStore();
    const firstId = store.add({ name: 'first' });
    const secondId = store.add({ name: 'second' });

    expect(firstId).not.toBe(secondId);
    expect(store.reports).toEqual([
      { id: firstId, name: 'first' },
      { id: secondId, name: 'second' },
    ]);
  });

  it('removes a report by id and never reuses ids', () => {
    const store = new ReportStore();
    const firstId = store.add({});
    store.remove(firstId);

    expect(store.reports).toEqual([]);
    expect(store.add({})).not.toBe(firstId);
  });

  it('notifies subscribers of changes only', () => {
    const store = new ReportStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    const id = store.add({});
    expect(listener).toHaveBeenLastCalledWith([{ id }]);

    store.remove('unknown');
    expect(listener).toHaveBeenCalledTimes(1);

    store.remove(id);
    expect(listener).toHaveBeenLastCalledWith([]);

    unsubscribe();
    store.add({});
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('does not expose its internal list', () => {
    const store = new ReportStore();
    store.reports.push({ id: 'intruder' });
    expect(store.reports).toEqual([]);
  });
});
