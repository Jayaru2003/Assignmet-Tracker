// tests/assignment.test.js
// Unit tests for the Assignment API controller (JSON endpoints)

const apiController = require('../controllers/apiController');

// ── Mock response helper ──────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status   = jest.fn().mockReturnValue(res);
  res.json     = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

// ── Mock Assignment model ─────────────────────────────────────────
jest.mock('../models/Assignment', () => ({
  find:             jest.fn(),
  create:           jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
}));

const Assignment = require('../models/Assignment');

// ── Sample data ───────────────────────────────────────────────────
const sampleUser = { _id: 'user123' };
const sampleAssignment = {
  _id:      'assign001',
  title:    'Calculus HW',
  subject:  'Math',
  deadline: new Date('2025-12-31'),
  status:   'pending',
  userId:   'user123',
};

// ── GET /api/assignments ──────────────────────────────────────────
describe('API Controller — GET assignments', () => {

  beforeEach(() => jest.clearAllMocks());

  test('returns 200 with assignments array', async () => {
    const sortMock = jest.fn().mockResolvedValue([sampleAssignment]);
    Assignment.find.mockReturnValue({ sort: sortMock });

    const req = { user: sampleUser, query: { filter: 'all', search: '' } };
    const res = mockRes();
    await apiController.getAssignments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, count: 1 })
    );
  });

  test('returns 500 on database error', async () => {
    Assignment.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB error')),
    });
    const req = { user: sampleUser, query: {} };
    const res = mockRes();
    await apiController.getAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});

// ── POST /api/assignments ─────────────────────────────────────────
describe('API Controller — POST (create assignment)', () => {

  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when title is missing', async () => {
    const req = { user: sampleUser, body: { title: '', deadline: '2025-12-31' } };
    const res = mockRes();
    await apiController.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Title is required' }));
  });

  test('returns 400 when deadline is missing', async () => {
    const req = { user: sampleUser, body: { title: 'HW', deadline: '' } };
    const res = mockRes();
    await apiController.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Deadline is required' }));
  });

  test('returns 201 when assignment is created successfully', async () => {
    Assignment.create.mockResolvedValue(sampleAssignment);
    const req = { user: sampleUser, body: { title: 'Calculus HW', subject: 'Math', deadline: '2025-12-31', status: 'pending' } };
    const res = mockRes();
    await apiController.createAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ── PUT /api/assignments/:id ──────────────────────────────────────
describe('API Controller — PUT (update status)', () => {

  beforeEach(() => jest.clearAllMocks());

  test('returns 400 for invalid status value', async () => {
    const req = { user: sampleUser, params: { id: 'assign001' }, body: { status: 'invalid' } };
    const res = mockRes();
    await apiController.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 when assignment not found or not owned by user', async () => {
    Assignment.findOneAndUpdate.mockResolvedValue(null);
    const req = { user: sampleUser, params: { id: 'badid' }, body: { status: 'completed' } };
    const res = mockRes();
    await apiController.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 200 with updated assignment', async () => {
    Assignment.findOneAndUpdate.mockResolvedValue({ ...sampleAssignment, status: 'completed' });
    const req = { user: sampleUser, params: { id: 'assign001' }, body: { status: 'completed' } };
    const res = mockRes();
    await apiController.updateAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

// ── DELETE /api/assignments/:id ───────────────────────────────────
describe('API Controller — DELETE assignment', () => {

  beforeEach(() => jest.clearAllMocks());

  test('returns 404 when assignment not found', async () => {
    Assignment.findOneAndDelete.mockResolvedValue(null);
    const req = { user: sampleUser, params: { id: 'badid' } };
    const res = mockRes();
    await apiController.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 200 on successful deletion', async () => {
    Assignment.findOneAndDelete.mockResolvedValue(sampleAssignment);
    const req = { user: sampleUser, params: { id: 'assign001' } };
    const res = mockRes();
    await apiController.deleteAssignment(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Assignment deleted' }));
  });
});
