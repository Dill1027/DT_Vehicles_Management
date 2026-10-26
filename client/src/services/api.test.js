describe('API connection failures', () => {
  let client, axios, toast, onError, originalUrl;
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    originalUrl = process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_API_URL;
    client = { defaults: {}, interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }, get: jest.fn() };
    axios = Object.assign(jest.fn(), { create: jest.fn(() => client) });
    toast = { error: jest.fn() };
    jest.doMock('axios', () => ({ __esModule: true, default: axios }));
    jest.doMock('react-hot-toast', () => ({ toast }));
    jest.spyOn(console, 'log').mockImplementation(() => {});
    require('./api');
    onError = client.interceptors.response.use.mock.calls[0][1];
  });
  afterEach(() => {
    if (originalUrl === undefined) delete process.env.REACT_APP_API_URL;
    else process.env.REACT_APP_API_URL = originalUrl;
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  test('local development defaults to backend port 5002', () => {
    expect(axios.create.mock.calls[0][0].baseURL).toBe('http://localhost:5002/api');
    expect(axios.create.mock.calls[0][0].withCredentials).toBe(true);
  });
  test.each(['ECONNABORTED', 'ERR_NETWORK'])('%s rejects without replaying the request', async code => {
    const error = Object.assign(new Error('Request failed'), { code, config: { baseURL: 'http://localhost:5002/api', method: 'post' } });
    await expect(onError(error)).rejects.toBe(error);
    expect(axios).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
  test('database unavailable errors preserve the response for callers', async () => {
    const error = Object.assign(new Error('Unavailable'), { response: { status: 503 } });
    await expect(onError(error)).rejects.toBe(error);
    expect(toast.error).toHaveBeenCalledWith('Database temporarily unavailable. Please try again shortly.');
  });
});
