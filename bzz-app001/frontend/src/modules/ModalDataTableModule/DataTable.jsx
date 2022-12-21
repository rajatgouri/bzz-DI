import React, { useContext, useCallback, useEffect, useState, useRef } from "react";
import {
  Button,
  PageHeader,
  Table,
  Checkbox,
  Dropdown,
  Input,
  Form,
  Badge,
  notification,
  Tabs,
  Radio,
  Row,
  Col,
  Select,
  Divider,
  Space,
  Popconfirm,
  Typography
} from "antd";
import { getDate } from "@/utils/helpers";
import {  CloseOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";



const EditableContext = React.createContext(null);
let { request } = require('../../request/index')


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours() - 7);
var usDate = getDate()


const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};




export default function DataTable1({ config }) {

  let { entity, closeModal, dataTableData, ent, source } = config;


  const [dataSource1, setDataSource1] = useState([]);
  const [dataSource, setDataSource] = useState([])
  const [dataIndex, setDataIndex] = useState('')


  const dataTableColumns = [
    {
      title: 'ARCHIVE',
      dataIndex: 'Column Name',
      render: (value, row, index) => {
        const obj = {
          children: <span style={{marginLeft: "18px"}}>Categories</span>,
          props: {
            colSpan: 1,
            style:{
              backgroundColor: "#8b8b8b",
              color: "#ffffff",
              fontWeight:600,
              width: "70px",
              paddingLeft: "18px "

            }
          },
        };
        if (index === 0) {
          obj.props.rowSpan = dataSource1.length;
        } else {
          obj.props.rowSpan = 0;
        }

        return obj;
      },
    },
    {
      title: 'Document Type',
      dataIndex: 'Document Type',
      editable: true,
      width: "23%"
    },
    {
      title: 'Capture Location',
      dataIndex: 'Capture Location',
      editable: true,
      width: "23%"
    },
    {
      title: 'Document Description',
      dataIndex: 'Document Description',
      editable: true,
      width: "23%"
    }
  ];



  const [loading, setLoading1] = useState(true)

  

  useEffect(() => {
    if(dataTableData.length > 0) {
      setDataSource(dataTableData)
    }
  }, [dataTableData])

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    const [value, setValue] = useState('')


    let options = []

   
    if(dataSource.length > 0) {
      let list =  dataSource.filter((data) => data['column'] == dataIndex )
      if(list.length > 0) {
        let li = (list[0].recordset)
        li = li.map((m) => m[dataIndex] ? m[dataIndex].trim() : '' )
        li.unshift('')
       options =  [...new Set(li.sort())]
      }

    }

    const onChange = (e) => {
      setValue(e.target.value)
      e.preventDefault();
    }


    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);
  
    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex],
      });
    };

    
  
  const addItem = (e,dataIndex) => {
    e.preventDefault();

    if(value.trim() == "") {
      return
    }

    save({dataIndex: dataIndex, value: value})
    
    
  };
  

  

    const save = async ( column = undefined ) => {
      try {
        let values = await form.validateFields();
          toggleEdit();

          if(column ) {
            values[column['dataIndex']] = column['value']
          } 

        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };
  
    let childNode = children;
  
    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
        >
          <Select  ref={inputRef}
          
          dropdownRender={menu => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Space align="center" style={{ padding: '0 8px 4px' }}>
                <Input placeholder="Please enter item"  onKeyUp={(e) => onChange(e)} />
                <Typography.Link onClick={(e) => addItem(e,dataIndex) } style={{ whiteSpace: 'nowrap' }}>
                  <PlusOutlined /> Add item
                </Typography.Link>
              </Space>
            </>
          )}
          onChange={() => save()}  >
            {
              options.map(option => {
                return <Select.Option value={option}>{option}</Select.Option>
              }) 

              
            }
          </Select>
        </Form.Item>
      ) : (
        <div>
          <div
            className="editable-cell-value-wrap"
            style={{
              width: "100%",
              display: "inline-block",
              textAlign: "left"
            }}
          >
            
            <div style={{
              width: "85%",
              minHeight: "41px",
              display: "inline-block",
              left: "10px",
              padding: "10px",
              verticalAlign: "middle"
            }} onClick={toggleEdit}>
              {children}          
            </div>
            <div style={{width: "15%", display: "inline-block",  right :"0px"}}>
              {
                children[1] ? 

              <DeleteOutlined onClick={() => save( {dataIndex: dataIndex, value: ''})}></DeleteOutlined>
                : null
              }
            </div>

          </div>
          
        </div>
        
      );
    }
  
    return <td {...restProps}>{childNode}</td>;
  };
  

  const handleSave = async (row) => {
    setLoading1(true)

    delete row['Column Name']
    
    await request.create(entity, row);
    loadTable1()
    setLoading1(false)
  }

  
  const handleDelete = async (id) => {
    setLoading1(true)
    if(id != undefined) {
      await request.delete(entity, id);
    }
    loadTable1()
    setLoading1(false)
  }

  const handleArchive = async (id, value) => {
    setLoading1(true)
      await request.update(entity, id, {Archive: value});
    loadTable1()
    setLoading1(false)
  }

  
  const handleAdd = (row) => {

    const rowExists= dataSource1.filter(datasource => datasource['Capture Location'] == "" &&  datasource['Document Type'] == "" && datasource['Document Description'] == "")

    if (rowExists.length > 0) {
      return 
    }

    setDataSource1([ 
      ...dataSource1, 
      {
      "Column Name": "Filter Categories",
      'Capture Location': "",
      'Document Type': "",
      "Document Description": "",
      } 
    ])
  }

  const loadTable1 = async () => {
    
    let response =  await request.list(entity);
    setDataSource1(response.result);
    setLoading1(false) 

  }

  useEffect(() => {

    loadTable1()

  }, []);


  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns1 = dataTableColumns.map((col) => {
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
    <div className="wq-filter-table">

      <div>
      <div className="inline w-50">
        <h2>Archive</h2>
      </div>
      <div className="inline w-50 text-end">
          <CloseOutlined onClick={closeModal}/>
      </div>

      </div>
      <Table
        columns={columns1}
        rowKey="ID"
        components={components}
        dataSource={dataSource1}
        pagination={false}
        scroll={{ y: '14em' }}
        loading={loading ? true : false}
        onChange={loadTable1}
        footer={
          () => (
            <Row gutter={[24, 24]}>
              <Col style={{ width: "100%", textAlign: "end" }}>
                <Button
                  onClick={handleAdd}
                  type="primary"
                  className="mr-1"
                >
                  Add Row
                </Button>

                <Button
                  
                  onClick={closeModal}
                  type="secondary"
                >
                  Save
                </Button>
              </Col>
            </Row>
          )
        }
      />
      <div style={{ marginTop: "-30px" }}>
      </div>
        
    </div>



  );
}
