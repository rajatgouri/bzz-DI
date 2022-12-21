import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import GreenDot from "assets/images/green-dot.png"

export const dataTableColumns = [
    {
      title: "Correct", width: 100, dataIndex: "Correct" ,
      filters: [
        { text: <img src={GreenDot} height="9px" className="green-dot"/>, value: 0 },
        { text: <img src={WhiteDot} height="9px"/>, value: 1 }
      ],
      filteredValue: filteredValue['Correct'] || null
    },
    {
      title: "Error", width: 80, dataIndex: "Error" ,
      filters: [
        { text: <img src={RedDot} height="9px"/>, value: 0 },
        { text: <img src={WhiteDot} height="9px"/>, value: 1 }
      ],
      filteredValue: filteredValue['Error'] || null
    },
    {
      title: "Error Type",
      dataIndex: "Error Type",
      width: 150,
      filters: [
        {text: "Wrong Patient",  value : "Wrong Patient"},
        {text: "Wrong DocType",  value : "Wrong DocType"},
        {text: "Wrong DOS",  value : "Wrong DOS"},
        {text: "Wrong Encounter/Visit",  value : "Wrong Encounter/Visit"},
        {text: "Wrong Order",  value : "Wrong Order"},

      ],
      filteredValue: filteredValue['Error Type'] || null
    },
    {
      title: "Error Tracking",
      dataIndex: "Error Tracking",
      width: 150,
      // ...getColumnSearchProps("Error Tracking"),
      filters: [
        { text: "Yes", value: "Yes" },
        { text: "No", value: "No" },
        { text: "", value: "" }
      ],
      filteredValue: filteredValue['Error Tracking'] || null
    },
    {
      title: "Comments", width: 120, dataIndex: "Comments", filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value: 1 }
      ],
      filteredValue: filteredValue['Comments'] || null
    },
    {
      title: "Batch ID", dataIndex: "Batch Id", width: 120, 
      ...getColumnSearchProps("Batch Id"),
      filteredValue: filteredValue['Batch Id'] || null
    },
    {
      title: "Med Rec",
      dataIndex: "Med Rec",       
      width: 110,
      ...getColumnSearchProps("Med Rec"),
      filteredValue: filteredValue['Med Rec'] || null
    },
    {
      title: "Acc #",
      dataIndex: "Account Number",
      width: 100,
      ...getColumnSearchProps("Account Number"),
      filteredValue: filteredValue['Account Number'] || null
    },
    {
      title: "Patient Name",
      dataIndex: "Patient Name",
      width: 150,
      ...getColumnSearchProps("Patient Name"),
      filteredValue: filteredValue['Patient Name'] || null
    },
    {
      title: "Capture Location",
      dataIndex: "Capture Location",
      width: 160,
      ...getColumnSearchProps("Capture Location"),
      filteredValue: filteredValue['Capture Location'] || null
    },
    {
      title: "Batch Capture Class",
      dataIndex: "Batch Capture Class",
      width: 200,
      // ...getColumnSearchProps("Batch Capture Class"),
      filters: tableFilters.batchCaptureClass,
      filteredValue: filteredValue['Batch Capture Class'] || null
    },

    {
      title: "Batch Type",
      dataIndex: "Batch Type",
      width: 150,
      // ...getColumnSearchProps("Batch Type"),
      filters: tableFilters.batchType,
      filteredValue: filteredValue['Batch Type'] || null
    },
    {
      title: "Edco Document Type",
      dataIndex: "Edco Document Type",
      width: 200,
      // ...getColumnSearchProps("Edco Document Type"),
      filters: tableFilters.edcoDocumentType,
      filteredValue: filteredValue['Edco Document Type'] || null
    },
    {
      title: "Doc Type",
      dataIndex: "Document Type",
      width: 200,
      // ...getColumnSearchProps("Document Type"),
      filters: tableFilters.docType,
      filteredValue: filteredValue['Document Type'] || null
    },
    {
      title: "Document Description",
      dataIndex: "Document Description",
      width: 200,
      ...getColumnSearchProps("Document Description"),
      filteredValue: filteredValue['Document Description'] || null
    },
    {
      title: "Release Date", dataIndex: "Release Date", width: 150, sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Release Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Release Date")[0].order : null,
    },
    {
      title: "Doc Id",
      dataIndex: "Document Id",
      width: 320,
      ...getColumnSearchProps("Document Id"),
      filteredValue: filteredValue['Document Id'] || null
    },
    {
      title: "Order Number",
      dataIndex: "Order Number",
      width: 200,
      ...getColumnSearchProps("Order Number"),
      filteredValue: filteredValue['Order Number'] || null
    },
    
    {
      title: "Order Date", dataIndex: "Order Date", width: 150, sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Order Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Order Date")[0].order : null,
    },
    {
      title: "Chart Correction",
      dataIndex: "Chart Correction",
      width: 200,
      ...getColumnSearchProps("Chart Correction"),
      filteredValue: filteredValue['Chart Correction'] || null
    },
    {
      title: "Document Pages",
      width: 150,
      dataIndex: "Days Until Timely Filing",
    },
    
    {
      title: "Process Type",
      dataIndex: "Process Type",
      width: 150,
      ...getColumnSearchProps("Process Type"),
      filteredValue: filteredValue['Process Type'] || null
    },
    {
      title: "User Assigned", width: 150, dataIndex: "UserAssigned", filters: users,
      filteredValue: filteredValue['UserAssigned'] || null

    },
    {
      title: "Status", width: 80, dataIndex: "Status",
      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Defer", value: "Defer" },
        { text: "Returned", value: "Returned" },
        { text: "Misc", value: "Misc" },
        { text: "Review", value: "Review" }
      ],
      filteredValue: filteredValue['Status'] || null

    },
    { title: "User Logged", width: 150, dataIndex: "User" },

  ];