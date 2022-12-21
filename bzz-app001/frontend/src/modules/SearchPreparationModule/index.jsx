import React, { useLayoutEffect } from "react";

import { useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";

import { FullPageLayout } from "@/layout";
import CrudDataTable from "./CrudDataTable";
import CrudDataTable1 from "./CrudDataTable1";

import WQTableLayout from "./layout";

export default function SearchPreparationModule({ config1 , config2}) {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    // dispatch(crud.resetState());

  }, []);

  return (
    // <FullPageLayout>
      <WQTableLayout>
        <CrudDataTable config={config1}  />
        <CrudDataTable1 config={config2}  />
      </WQTableLayout>
    // </FullPageLayout>
  );
}
