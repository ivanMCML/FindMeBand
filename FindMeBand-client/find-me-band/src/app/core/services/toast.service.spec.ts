import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('počinje bez poruka', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('bilježi ton poruke', () => {
    service.error('Nije uspjelo');
    service.success('Spremljeno');

    expect(service.toasts().map(t => t.tone)).toEqual(['error', 'success']);
  });

  it('sama povlači poruku nakon isteka', () => {
    service.info('Poruka');
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(5000);
    expect(service.toasts()).toEqual([]);
  });

  it('zadržava najviše tri poruke odjednom', () => {
    ['a', 'b', 'c', 'd', 'e'].forEach(m => service.info(m));

    expect(service.toasts()).toHaveLength(3);
    expect(service.toasts().map(t => t.message)).toEqual(['c', 'd', 'e']);
  });

  it('zatvara poruku na zahtjev', () => {
    service.info('Poruka');
    const id = service.toasts()[0].id;

    service.dismiss(id);
    expect(service.toasts()).toEqual([]);
  });

  it('dodjeljuje različite oznake uzastopnim porukama', () => {
    service.info('prva');
    service.info('druga');

    const [a, b] = service.toasts();
    expect(a.id).not.toBe(b.id);
  });
});
