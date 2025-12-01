import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BugsService } from '../../src/services/bugs.services';
import { BugsRepository } from '../../src/Repositories/bugs.repository';
import type { Bug } from '../../src/Types/bugs.types';

vi.mock('../../src/Repositories/bugs.repository');

describe('BugsService', () => {
  let service: BugsService;
  let repoMock: vi.Mocked<BugsRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BugsService();
    repoMock = new BugsRepository() as unknown as vi.Mocked<BugsRepository>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeBug = (overrides: Partial<Bug> = {}): Bug => ({
    project_id: 1,
    reported_by: 1,
    title: 'Valid title',
    severity: 'low',
    status: 'open',
    ...overrides,
  });

  describe('createBug', () => {
    it('throws when title is missing or too short', async () => {
      await expect(service.createBug(makeBug({ title: '' } as any))).rejects.toThrow(
        'Title is required and must be at least 3 characters',
      );
      await expect(service.createBug(makeBug({ title: 'ab' }))).rejects.toThrow(
        'Title is required and must be at least 3 characters',
      );
    });

    it('throws when project_id is missing', async () => {
      await expect(service.createBug(makeBug({ project_id: undefined as any }))).rejects.toThrow(
        'Project ID is required',
      );
    });

    it('sets defaults and calls repository.create', async () => {
      const createSpy = vi
        .spyOn(BugsRepository.prototype, 'create')
        .mockResolvedValueOnce([{ bugid: 1 }] as any);

      const payload = makeBug({ status: undefined as any, severity: undefined as any });
      const result = await service.createBug(payload);

      expect(createSpy).toHaveBeenCalledTimes(1);
      const arg = createSpy.mock.calls[0][0] as Bug;
      expect(arg.status).toBe('open');
      expect(arg.severity).toBe('low');
      expect(arg.created_at).toBeInstanceOf(Date);
      expect(arg.updated_at).toBeInstanceOf(Date);
      expect(result).toEqual([{ bugid: 1 }]);
    });
  });

  describe('getAllBugs', () => {
    it('returns bugs from repository', async () => {
      const sample: Bug[] = [makeBug({ bugid: 1 })];
      vi.spyOn(BugsRepository.prototype, 'getAllBugs').mockResolvedValueOnce(sample);

      const result = await service.getAllBugs();
      expect(result).toEqual(sample);
    });
  });

  describe('getBug', () => {
    it('throws for invalid id', async () => {
      await expect(service.getBug(0 as any)).rejects.toThrow('Invalid bug ID');
    });

    it('throws when bug is not found', async () => {
      vi.spyOn(BugsRepository.prototype, 'findById').mockResolvedValueOnce(null);
      await expect(service.getBug(1)).rejects.toThrow('Bug with ID 1 not found');
    });

    it('returns bug when found', async () => {
      const bug = makeBug({ bugid: 1 });
      vi.spyOn(BugsRepository.prototype, 'findById').mockResolvedValueOnce(bug);
      const result = await service.getBug(1);
      expect(result).toEqual(bug);
    });
  });

  describe('listByProject', () => {
    it('throws for invalid project id', async () => {
      await expect(service.listByProject(0 as any)).rejects.toThrow('Invalid project ID');
    });

    it('throws when no bugs for project', async () => {
      vi.spyOn(BugsRepository.prototype, 'findAllByProject').mockResolvedValueOnce([]);
      await expect(service.listByProject(1)).rejects.toThrow('No bugs found for project ID 1');
    });

    it('returns bugs when found', async () => {
      const bugs = [makeBug({ bugid: 1 })];
      vi.spyOn(BugsRepository.prototype, 'findAllByProject').mockResolvedValueOnce(bugs);
      const result = await service.listByProject(1);
      expect(result).toEqual(bugs);
    });
  });

  describe('updateBug', () => {
    it('throws for invalid id', async () => {
      await expect(service.updateBug(0 as any, {})).rejects.toThrow('Invalid bug ID');
    });

    it('throws for invalid status', async () => {
      await expect(
        service.updateBug(1, { status: 'not_a_status' as any }),
      ).rejects.toThrow('Invalid status value');
    });

    it('calls repository.update for valid data', async () => {
      const updateSpy = vi
        .spyOn(BugsRepository.prototype, 'update')
        .mockResolvedValueOnce(undefined);

      await service.updateBug(1, { status: 'resolved' });

      expect(updateSpy).toHaveBeenCalledWith(1, { status: 'resolved' });
    });
  });

  describe('deleteBug', () => {
    it('throws for invalid id', async () => {
      await expect(service.deleteBug(0 as any)).rejects.toThrow('Invalid bug ID');
    });

    it('throws when bug does not exist', async () => {
      vi.spyOn(BugsRepository.prototype, 'findById').mockResolvedValueOnce(null);
      await expect(service.deleteBug(1)).rejects.toThrow(
        'Cannot delete — Bug with ID 1 does not exist',
      );
    });

    it('calls delete when bug exists', async () => {
      vi.spyOn(BugsRepository.prototype, 'findById').mockResolvedValueOnce(
        makeBug({ bugid: 1 }),
      );
      const deleteSpy = vi
        .spyOn(BugsRepository.prototype, 'delete')
        .mockResolvedValueOnce(undefined);

      await service.deleteBug(1);
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });
});


