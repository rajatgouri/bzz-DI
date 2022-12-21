import React, {  useEffect, useState, useRef } from "react";
import {
  Table,
  Checkbox,
  notification,
  Row,
  Select,
  PageHeader,
} from "antd";

import { useSelector, useDispatch } from "react-redux";
import { mcExport as  crud } from "@/redux/mc-export/actions";
import moment from 'moment';
import inverseColor from "@/utils/inverseColor";

import { selectAuth } from "@/redux/auth/selectors";
import { selectMcExportsList } from "@/redux/mc-export/selectors";

export default function DataTable({ config }) {

  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked } = config;



  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

  useEffect(() => {
  
  }, [userList])

  

  const newDataTableColumns = dataTableColumns.map((obj, i) => {

  
      
    if (obj.dataIndex == "UploadDateTime" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
           
            children: (
              <div>
                {text ?
                  text.split("T")[0].split('-')[1] + "-" +
                  text.split("T")[0].split('-')[2] + "-" +
                  text.split("T")[0].split('-')[0]
                  + " " + text.split("T")[1]?.substring(0, 8) : ""}
              </div>
            )
          };
        },
      })
    } 
    
   
    return ({
      ...obj,
      render: (text, row) => {
        return {
          
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })


    
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectMcExportsList);

  var { pagination, items, filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);

  const { current } = useSelector(selectAuth);
  const [users, setUsers] = useState(userList)
  const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  
  useEffect(() => {

   setDataSource(items)
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {

    setDataSource([])
  
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    const option = {
      page: pagination.current || 1,
      filter: JSON.stringify(filters) || JSON.stringify({}),
      sorter: sorter ? JSON.stringify(filteredArray) : JSON.stringify([])
    };

    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list(entity, option));

  };

  const loadTable = () => {

    items = []
    setDataSource([])
    
    let filterValue = JSON.stringify({})

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filterValue,
      sorter: JSON.stringify([])
    };

    dispatch(crud.list(entity, option));


  }

  useEffect(() => {
      loadTable() 
  }, []);




  useEffect(() => {

    if(dataSource.length == 0) {
      return
    }

    if (reload) {
      handelDataTableLoad(pagination, filters, sorters)
    } else {
      setLoading(true)
    }

  }, [reload])

  


  const columns = newDataTableColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSave,
      }),
    };
  });



  return (
    <div className="kpi-table export-logger">
      <PageHeader
      style={{
        "padding": "0px",
        "marginTop": "-5px",
        "marginBottom": "10px"
      }}>
      <h2
          className="ant-page-header-heading-title"
          style={{ fontSize: "36px", marginRight: "18px", width: "68%", display: "inline-block", padding: "0px" }}
        >
          {dataTableTitle}

        </h2>

      </PageHeader>
      <Table
        columns={columns}
        rowKey="ID"
        scroll={{ y: '310px' }}
        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
       
      />
    </div>
  );
}
