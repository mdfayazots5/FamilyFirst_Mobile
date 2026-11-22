import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosAdapter } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';
import apiClient from '../../../core/network/apiClient';
import AddMemberScreen from './AddMemberScreen';

vi.mock('../../../core/auth/AuthContext', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../../core/auth/AuthContext')>(),
  useAuth: () => ({ user: { familyId: 'test-family' } }),
}));

const originalAdapter = apiClient.defaults.adapter;
afterEach(() => {
  apiClient.defaults.adapter = originalAdapter;
});

it('serializes the selected Elder role and a local phone number in the invite request', async () => {
  const roles = [
    { id: 'platform-admin', name: 'SuperAdmin', code: 'SA' },
    { id: 'family-admin', name: 'FamilyAdmin', code: 'FA' },
    { id: 'parent', name: 'Parent', code: 'PA' },
    { id: 'child', name: 'Child', code: 'CH' },
    { id: 'teacher', name: 'Teacher', code: 'TE' },
    { id: 'elder', name: 'Elder', code: 'EL' },
  ];
  const adapter = vi.fn<AxiosAdapter>(async (config) => ({
    data: { data: config.url === '/GetMasters' ? { items: roles } : { role: 6 } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }));
  apiClient.defaults.adapter = adapter;

  render(<MemoryRouter><AddMemberScreen /></MemoryRouter>);

  const select = await screen.findByRole('combobox', { name: 'Role' });
  expect(select).toHaveDisplayValue('Parent');
  expect(screen.queryByRole('option', { name: 'SuperAdmin' })).toBeNull();

  for (const { id, name } of roles.slice(1)) {
    fireEvent.change(select, { target: { value: id } });
    expect(select).toHaveDisplayValue(name);
  }

  fireEvent.change(select, { target: { value: 'elder' } });
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test Member' } });
  const phone = screen.getByLabelText('Phone number');
  const submit = screen.getByRole('button', { name: 'Send invite' });
  fireEvent.change(phone, { target: { value: '+91 1234' } });
  fireEvent.click(submit);
  expect(await screen.findByText(/Enter a 10-digit Indian phone number/)).toBeInTheDocument();
  expect(adapter.mock.calls.some(([config]) => config.url?.endsWith('/members'))).toBe(false);

  fireEvent.change(phone, { target: { value: '90000 00099' } });
  fireEvent.change(screen.getByLabelText('Relationship'), { target: { value: 'Grandmother' } });
  fireEvent.click(submit);

  await waitFor(() => {
    const request = adapter.mock.calls.find(([config]) => config.url === '/families/test-family/members')?.[0];
    expect(request?.data).toBe(JSON.stringify({
      PhoneNumber: '+919000000099',
      FullName: 'Test Member',
      Role: 6,
      LinkType: 'Grandmother',
    }));
  });
  expect(await screen.findByText('Test Member has been added')).toBeInTheDocument();
});
