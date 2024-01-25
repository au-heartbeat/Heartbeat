import { ProjectDescription } from '@src/components/ProjectDescription';
import { render, screen } from '@testing-library/react';
import { PROJECT_DESCRIPTION } from '../fixtures';
import { act } from 'react-dom/test-utils';

describe('ProjectDescription', () => {
  it('should show project description', () => {
    act(() => {
      render(<ProjectDescription />);
    });

    expect(screen.getByRole('description').textContent).toContain(PROJECT_DESCRIPTION);
  });
});
