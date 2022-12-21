import React from "react";

import DataTable from "./DataTable";

export default function CrudDataTable({ config  } ) {
  return (
    <div>
      <DataTable config={config} />
    </div>
    

  );
}
