import { createSelector } from "reselect";

const selectMfExport = (state) => state.mfExport;

export const selectCurrentmfExport = createSelector(
  [selectMfExport],
  (mfExport) => {
    return mfExport.current
  }
);

export const selectMfExportsList = createSelector(
  [selectMfExport],
  
  (mfExport) => {
    return mfExport.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectMfExport],
  (mfExport) => mfExport.create
);

export const selectUpdatedItem = createSelector(
  [selectMfExport],
  (mfExport) => mfExport.update
);

export const selectReadItem = createSelector([selectMfExport], (mfExport) => mfExport.read);

export const selectDeletedItem = createSelector(
  [selectMfExport],
  (mfExport) => mfExport.delete
);

export const selectSearchedItems = createSelector(
  [selectMfExport],
  (mfExport) => mfExport.search
);
