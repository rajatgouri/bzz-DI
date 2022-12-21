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
  Popover,
  Select,
  Row,
  Col,
  DatePicker
} from "antd";

// import BarChart from "@/components/Chart/barchat";
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

import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  IdcardOutlined,
  EllipsisOutlined
} from "@ant-design/icons";
// import { filter } from "@antv/util";

var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours());
var usDate = new Date()

const {Option} = Select


export default function DataTable({ config }) {

  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, dataTableColumns, getItems, reload,  getFilterValue, dataTableTitle , userList, showFooter = true, openingModal, confirmModal, AddIcon} = config;
  

  const [users, setUsers] = useState(userList);
  const [process, setProcess] = useState("");


  useEffect(() => {
    setPreviousEntity(entity)
  }, [entity])

  const formatTime = (timer = 0) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)
  
    return (
        timer == "-" ?
          "-"
        :

      <div>
        <span >{getHours} </span> :  <span>{getMinutes}</span> : <span>{getSeconds}</span> 
      </div>
    )
  }



  const newDataTableColumns = dataTableColumns.map((obj) => {



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

  var { pagination, items , filters, sorters } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true)
  const [sorter, setSorter] = useState([])
  const [dateValue, setDateValue] = useState(moment())
  const [tableColumns, setTableColumns] = useState([])
  const dateFormat = 'YYYY/MM/DD';


  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])



  useEffect(() => {

    if (items.length > 0) {
      getItems(items)
      setDataSource(items)
      
      if (inCopiedMode) {
        selectAllRows(items)
      }
    }
  }, [items])

  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {    
    
  
    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }

    

    filteredArray = (filteredArray.map((data) => {
      delete data.column.filters  
      return data
    }))


    setSorter(filteredArray)
    

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
 
    let filterValue = {};
    
   
    getFilterValue(filterValue);

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: JSON.stringify( filterValue),
      sorter: JSON.stringify([])
    };


    dispatch(crud.list(entity, option));

  }

  useEffect(() => {

    loadTable()

  }, []);



  useEffect(() => {
   items = []
  },[entity])

  useEffect(() => {

    if(dataSource.length == 0) {
      return 
    }

    if (reload) {



      if (previousEntity == entity) {
        handelDataTableLoad(pagination, filters, sorters)
      } else {
        handelDataTableLoad(pagination, {}, {})
      }

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


  const onProcessChanged = (e) => {
    const value = e
    setProcess(value)
    if(entity == 'epic-productivity' || entity == 'epic-productivity1') {
      handelDataTableLoad(1, { 'SubSection': [value] }, {})

    } else {
      handelDataTableLoad(1, { 'UserName': value == "ALL" ? users.map((user) => user.name)  : [value] }, {})
    }
  }

  const onProcessChanged1 = (e) => {
    handelDataTableLoad(1, { 'SubSection': [e.target.value] }, {})

  }

  const onDateChange = (date) => {
    setDateValue(date)
      handelDataTableLoad(1, {'WeekEndingDate': date}, {})
  }

  const fixedColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ];
  
  const fixedData = [];
  for (let i = 0; i < 5; i += 1) {
    fixedData.push({
      key: i,
      name: ['Light', 'Bamboo', 'Little'][i % 3],
      description: 'Everything that has a beginning, has an end.',
    });
  }


  return (
    <div className= {entity == 'epic-productivity1' ? "wq-fixed-table epic-productivity1" : "wq-fixed-table"}>
          <Row gutter={[24,24]}>
            <Col span={12}>
              Your username  [DocumentID,  directory]
            </Col>
            
          </Row> 
          
      <Table
        columns={ columns}
        rowKey="ID"
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: 'calc(100vh - 48.5em)' }}
        // scroll={{ x: 2000, y: 500 }}

        dataSource={dataSource}
        pagination={pagination}
        loading={loading ? true : false}
        // components={components}
        onChange={handelDataTableLoad}
        // summary={(pageData) => {

          
        //   let totals = []
        //   if(pageData.length > 0) {
        //     let data = pageData.slice()[0]
            

        //     let users = (Object.keys(data)).filter(user => user != "WeekEndingDate")


        //     users.map((user) => {
        //       let sum = pageData.map(data => (data[user] ? data[user] : 0 )).reduce((a,b) => a + b)
        //       totals.push(sum)
        //     })
          
        //   }
          
        //   return (
        //       entity == "epic-productivity1" ?

        //     (
        //       <Table.Summary fixed>
        //         <Table.Summary.Row>
        //           {/* <Table.Summary.Cell index={0}>Total</Table.Summary.Cell> */}
        //           {/* <Table.Summary.Cell index={1}>This is a summary content</Table.Summary.Cell> */}
        //           <Table.Summary.Cell ><span style={{fontWeight: "bold"}}>Total</span></Table.Summary.Cell>

        //           {
        //             totals && totals.reverse().map((total) => {
        //               return (
        //                 <Table.Summary.Cell> <span style={{fontWeight: 600}}>{ total} </span></Table.Summary.Cell>

        //               )
        //             })
        //           }
        //         </Table.Summary.Row>
        //       </Table.Summary>
        //     )
        //     : (
        //       null
        //     )
        //   )
        // }}
        
        footer={
          () => (
            <Row gutter={[24, 24]} style={{minHeight: "25px "}}>
            
            </Row>
          )
        }
      />
      {/* <Table
      columns={tableColumns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: 2000, y: 500 }}
      bordered
      summary={() => (
        <Table.Summary fixed>
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}>Summary</Table.Summary.Cell>
            <Table.Summary.Cell index={1}>This is a summary content</Table.Summary.Cell>
          </Table.Summary.Row>
        </Table.Summary>
      )}
    /> */}
    </div>
  );
}
