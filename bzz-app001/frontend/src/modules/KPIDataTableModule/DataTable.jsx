import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Input,
  Form,
  notification,
  Radio,
  Row,
  Select,
  Col
} from "antd";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, ReloadOutlined, SettingOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { CloseCircleTwoTone } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import { selectAuth } from "@/redux/auth/selectors";
// import { filter } from "@antv/util";
import { getDate, getDay } from "@/utils/helpers";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date(utcDate)

const {Option} = Select

export default function KPIDataTable({ config }) {

  const inputColorRef = useRef(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [EMPID, setUserID] = useState(1);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked } = config;

  const [process, setProcess] = useState('ALL');


  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
  }, [entity])

  useEffect(() => {
  
  }, [userList])

  function copy(id, textToCopy) {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res() : rej();
      textArea.remove();
      notification.success({ message: "MRN Copied!", duration: 3 })
      onCopied(id, textToCopy)
      onCopiedEvent(textToCopy)
    });
  }

  const onCopiedEvent = (textToCopy) => {
    handelDataTableLoad(1, { 'Patient MRN': [textToCopy] }, {})
    setInCopiedMode(true)
  }

  const newDataTableColumns = dataTableColumns.map((obj, i) => {

  
      
    if (obj.dataIndex == "ActionTimeStamp" ) {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                {row["ActionTimeStamp"] ? row["ActionTimeStamp"].split("T")[0]  : ""}
              </div>
            )
          };
        },
      })
    } 
    
    if (obj.dataIndex == "WQ") {
      return ({
        ...obj,
        render: (text, row) => {


          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
              },
            },
            children: (
              <div>
                <div>
                  WQEDCOMC
                </div>
                <div>
                  WQEDCOMF
                </div>
              </div>
            )
          };
        },
      })
    }
    
    



    if (obj.dataIndex ==  userList.filter((user) => user.name == obj.dataIndex)[0].name) {
      return ({
        ...obj,
        
        children:  
          obj.children.map(c => {
          return {
            title: c.title,
            width: 130,
            dataIndex: c.dataIndex,
            render: (text, row)=>  {

              return (
                <div>
                    {
                      c.dataIndex == userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMCPages' ?
<div>
                        
                        <div>{
                        (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMCPages'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMCPages'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>
                        
                        <div>{
                        (parseInt(row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMFPages'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) +  '-WQEDCOMFPages'] : 0 )).toLocaleString('en-US', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                        }</div>


                      </div>
                      : <div>
                        
                      <div>{
                      (parseInt(row[ userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMCDocuments'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMCDocuments'] : 0 )).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                      }</div>
                      
                      <div>{
                      (parseInt(row[userList.findIndex((user) => user.name == obj.dataIndex) + '-WQEDCOMFDocuments'] ? row[userList.findIndex((user) => user.name == obj.dataIndex) +  '-WQEDCOMFDocuments'] : 0 )).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                      }</div>


                    </div>

                    }
                      
                     
                  
                 </div>
               
              )
            }
          }
        }),
        
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

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items, filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);

  const { current } = useSelector(selectAuth);
  const [users, setUsers] = useState(userList)


  const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])


  
  useEffect(() => {

    if (items.length > 0) {

      let dates = items.map((item) => item['ActionTimeStamp'])
      dates = [...new Set(dates)];


     let empIds =  users.map((u) => ({EMPID: u.EMPID, name: u.name}) )

      let d = dates.map((date) => {
        let row = items.filter((item) => item['ActionTimeStamp'] == date )

        let Obj = {}
        empIds.map((e, i) => {
          let r = row.filter((ro) => ro.EMPID == e.EMPID)[0] 

          r = r ? r : {}

          Obj['ActionTimeStamp']=  Obj['ActionTimeStamp'] ?  Obj['ActionTimeStamp'] : r['ActionTimeStamp']  
          Obj[ i + '-WQEDCOMCPages'] = r['WQEDCOMCPagesProcessed']
          Obj[ i +'-WQEDCOMFPages'] = r['WQEDCOMFPagesProcessed']
          Obj[i + '-WQEDCOMCDocuments'] = r['WQEDCOMCDocumentProcessed']
          Obj[i + '-WQEDCOMFDocuments'] = r['WQEDCOMFDocumentProcessed']

        })

        return Obj


      })  


      setDataSource(d)
    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {

    
    items = []
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
    <div className="kpi-table">
      
      <Table
        columns={columns}
        rowKey="ID"
        scroll={{ y: '450px' }}
        dataSource={dataSource}
        pagination={{ defaultPageSize: 100, pageSizeOptions: [], size: "small"}}
        loading={loading ? true : false}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
            </Row>
          )
        }
      />
    </div>
  );
}
