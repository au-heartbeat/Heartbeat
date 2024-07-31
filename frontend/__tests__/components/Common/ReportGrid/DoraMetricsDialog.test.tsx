import { DoraMetricsDialog } from '@src/components/Common/ReportGrid/ReportCard/DoraMetricsDialog';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Dora Metrics Dialog', () => {
  it('should render dialog successfully when show dialog and contains Definitions', () => {
    const title = 'Lead time for changes';

    render(<DoraMetricsDialog isShowDialog={true} hiddenDialog={() => {}} title={title} />);

    const definition = screen.queryByLabelText('definition');

    expect(screen.queryByLabelText('dora metrics dialog')).toBeInTheDocument();
    expect(screen.queryByLabelText('dora metrics dialog container')).toBeInTheDocument();
    expect(screen.queryByLabelText('close')).toBeInTheDocument();
    expect(screen.queryByText('DORA Metrics')).toBeInTheDocument();
    expect(screen.queryByText(title)).toBeInTheDocument();
    expect(definition).toBeInTheDocument();
    expect(screen.queryByLabelText('influenced factors')).toBeInTheDocument();
    expect(screen.queryByLabelText('formula')).toBeInTheDocument();

    const innerHtml = definition!.innerHTML;

    expect(innerHtml.includes('Definition')).toEqual(true);
    expect(innerHtml.includes('Definitions')).toEqual(true);
  });

  it('should hidden the dialog when click close button', async () => {
    const title = 'Lead time for changes';
    const handleHidden = jest.fn();

    render(<DoraMetricsDialog isShowDialog={true} hiddenDialog={handleHidden} title={title} />);

    const closeButton = screen.queryByLabelText('close');

    expect(closeButton).toBeInTheDocument();

    await userEvent.click(closeButton!);

    expect(handleHidden).toHaveBeenCalledTimes(1);
  });

  it('should hidden the dialog when click non-dialog content', async () => {
    const title = 'Lead time for changes';
    const handleHidden = jest.fn();

    render(<DoraMetricsDialog isShowDialog={true} hiddenDialog={handleHidden} title={title} />);

    const dialogNotContainer = document.querySelector(
      '[aria-label="dora metrics dialog"] *:not([aria-label="dora metrics dialog container"])',
    );

    expect(dialogNotContainer).toBeInTheDocument();

    await userEvent.click(dialogNotContainer!);

    expect(handleHidden).toHaveBeenCalledTimes(1);
  });

  it('should go to the new page when click the formula', async () => {
    const title = 'Lead time for changes';
    const handleHidden = jest.fn();

    render(<DoraMetricsDialog isShowDialog={true} hiddenDialog={handleHidden} title={title} />);

    const formula = screen.queryByLabelText('formula');

    expect(formula).toBeInTheDocument();

    const linkElement = formula!.querySelector('a');

    expect(linkElement).toBeInTheDocument();

    fireEvent.click(linkElement!);

    expect(window.location.href).toEqual('http://localhost/');
  });

  it('should show Definition when no definition detail', async () => {
    const title = 'Pipeline Mean Time To Recovery';
    const handleHidden = jest.fn();

    render(<DoraMetricsDialog isShowDialog={true} hiddenDialog={handleHidden} title={title} />);

    const definition = screen.queryByLabelText('definition');

    expect(definition).toBeInTheDocument();

    const innerHtml = definition!.innerHTML;

    expect(innerHtml.includes('Definition')).toEqual(true);
    expect(innerHtml.includes('Definitions')).toEqual(false);
  });
});
