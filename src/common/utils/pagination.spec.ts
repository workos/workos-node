import { List, PaginationOptions } from '../interfaces';
import { AutoPaginatable } from './pagination';

type TestObject = {
  id: string;
};

describe('AutoPaginatable', () => {
  let mockApiCall: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockApiCall = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns initial data when limit is specified', async () => {
    const initialData: List<TestObject> = {
      object: 'list',
      data: [{ id: '1' }, { id: '2' }],
      listMetadata: { after: 'cursor1' },
    };

    const paginatable = new AutoPaginatable<TestObject, PaginationOptions>(
      initialData,
      mockApiCall,
      { limit: 2 },
    );

    const result = await paginatable.autoPagination();

    expect(result).toEqual(initialData.data);
    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it('paginates through all pages', async () => {
    const initialData: List<TestObject> = {
      object: 'list',
      data: [{ id: '1' }, { id: '2' }],
      listMetadata: { after: 'cursor1' },
    };

    mockApiCall
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '3' }, { id: '4' }],
        listMetadata: { after: 'cursor2' },
      })
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '5' }, { id: '6' }],
        listMetadata: { after: null },
      });

    const paginatable = new AutoPaginatable<TestObject, PaginationOptions>(
      initialData,
      mockApiCall,
    );

    const resultPromise = paginatable.autoPagination();

    // Fast-forward through setTimeout calls
    jest.advanceTimersByTimeAsync(250);

    const result = await resultPromise;

    expect(result).toEqual([
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
    ]);

    expect(mockApiCall).toHaveBeenCalledTimes(2);
    expect(mockApiCall).toHaveBeenNthCalledWith(1, {
      limit: 100,
      after: undefined,
    });
    expect(mockApiCall).toHaveBeenNthCalledWith(2, {
      limit: 100,
      after: 'cursor2',
    });
  });

  it('respects rate limiting between requests', async () => {
    const initialData: List<TestObject> = {
      object: 'list',
      data: [{ id: '1' }],
      listMetadata: { after: 'cursor1' },
    };

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

    mockApiCall
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '2' }],
        listMetadata: { after: 'cursor2' },
      })
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '3' }],
        listMetadata: { after: null },
      });

    const paginatable = new AutoPaginatable<TestObject, PaginationOptions>(
      initialData,
      mockApiCall,
    );

    const resultPromise = paginatable.autoPagination();

    jest.advanceTimersByTimeAsync(250);
    await resultPromise;

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 250);
  });

  it('passes through additional options to API calls', async () => {
    const initialData: List<TestObject> = {
      object: 'list',
      data: [{ id: '1' }],
      listMetadata: { after: 'cursor1' },
    };

    mockApiCall
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '2' }],
        listMetadata: { after: 'cursor2' },
      })
      .mockResolvedValueOnce({
        object: 'list',
        data: [{ id: '3' }],
        listMetadata: { after: null },
      });

    const paginatable = new AutoPaginatable<
      TestObject,
      PaginationOptions & { status: 'active' }
    >(initialData, mockApiCall, { status: 'active' });

    const resultPromise = paginatable.autoPagination();
    jest.advanceTimersByTimeAsync(1000);
    await resultPromise;

    expect(mockApiCall).toHaveBeenNthCalledWith(1, {
      after: undefined,
      status: 'active',
      limit: 100,
    });
    expect(mockApiCall).toHaveBeenNthCalledWith(2, {
      after: 'cursor2',
      status: 'active',
      limit: 100,
    });
  });
});
