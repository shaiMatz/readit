import { getDomain, getRelativeTime, formatCount } from '../formatters';

describe('getDomain', () => {
  it('strips www. prefix', () => {
    expect(getDomain('https://www.github.com/user/repo')).toBe('github.com');
  });

  it('returns bare hostname for non-www URLs', () => {
    expect(getDomain('https://news.ycombinator.com/item?id=1')).toBe(
      'news.ycombinator.com',
    );
  });

  it('returns empty string for undefined', () => {
    expect(getDomain(undefined)).toBe('');
  });

  it('returns empty string for malformed URL', () => {
    expect(getDomain('not-a-url')).toBe('');
  });
});

describe('formatCount', () => {
  it('returns plain string for values below 1000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('formats thousands with one decimal place and k suffix', () => {
    expect(formatCount(1000)).toBe('1.0k');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(10000)).toBe('10.0k');
  });
});

describe('getRelativeTime', () => {
  const NOW = 1_700_000_000; // fixed Unix seconds

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW * 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns seconds ago for < 60s', () => {
    expect(getRelativeTime(NOW - 30)).toBe('30s ago');
  });

  it('returns minutes ago for < 60m', () => {
    expect(getRelativeTime(NOW - 90)).toBe('1m ago');
    expect(getRelativeTime(NOW - 3540)).toBe('59m ago');
  });

  it('returns hours ago for < 24h', () => {
    expect(getRelativeTime(NOW - 3600)).toBe('1h ago');
    expect(getRelativeTime(NOW - 82800)).toBe('23h ago');
  });

  it('returns days ago for < 30d', () => {
    expect(getRelativeTime(NOW - 86400)).toBe('1d ago');
    expect(getRelativeTime(NOW - 86400 * 29)).toBe('29d ago');
  });

  it('returns months ago for < 12mo', () => {
    expect(getRelativeTime(NOW - 86400 * 31)).toBe('1mo ago');
  });

  it('returns years ago for >= 12mo', () => {
    expect(getRelativeTime(NOW - 86400 * 366)).toBe('1y ago');
  });
});
