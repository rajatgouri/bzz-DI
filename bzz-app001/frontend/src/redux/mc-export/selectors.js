import { createSelector } from "reselect";

const selectMcExport = (state) => state.mcExport;

export const selectCurrentmcExport = createSelector(
  [selectMcExport],
  (mcExport) => {
    return mcExport.current
  }
);

export const selectMcExportsList = createSelector(
  [selectMcExport],
  
  (mcExport) => {
    return mcExport.list
  }
);

export const selectItemById = (itemId) =>
  createSelector(selectListItems, (list) =>
    list.result.items.find((item) => item._id === itemId)
  );

export const selectCreatedItem = createSelector(
  [selectMcExport],
  (mcExport) => mcExport.create
);

export const selectUpdatedItem = createSelector(
  [selectMcExport],
  (mcExport) => mcExport.update
);

export const selectReadItem = createSelector([selectMcExport], (mcExport) => mcExport.read);

export const selectDeletedItem = createSelector(
  [selectMcExport],
  (mcExport) => mcExport.delete
);

export const selectSearchedItems = createSelector(
  [selectMcExport],
  (mcExport) => mcExport.search
);
