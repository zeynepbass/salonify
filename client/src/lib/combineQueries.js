export function combineQueries(...queries) {
  const failed = queries.find((query) => query.isError);

  return {
    data: queries.map((query) => query.data),
    isPending: queries.some((query) => query.isPending),
    isError: Boolean(failed),
    error: failed?.error ?? null,
    isFetching: queries.some((query) => query.isFetching),
    refetch: () => Promise.all(queries.filter((query) => query.isError || query.isPending).map((query) => query.refetch())),
  };
}
