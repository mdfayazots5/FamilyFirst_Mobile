import { expect, it, vi } from 'vitest';
import apiClient from '../../../core/network/apiClient';
import { FeedbackRepository } from './FeedbackRepository';

it('loads each feedback page with the same child filter', async () => {
  const get = vi.spyOn(apiClient, 'get')
    .mockResolvedValueOnce({ data: { data: { items: [{ feedbackId: 'first' }], hasNextPage: true } } })
    .mockResolvedValueOnce({ data: { data: { items: [{ feedbackId: 'second' }], hasNextPage: false } } });

  const result = await FeedbackRepository.getFeedbackInbox('family', 'child');

  expect(result.map((item) => item.id)).toEqual(['first', 'second']);
  expect(get.mock.calls).toEqual([
    ['/families/family/feedback', { params: { childId: 'child', page: 1 } }],
    ['/families/family/feedback', { params: { childId: 'child', page: 2 } }],
  ]);
});
