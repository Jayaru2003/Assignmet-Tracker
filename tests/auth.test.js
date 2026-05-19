// tests/auth.test.js
// Unit tests for the Auth controller logic (register & login validation)

/**
 * These tests check the controller's validation and response logic
 * using mock req/res objects — no real HTTP server or DB required.
 */

const authController = require('../controllers/authController');

// ── Mock response helper ──────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status   = jest.fn().mockReturnValue(res);
  res.json     = jest.fn().mockReturnValue(res);
  res.render   = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.cookie   = jest.fn().mockReturnValue(res);
  return res;
};

// ── Mock User model ───────────────────────────────────────────────
jest.mock('../models/User', () => {
  const mockUser = {
    _id:             'user123',
    name:            'Test User',
    email:           'test@example.com',
    comparePassword: jest.fn(),
  };
  const Model = jest.fn().mockImplementation(() => mockUser);
  Model.findOne  = jest.fn();
  Model.create   = jest.fn();
  return Model;
});

const User = require('../models/User');

// ── Mock jsonwebtoken ─────────────────────────────────────────────
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token'),
}));

// ── Register tests ────────────────────────────────────────────────
describe('Auth Controller — Register', () => {

  beforeEach(() => jest.clearAllMocks());

  test('renders register page on GET', () => {
    const req = {};
    const res = mockRes();
    authController.getRegister(req, res);
    expect(res.render).toHaveBeenCalledWith('register', expect.objectContaining({ error: null }));
  });

  test('renders error when name is missing', async () => {
    const req = { body: { name: '', email: 'a@b.com', password: '123456', confirmPassword: '123456' } };
    const res = mockRes();
    await authController.postRegister(req, res);
    expect(res.render).toHaveBeenCalledWith('register', expect.objectContaining({ error: expect.any(String) }));
  });

  test('renders error when passwords do not match', async () => {
    const req = { body: { name: 'Test', email: 'a@b.com', password: 'abc123', confirmPassword: 'wrong' } };
    const res = mockRes();
    await authController.postRegister(req, res);
    expect(res.render).toHaveBeenCalledWith('register', expect.objectContaining({ error: 'Passwords do not match.' }));
  });

  test('renders error when password is too short', async () => {
    const req = { body: { name: 'Test', email: 'a@b.com', password: '123', confirmPassword: '123' } };
    const res = mockRes();
    await authController.postRegister(req, res);
    expect(res.render).toHaveBeenCalledWith('register', expect.objectContaining({
      error: expect.stringContaining('6 characters'),
    }));
  });

  test('renders error when email already exists', async () => {
    User.findOne.mockResolvedValue({ email: 'a@b.com' }); // simulate existing user
    const req = { body: { name: 'Test', email: 'a@b.com', password: '123456', confirmPassword: '123456' } };
    const res = mockRes();
    await authController.postRegister(req, res);
    expect(res.render).toHaveBeenCalledWith('register', expect.objectContaining({
      error: expect.stringContaining('already exists'),
    }));
  });

  test('redirects to /assignments on successful registration', async () => {
    User.findOne.mockResolvedValue(null);                  // no existing user
    User.create.mockResolvedValue({ _id: 'newUserId' });
    const req = { body: { name: 'Test', email: 'new@b.com', password: '123456', confirmPassword: '123456' } };
    const res = mockRes();
    await authController.postRegister(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/assignments');
  });
});

// ── Login tests ───────────────────────────────────────────────────
describe('Auth Controller — Login', () => {

  beforeEach(() => jest.clearAllMocks());

  test('renders login page on GET', () => {
    const req = { query: {} };
    const res = mockRes();
    authController.getLogin(req, res);
    expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({ error: null }));
  });

  test('renders error when fields are empty', async () => {
    const req = { body: { email: '', password: '' } };
    const res = mockRes();
    await authController.postLogin(req, res);
    expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({ error: expect.any(String) }));
  });

  test('renders error for non-existent user', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req = { body: { email: 'nobody@b.com', password: 'password' } };
    const res = mockRes();
    await authController.postLogin(req, res);
    expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({
      error: 'Invalid email or password.',
    }));
  });

  test('renders error for wrong password', async () => {
    const fakeUser = { comparePassword: jest.fn().mockResolvedValue(false) };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    const req = { body: { email: 'test@b.com', password: 'wrongpass' } };
    const res = mockRes();
    await authController.postLogin(req, res);
    expect(res.render).toHaveBeenCalledWith('login', expect.objectContaining({
      error: 'Invalid email or password.',
    }));
  });

  test('redirects to /assignments on successful login', async () => {
    const fakeUser = { _id: 'uid123', comparePassword: jest.fn().mockResolvedValue(true) };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    const req = { body: { email: 'test@b.com', password: 'correctpass' } };
    const res = mockRes();
    await authController.postLogin(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/assignments');
  });

  test('clears cookie on logout and redirects', () => {
    const req = {};
    const res = mockRes();
    res.clearCookie = jest.fn().mockReturnValue(res);
    authController.logout(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith('token');
    expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('/auth/login'));
  });
});
