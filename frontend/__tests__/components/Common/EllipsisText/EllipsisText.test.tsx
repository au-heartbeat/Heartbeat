import EllipsisText from '@src/components/Common/EllipsisText';
import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';

describe('EllipsisText', () => {
  const WIDTH = '500rem';

  it('should forward ref properly', () => {
    const ref = React.createRef<HTMLParagraphElement>();
    render(
      <EllipsisText fitContent>
        <span aria-label='test-ref' ref={ref}>
          test
        </span>
      </EllipsisText>,
    );

    const childDOM = screen.getByLabelText('test-ref');

    expect(ref.current).toEqual(childDOM);
  });

  it('should apply fit-content as its width when `fitContent` specified', async () => {
    act(() => {
      render(
        <div style={{ width: WIDTH }}>
          <EllipsisText aria-label='test-ellipsis-text' fitContent>
            <span>test</span>
          </EllipsisText>
        </div>,
      );
    });

    const targetElement = screen.getByLabelText('test-ellipsis-text');

    expect(targetElement).toHaveStyle({ width: 'fit-content' });
  });

  it('should apply fit-content as its width when `fitContent` explicitly set to false', async () => {
    act(() => {
      render(
        <div style={{ width: WIDTH }}>
          <EllipsisText aria-label='test-ellipsis-text' fitContent={false}>
            <span>test</span>
          </EllipsisText>
        </div>,
      );
    });

    const targetElement = screen.getByLabelText('test-ellipsis-text');

    expect(targetElement).toHaveStyle({ width: 'auto' });
  });
});
