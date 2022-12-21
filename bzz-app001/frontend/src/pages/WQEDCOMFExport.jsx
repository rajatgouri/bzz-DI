import React, { useEffect, useState } from "react";

import {  Input, Button, Space } from "antd";
import Highlighter from "react-highlight-words";
import {  SearchOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";

let { request } = require('@/request/index');
import { selectAuth } from "@/redux/auth/selectors";
import MFExportLoggersDataTableModule from "@/modules/MFExportLoggersDataTableModule";


export default function WQEDCOMFExport() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(true);
  const [filteredValue, setFilteredValue] = useState({})
  const [filters, setFilters] = useState({})
  const dispatch = useDispatch()
  const entity = "WQEDCOMFExportLogger";

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          // ref={(node) => {
          //   searchInput = node;
          // }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters, dataIndex,  confirm)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),  
   
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {

    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters, dataIndex, confirm) => {
    
    clearFilters();
    setSearchText("");
    handleSearch('', confirm, dataIndex)
    
  };

 useEffect(() => {
  getFilters()
 }, [])


 const getFilters = async () => {
  const filteredResult = await request.list(entity + "-filters");

    let UserName = filteredResult.result['UserName'].map(({UserName})=> (UserName)).sort().map((value) => ({text: value, value:value}))
    let EMPID = filteredResult.result['EmpID'].map(({EmpID})=> (EmpID)).sort().map((value) => ({text: value, value:value}))
    
    let Obj = {
      UserName,
      EMPID
    }

    console.log(Obj)
    setFilters(Obj)
 }


  const getFilterValue = (values) => {
    setFilteredValue(values)

  }

  const getItems = (data) => {
    setItems(data)
  } 



  const panelTitle = "";
  const dataTableTitle = "WQEDCOMF Export";
  const showProcessFilters = true;


  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";


  const dataTableColumns = [
    {
      title: "Upload Date Time", width: "160px", dataIndex: "UploadDateTime" ,
      order: 1,
      ...getColumnSearchProps("UploadDateTime"),
      sorter: { multiple: 1 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UploadDateTime").length > 0) ? filteredValue.sort.filter((value) => value.field == "UploadDateTime")[0].order : null,

  },
  {
    title: "UserName", width: "90px", dataIndex: "UserName" ,
    filters: filters['UserName'],
    sorter: { multiple: 2 },
    sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "UserName").length > 0) ? filteredValue.sort.filter((value) => value.field == "UserName")[0].order : null,

    order: 2
  },
  {
    title: "EmpId", width: "80px", dataIndex: "EMPID" ,
    filters: filters['EMPID'],
    sorter: { multiple: 3 },
    filters: filters['EMPID'],
    sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "EMPID").length > 0) ? filteredValue.sort.filter((value) => value.field == "EMPID")[0].order : null,

    order: 3
  },
    {
        title: "New Records", width: "120px", dataIndex: "NewRecords" ,
        order: 4
    },
    {
      title: "Previous Records", width: "120px", dataIndex: "PreviousRecords" ,
      order: 5
    },
    {
      title: "Total Records", width: "120px", dataIndex: "TotalRecords" ,
      order: 5
    }
  ]
  const config = {
    entity,
    panelTitle,
    dataTableTitle,
    ENTITY_NAME,
    CREATE_ENTITY,
    ADD_NEW_ENTITY,
    UPDATE_ENTITY,
    DATATABLE_TITLE,
    dataTableColumns,
    getItems,
    reload,
    getFilterValue,
    showProcessFilters,
  };

  {
  return  <MFExportLoggersDataTableModule config={config} />
  }  
}
