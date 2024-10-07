import React, { useCallback, useState } from 'react';

import { CLASS_BASE } from '../constants';
import { Controls, SearchControl } from '../Controls';
import { useLocationsData } from '../../context/actions';

import { usePaginate } from '../hooks/usePaginate';
import { listViewHelpers, resolveClassName } from '../utils';

import { DataTableControl } from './Controls/DataTable';

export interface LocationsViewProps {
  className?: (defaultClassName: string) => string;
}

const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_LIST_OPTIONS = {
  exclude: 'WRITE' as const,
  pageSize: DEFAULT_PAGE_SIZE,
};
export const DEFAULT_ERROR_MESSAGE = 'There was an error loading locations.';

const {
  EmptyMessage,
  Loading: LoadingElement,
  Message,
  Paginate,
  Refresh,
  Title,
} = Controls;

const RefreshControl = ({
  disableRefresh,
  handleRefresh,
}: {
  disableRefresh?: boolean;
  handleRefresh?: () => void;
}) => {
  return <Refresh disabled={disableRefresh} onClick={handleRefresh} />;
};

const Loading = () => {
  const [{ isLoading }] = useLocationsData();
  return isLoading ? <LoadingElement /> : null;
};

const LocationsMessage = (): React.JSX.Element | null => {
  const [{ hasError, message }] = useLocationsData();
  return hasError ? (
    <Message variant="error">{message ?? DEFAULT_ERROR_MESSAGE}</Message>
  ) : null;
};

const LocationsEmptyMessage = () => {
  const [{ data, isLoading, hasError }] = useLocationsData();
  const shouldShowEmptyMessage =
    data.result.length === 0 && !isLoading && !hasError;

  return shouldShowEmptyMessage ? (
    <EmptyMessage>No locations to show.</EmptyMessage>
  ) : null;
};

export function LocationsView({
  className,
}: LocationsViewProps): React.JSX.Element {
  const [{ data, isLoading }, handleList] = useLocationsData();

  const { result, nextToken } = data;
  const resultCount = result.length;
  const hasNextToken = !!nextToken;

  // initial load
  React.useEffect(() => {
    handleList({
      options: { ...DEFAULT_LIST_OPTIONS, refresh: true },
    });
  }, [handleList]);

  const [searchTerm, setSearchTerm] = useState('');
  const onSearch = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  const onPaginateNext = () =>
    handleList({
      options: { ...DEFAULT_LIST_OPTIONS, nextToken },
    });

  const {
    currentPage,
    handlePaginateNext,
    handlePaginatePrevious,
    handleReset,
  } = usePaginate({ onPaginateNext, pageSize: DEFAULT_PAGE_SIZE });

  const { disableNext, disablePrevious, disableRefresh, range } =
    listViewHelpers({
      currentPage,
      hasNextToken,
      isLoading,
      pageSize: DEFAULT_PAGE_SIZE,
      resultCount,
    });

  return (
    <div
      className={resolveClassName(CLASS_BASE, className)}
      data-testid="LOCATIONS_VIEW"
    >
      <Title>Home</Title>
      <RefreshControl
        disableRefresh={disableRefresh}
        handleRefresh={() => {
          handleReset();
          handleList({
            options: { ...DEFAULT_LIST_OPTIONS, refresh: true },
          });
        }}
      />
      <Paginate
        currentPage={currentPage}
        disableNext={disableNext}
        disablePrevious={disablePrevious}
        handleNext={() => {
          handlePaginateNext({ resultCount, hasNextToken });
        }}
        handlePrevious={handlePaginatePrevious}
      />
      <LocationsMessage />
      <Loading />
      <SearchControl onSearch={onSearch} />
      <DataTableControl range={range} searchTerm={searchTerm} />
      <LocationsEmptyMessage />
    </div>
  );
}
