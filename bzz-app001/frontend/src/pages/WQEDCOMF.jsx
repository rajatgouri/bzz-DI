import React, { useState } from "react";

import FullDataTableModule from "@/modules/FullDataTableModule";
import { Table, Input, Button, Space, Form, Row, Col, Select , notification} from "antd";
import Highlighter from "react-highlight-words";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { crud } from "@/redux/crud/actions";
import { useDispatch, useSelector } from "react-redux";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
let { request } = require('../request/index');
import { selectAuth } from "@/redux/auth/selectors";
import Socket from "../socket";
import SortModal from "@/components/Sorter";
import { getDate , GetSortOrder} from "@/utils/helpers";

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const { Option } = Select;

export default function WQEDCOMF() {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [dataTableColorList, setDataTableColorList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  const [items, setItems] = useState([]);
  const [editForm] = Form.useForm();
  const [selectedId, setSelectedId] = useState("");
  const [reload, setReload] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [loaded, setLoaded] = useState(false)
  const [users, setUsers] = useState([]);
  const [filtersUpdateNeeded, setFiltersUpdateNeeded] = useState(true);
  const [tableFilters, setTableFilters] = useState({});
  const [editModalField, setEditModalField] = useState('');
  const [reset, setReset] = useState(false);
  const [currentUser, setCurrentUser] = useState();

  
  const [sortModal, setSortModal] = useState(false);
  const [columns, setColumns] = useState(false)
  const [dataColumns, setDataColumns] = useState([])
  
  var date = new Date();
  var utcDate = new Date(date.toUTCString());
  utcDate.setHours(utcDate.getHours() - 7);
  var usDate = getDate()

  const currentDate = usDate

  // const currentDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const { current } = useSelector(selectAuth);
  const [filteredValue, setFilteredValue] = useState({
    UserAssigned: current.managementAccess ? [] : [current.name],
    Status: current.managementAccess ? null : ['QA Review'],

  })

 const WQFilterEntity  = "WQEDCOMFfilters"

  const dispatch = useDispatch()

  const defaultColors = [
    { text: "Done", color: "#BEE6BE", selected: false },
    { text: "Pending", color: "#FAFA8C", selected: false },
    { text: "Deferred", color: "#F0C878", selected: false },
    { text: "Returned", color: "#E1A0E1", selected: false },
    { text: "Misc", color: "#AAAAB4", selected: false },
    { text: "QA Review", color: "#FFFFFF", selected: false },
  ]

  const billingColorData = {
    EMPID: 1,
    User: "Admin",
    Color1: "#BEE6BE",
    Color2: "#FAFA8C",
    Color3: "#F0C878",
    Color4: "#E1A0E1",
    Color5: "#AAAAB4",
    Color6: "#FFFFFF",
    Category1: "Done",
    Category2: "Pending",
    Category3: "Deferred",
    Category4: "Returned",
    Category5: "Misc",
    Category6: "QA Review",
  }

  const load = async () => {

    
    const [ {result}  , {result: result1} , admin ] = await Promise.all([ await request.read('billingcolorWQEDCOMF', 1),  await request.list(entity+"-columns", {id: current.EMPID})  , await request.list("admin")]);

    if (result.length === 0) {
      await request.create('billingcolorWQEDCOMF', billingColorData);
      setLoaded(true)
      return setDataTableColorList(defaultColors)
    }

    
    
    let usersList = admin.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null ).map((user) => ({EMPID: user.EMPID, name: user.Nickname , last: user.Last, text:  user.Nickname , value: user.Nickname , status: 'success'}))
    
    // let usersList = admin.result.filter(res => res.ManagementAccess == 0 || res.ManagementAccess == null ).map((user) => ({name: user.First, text: user.First , value: user.First , status: 'success'}))
    setUsers(usersList);

    setDataTableColorList([
      { text: result[0].Category1, color: result[0].Color1, selected: false },
      { text: result[0].Category2, color: result[0].Color2, selected: false },
      { text: result[0].Category3, color: result[0].Color3, selected: false },
      { text: result[0].Category4, color: result[0].Color4, selected: false },
      { text: result[0].Category5, color: result[0].Color5, selected: false },
      { text: result[0].Category6, color: result[0].Color6, selected: false },
    ])
    

    if(result1.length > 0) {
      setDataColumns([...dataTableColumns.map((c,i )=> {
         c['order'] =  result1[0][c.dataIndex]
         return c
      })])
      
    } else {
      setDataColumns(dataTableColumns)
    } 

    setColumns(true)
  }

  React.useEffect( () => {

      load();
    
  }, [])


  const onSort = async (data) => {

    setReload(true)
    var x = {}

    data.map((d, i ) =>  {
      x[d.dataIndex] =  i
    })
    x.EMPID = current.EMPID
    await request.create(entity+ "-columns" , x)
    handleSortCancel()
    setTimeout(() => setReload(false), 1000)

    
    notification.success({message: "Please Refesh page!"})

  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
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
            onClick={() => handleReset(clearFilters, dataIndex, confirm)}
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
    

    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.select(), 100);
      }
    },
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
    if(dataIndex == 'Batch Id') {
      setReset(true)
      setTimeout(() => setReset(false), 1000)
    }
  };

  const entity = "WQEDCOMF";
  const loggerEntity = "WQEDCOMFLogger";
  const onhandleSave = (data) => {
    dispatch(crud.update(entity, data.ID, { Comments: data.Notes }))

    onNotesAction(data.ID, 'Update Comments')
    setReload(true)
    setTimeout(() => setReload(false), 1000)
  }


  const onNotesAction = (id, status) => {
    let d = items.filter(i => i.ID == id)[0]

    dispatch(crud.create(loggerEntity, { IDWQEDCOMF: id, UserName: current.name, BatchID: d['Batch Id'], Status: status, DateTime: currentDate }))
  }


  // const onHandleColorChange = async (selectedRows, data) => {
  //   if(selectedRows.length > 0) {
  //     setReload(true)

  //     await request.create(entity + "-color" , {    items, selectedRows, data})
  //     setReload(false)

  //     const timer = () => new Promise(res => setTimeout(res, 100))
  //     for (var i = 0; i < selectedRows.length; i++) {
  

  //       let item = items.filter((item) => item.ID == selectedRows[i])[0]

  //       // await dispatch(crud.update(entity, selectedRows[i], { Color: data.color, Status: data.text, ActionTimeStamp: currentDate, User: current.name }))
  //       // await dispatch(crud.create(loggerEntity, { IDWQEDCOMF: selectedRows[i], UserName: current.name , BatchID: item['Batch Id'], Color: data.color, Status: data.text, DateTime: currentDate }))
  
  //       if (i + 1 == selectedRows.length) {
  //         setTimeout(() => {
  //           Socket.emit('update-wqs');
  //         }, 1500)
  
  
  //       }
  
  //       await timer();
  //     }
  //   }
   
  // }

  const onHandleColorChange = async (selectedRows, data, selectedRowID)  => {
    
    if(selectedRows.length > 0) {
      setReload(true)
      await request.create(entity + "-color" , { items, selectedRows, data, selectedRowID})
      setReload(false)

      // await request.create(entity + "-logger", {items, selectedRows, data, selectedRowID} )
    const timer = () => new Promise(res => setTimeout(res, 100))
    for (var i = 0; i < selectedRows.length ; i++) {

      let item = items.filter((item) => item.ID == selectedRows[i])[0]
    
        await dispatch(crud.create(loggerEntity, { IDWQEDCOMF: selectedRows[i], UserName: current.name , BatchID: item['Batch Id'], Color: data.color, Status: selectedRowID ?   "Finish -" + data.text1 : data.text, DateTime: currentDate }))

        // await dispatch(crud.create(loggerEntity, { IDWQEDCOMC: selectedRows[i], UserName: current.name, BatchID: item['Batch Id'], Color: data.color, Status: selectedRowID ?   "Finish -" + data.text1 : data.text, DateTime: currentDate }))

      // await dispatch(crud.create(loggerEntity, {IDWQ5508: selectedRows[i], UserName: current.name, MRN: item['Patient MRN'] ,Color : data.color, Status: selectedRowID ?   "Finish -" + data.text1 : data.text, DateTime: currentDate}))
      
      if(i + 1 == selectedRows.length ) {
        setTimeout(() => {
          Socket.emit('update-wqs');
        }, 1500)
      }

      await timer(); 
    }
  }

  }

  
  const updateTime = async (id, value, cb, ent, entry, row) => {

    cb(true)

    value.id = id

    if(ent == 'Stop') {
      value.Status = entry.text1
      if (row['Correct'] == 'Yes') {
        value.Correct = 'Yes',
        value['Error Type'] = row['Error Type']
      }

      await request.create('WQEDCOMF-updatetime',  value)
    } else {
      value.Status = ent
    }    

    

    
    if(typeof id == 'number') {
      let item = items.filter((item) => item.ID == id)[0]
      
      dispatch(crud.create(loggerEntity, { IDWQEDCOMF: id, UserName: current.name, BatchID: item['Batch Id'], Status: value.Status, DateTime: currentDate }))
    }
     else if (ent != 'Stop') {
      let item = items.filter((item) => item.ID == id[0])[0]
      if(item) {
        dispatch(crud.create(loggerEntity, { IDWQEDCOMF: id, UserName: current.name, BatchID: item['Batch Id'], Status: value.Status, DateTime: currentDate })) 
      }
    }
  }


  const handleSaveColor = (EMPID, data) => {
    request.update("billingcolorWQEDCOMF", EMPID, data);
  }

  const getDefaultColors = (cb) => {
    cb(defaultColors)
  }

  const getPreviousColors = (cb) => {
    load()
  }

  const openEditModal = (id, type, modalType, title, action) => {

    let row = items.filter(item => item.ID == id)[0];
    setSelectedId(id);
    setEditModalField(type)
    setModalType(modalType);  
    
    if (type == 'Error Type') {
      editForm.setFieldsValue({
        Notes: row[type]? row[type].split(','): []
      })  
    } else {
      editForm.setFieldsValue({
        Notes: row[type]
      })
    }

    setModalTitle(title);
    onNotesAction(id, action);  
    setOpenModal(true)

  }


  const getFilterValue = (values) => {
    setFilteredValue(values)
  }


  const openAddModal = (id) => {
    let row = items.filter(item => item.ID == id)[0];
    setSelectedRow(row);
    setModalType("VIEW");
    setModalTitle("View Comments");
    setOpenModal(true);
  }

  const handleCancel = () => {
    setModalTitle("");
    onNotesAction(selectedId, 'Close Comments')
    setOpenModal(false);
  }


  const getFullList = (data) => {

    let currUser = currentUser
    if( localStorage.getItem('force-filter')) {
      currUser = ''
    }

    const username = data.username
    data = data.filters
    // if(username !== currUser  ) {


        setCurrentUser(username)
      let batchCaptureClass = data.filter((d) => d.column == 'Batch Capture Class')[0].recordset.map(name=> ({text: name['Batch Capture Class'], value: name['Batch Capture Class'] ?  name['Batch Capture Class'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })

      let batchType = data.filter((d) => d.column == 'Batch Type')[0].recordset.map(name=> ({text: name['Batch Type'], value: name['Batch Type'] ?  name['Batch Type'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })

      let edcoDocumentType = data.filter((d) => d.column == 'Edco Document Type')[0].recordset.map(name=> ({text: name['Edco Document Type'], value: name['Edco Document Type'] ?  name['Edco Document Type'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })

      let docType = data.filter((d) => d.column == 'Document Type')[0].recordset.map(name=> ({text: name['Document Type'], value: name['Document Type'] ?  name['Document Type'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })
      
      let captureLocation = data.filter((d) => d.column == 'Capture Location')[0].recordset.map(name=> ({text: name['Capture Location'], value: name['Capture Location'] ?  name['Capture Location'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })
      let documentDescription = data.filter((d) => d.column == 'Document Description')[0].recordset.map(name=> ({text: name['Document Description'], value: name['Document Description'] ?  name['Document Description'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })

      let userAssigned = data.filter((d) => d.column == 'UserAssigned')[0].recordset.map(name=> ({text: name['UserAssigned'], value: name['UserAssigned'] ?  name['UserAssigned'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })

      let user = data.filter((d) => d.column == 'User')[0].recordset.map(name=> ({text: name['User'], value: name['User'] ?  name['User'].trim() : null}))
      .sort((a,b) =>  {
        a = a['text']
        b = b['text']  
        return (a < b) ? -1 : (a > b) ? 1 : 0;
      })
      
      setTableFilters({
        batchCaptureClass,
        batchType,
        edcoDocumentType,
        captureLocation,
        documentDescription,
        docType,
        userAssigned,
        user
      })

      setFiltersUpdateNeeded(false)
      window.localStorage.removeItem('force-filter')

    // }
  }
  
  const getItems = (data) => {
    
    
    setItems(data)
  }

  const onEditItem = async  (value) => {

    if(editModalField == "Error Type") {
      setReload(true)  
      await  request.update(entity, selectedId, {Error: 'Yes', Correct: 'No' ,'Error Type': value.Notes ? value.Notes  : ""});
      setReload(false)

    } else if (editModalField == "Error Tracking") {
      setReload(true)  
      await  request.update(entity, selectedId, {'Error Tracking': value.Notes ? value.Notes  : ""});
      setReload(false)
    } else  {
      onhandleSave({ ID: selectedId, Notes: value.Notes ?  value.Notes  : "" })

    }
    setOpenModal(false)

  }

  const onCopied = (id, batchID, text) => {
    dispatch(crud.create(loggerEntity, { IDWQEDCOMF: id, UserName: current.name, Color: "", Status: "Copy Batch ID", DateTime: currentDate, 'BatchID': batchID , CopiedText: text}))
  }

  const onRowMarked = async (row, value, type) => {

  
    if(type == "Error") {

      if(value == "No") {
        // 
        setReload(true)
        await dispatch(crud.update(entity, row.ID, {Error: 'No' , Correct: 'Yes', 'Error Type': ''}))
        setReload(false)

      } else if (value == "Yes") {
        openEditModal(row.ID, 'Error Type', 'ERROR', 'Error Type', 'Edit Error Type')
      } else {
        setReload(true)
        await dispatch(crud.update(entity, row.ID, {Error: '', 'Error Type': ''}))
        setReload(false)
      }

    } else if (type == 'Error Tracking')  {
      setReload(true)
      await dispatch(crud.update(entity, row.ID, {'Error Tracking': value}))
      setReload(false)
    
    } else {

      // force to not tick when Error 
      if (row.Error == "Yes") {
        setReload(true)
        await dispatch(crud.update(entity, row.ID, {Error: 'No', 'Error Type': "", 'Correct': 'Yes'}))
        setReload(false)
        return 
      } 


      if (value == "Yes") {
        setReload(true)
        await dispatch(crud.update(entity, row.ID, {Error: 'No', 'Error Type': "", 'Correct': 'Yes'}))
        setReload(false)
      } else if (value == "No") {
        setReload(true)
        openEditModal(row.ID, 'Error Type', 'ERROR', 'Error Type', 'Edit Error Type')
        await dispatch(crud.update(entity, row.ID, {Error: 'Yes', 'Error Type': "", 'Correct': 'No'}))
        setReload(false)
      } else {
        setReload(true)
        await dispatch(crud.update(entity, row.ID, { 'Correct': ''}))
        setReload(false)
      }
    }
  }




// edit form
const textModal = (
  <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >
      <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={10} />
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 18 }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        Update
      </Button>
    </Form.Item>
  </Form>
)


// Error form
const inputModal = (
  <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >
      <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={2} />
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 18 }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        Update
      </Button>
    </Form.Item>
  </Form>
)

// Select Modal
const selectModal = (
  <Form
    name="basic"
    labelCol={{ span: 0 }}
    wrapperCol={{ span: 24 }}
    onFinish={onEditItem}
    // onFinishFailed={onEditFailed}
    autoComplete="off"
    form={editForm}
  >
    <Form.Item
      label=""
      name="Notes"
    >
      {
          (editModalField == "Error Tracking") ? 
          <Select >
            <Option value="yes">Yes</Option>
            <Option value="No">No</Option>
            <Option value=""></Option>
            
          </Select>

          :
          <Select  mode="multiple">
            <Option value="Wrong Patient">Wrong Patient</Option>
            <Option value="Wrong DocType">Wrong DocType</Option>
            <Option value="Wrong DOS">Wrong DOS</Option>
            <Option value="Wrong Encounter/Visit">Wrong Encounter/Visit</Option>
            <Option value="Wrong Page Order">Wrong Page Order</Option>
            <Option value="Wrong Order #">Wrong Order #</Option>
            <Option value="Wrong Other">Wrong Otherr</Option>

          </Select>

        }
    </Form.Item>

    <Form.Item wrapperCol={{ offset: 18 }}>
      <Button type="primary" htmlType="submit" className="mr-3">
        Update
      </Button>
    </Form.Item>
  </Form>
)

// View Modal
const viewModal = (
  <Row gutter={[24, 24]} style={{ marginBottom: "50px" }}>
    <Col className="gutter-row" span={24}>
      {selectedRow.Comments}
    </Col>
  </Row>
)

  const panelTitle = "WQ MF EDCO Document Integrity";
  const dataTableTitle = "WQ MF EDCO Document Integrity";
  const progressEntity = "WQEDCOMFprogress";
  const workEntity = "WQEDCOMFWork";
  const showProcessFilters = true;


  const onWorkSaved = async (amount) => {
    const response = await request.list("WQEDCOMFWork");
    const result = (response.result);
    const selectedRow = result.filter(res => res.EMPID == current.EMPID)[0]
    if (selectedRow.Amount) {

      let targetAmount = JSON.parse(selectedRow.Amount);
      const found = targetAmount.some(r => amount.indexOf(r) >= 0)
      console.log(found)
      if (!found) {
        var date = new Date();
        var utcDate = new Date(date.toUTCString());
        utcDate.setHours(utcDate.getHours() - 7);
        var day = new Date(utcDate).getDay();
        let obj = {}
        obj[days[day]] = 1;
        dispatch(crud.create(workEntity, obj));
      }
    }
  }

  const userList = [
    { name: "Anna", status: 'success' },
    { name: "Ferdinand", status: 'success' },
    { name: "Jacqueline", status: 'success' },
    { name: "Jannet", status: 'success' },
    { name: "Suzanne", status: 'success' }
  ]

  const dataTableColumns = [
    {
      title: "START", width: 100, dataIndex: "START" ,
      align: 'center',
      order: 1
    },
    
    
    {
      title: "Correct", width: 100, dataIndex: "Correct" ,
      filters: [
          { text: "Yes", value: 'Yes' },
          { text: "No", value: 'No' },
          { text: "", value: '' },

      ],
      order: 2,
      filteredValue: filteredValue['Correct'] || null
    },
    {
      title: "Error", width: 80, dataIndex: "Error" ,
      filters: [
          { text: "Yes", value: "Yes" },
          { text: "No", value: 'No' },
          { text: "", value: '' },

      ],
      order: 3,
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
        {text: "Wrong Page Order",  value : "Wrong Page Order"},
        {text: "Wrong Order #",  value : "Wrong Order #"},
        {text: "Wrong Other",  value : "Wrong Other"},
        {text: "",  value : ""},

      ],
      order: 4,
      filteredValue: filteredValue['Error Type'] || null
    },
    {
      title: "Error Tracking",
      dataIndex: "Error Tracking",
      width: 150,
      filters: [
        { text: "Yes", value: "Yes" },
        { text: "No", value: "No" },
        { text: "", value: "" }
      ],
      order: 5,
      filteredValue: filteredValue['Error Tracking'] || null
    },
    {
      title: "Comments", width: 120, dataIndex: "Comments", filters: [
        { text: <EyeOutlined />, value: 0 },
        { text: "", value: 1 }
      ],
      order: 6,
      filteredValue: filteredValue['Comments'] || null
    },
    {
      title: "FINISH", width: 100, dataIndex: "FINISH" ,
      order: 7,
      align: 'center', 
    },
    {
      title: "Batch ID", dataIndex: "Batch Id", width: 120, 
      ...getColumnSearchProps("Batch Id"),
      filteredValue: filteredValue['Batch Id'] || null,
      sorter: { multiple: 4 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Batch Id").length > 0) ? filteredValue.sort.filter((value) => value.field == "Batch Id")[0].order : null,
      order: 8,

    },
    
    {
      title: "Med Rec",
      dataIndex: "Med Rec",       
      width: 130,
      ...getColumnSearchProps("Med Rec"),
      filteredValue: filteredValue['Med Rec'] || null,
      sorter: { multiple: 5 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Med Rec").length > 0) ? filteredValue.sort.filter((value) => value.field == "Med Rec")[0].order : null,
      order: 10,

    },
    {
      title: "Acc #",
      dataIndex: "Account Number",
      width: 120,
      ...getColumnSearchProps("Account Number"),
      filteredValue: filteredValue['Account Number'] || null,
      sorter: { multiple: 6 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Account Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Account Number")[0].order : null,
      order: 11

    },
    {
      title: "Patient Name",
      dataIndex: "Patient Name",
      width: 150,
      ...getColumnSearchProps("Patient Name"),
      filteredValue: filteredValue['Patient Name'] || null,
      order: 12
    },
    {
      title: "Capture Location",
      dataIndex: "Capture Location",
      width: 180,
      filters: tableFilters.captureLocation,
      filteredValue: filteredValue['Capture Location'] || null,
      sorter: { multiple: 7 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Capture Location").length > 0) ? filteredValue.sort.filter((value) => value.field == "Capture Location")[0].order : null,
      order: 13
    },
    {
      title: "Batch Capture Class",
      dataIndex: "Batch Capture Class",
      width: 180,
      // ...getColumnSearchProps("Batch Capture Class"),
      filters: tableFilters.batchCaptureClass,
      filteredValue: filteredValue['Batch Capture Class'] || null,
      sorter: { multiple: 8 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Batch Capture Class").length > 0) ? filteredValue.sort.filter((value) => value.field == "Batch Capture Class")[0].order : null,
      order: 14
    },

    {
      title: "Batch Type",
      dataIndex: "Batch Type",
      width: 150,
      // ...getColumnSearchProps("Batch Type"),
      filters: tableFilters.batchType,
      filteredValue: filteredValue['Batch Type'] || null,
      sorter: { multiple: 9 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Batch Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Batch Type")[0].order : null,
      order: 15
    },
    {
      title: "Edco Document Type",
      dataIndex: "Edco Document Type",
      width: 200,
      // ...getColumnSearchProps("Edco Document Type"),
      filters: tableFilters.edcoDocumentType,
      filteredValue: filteredValue['Edco Document Type'] || null,
      sorter: { multiple: 10 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Edco Document Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Edco Document Type")[0].order : null,
      order: 16
    },
    {
      title: "Doc Type",
      dataIndex: "Document Type",
      width: 200,
      // ...getColumnSearchProps("Document Type"),
      filters: tableFilters.docType,
      filteredValue: filteredValue['Document Type'] || null,
      sorter: { multiple: 11 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Document Type").length > 0) ? filteredValue.sort.filter((value) => value.field == "Document Type")[0].order : null,
      order: 17
    },
    {
      title: "Document Description",
      dataIndex: "Document Description",
      width: 220,
      filters: tableFilters.documentDescription,
      // ...getColumnSearchProps("Document Description"),
      filteredValue: filteredValue['Document Description'] || null,
      sorter: { multiple: 12 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Document Description").length > 0) ? filteredValue.sort.filter((value) => value.field == "Document Description")[0].order : null,
      order: 18
    },
    {
      title: "Release Date", dataIndex: "Release Date", width: 150, 
      sorter: { multiple: 1 },
      order: 19,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Release Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Release Date")[0].order : null,
    },
    {
      title: "Doc Id",
      dataIndex: "Document Id",
      width: 320,
      order: 20,
      ...getColumnSearchProps("Document Id"),
      filteredValue: filteredValue['Document Id'] || null,
      sorter: { multiple: 13 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Document Id").length > 0) ? filteredValue.sort.filter((value) => value.field == "Document Id")[0].order : null,

    },
    {
      title: "Order Number",
      dataIndex: "Order Number",
      width: 200,
      order: 21,
      ...getColumnSearchProps("Order Number"),
      filteredValue: filteredValue['Order Number'] || null,
      sorter: { multiple: 14 },
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Order Number").length > 0) ? filteredValue.sort.filter((value) => value.field == "Order Number")[0].order : null,

    },
    
    {
      title: "Order Date", dataIndex: "Order Date", width: 150, sorter: { multiple: 1 },
      order: 22,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Order Date").length > 0) ? filteredValue.sort.filter((value) => value.field == "Order Date")[0].order : null,
    },
    {
      title: "Chart Correction",
      dataIndex: "Chart Correction",
      width: 200,
      ...getColumnSearchProps("Chart Correction"),
      filteredValue: filteredValue['Chart Correction'] || null,
      sorter: { multiple: 15 },
      order: 23,
      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "Chart Correction").length > 0) ? filteredValue.sort.filter((value) => value.field == "Chart Correction")[0].order : null,

    },
    {
      title: "Document Pages",
      width: 150,
      order: 24,
      dataIndex: "Document Pages",
    },
    
    {
      title: "Process Type",
      dataIndex: "Process Type",
      width: 150,
      order: 25,
      ...getColumnSearchProps("Process Type"),
      filteredValue: filteredValue['Process Type'] || null
    },
    {
      title: "User Assigned", width: 150, dataIndex: "UserAssigned", filters: tableFilters.userAssigned,
      filteredValue: filteredValue['UserAssigned'] || null,
      order: 26,


    },
    {
      title: "Status", width: 80, dataIndex: "Status",
      filters: [
        { text: "Done", value: "Done" },
        { text: "Pending", value: "Pending" },
        { text: "Deferred", value: "Deferred" },
        { text: "Returned", value: "Returned" },
        { text: "Misc", value: "Misc" },
        { text: "QA Review", value: "QA Review" }
      ],
      order: 27,
      filteredValue: filteredValue['Status'] || null

    },
    { title: "User Logged", width: 150, dataIndex: "User" ,
      filters: tableFilters.user,
      filteredValue: filteredValue['User'] || null,
      order: 29
    },
    {
      title: "Start Time", dataIndex: "StartTimeStamp", width: 150, sorter: { multiple: 5 },
      order: 30,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "StartTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "StartTimeStamp")[0].order : null,
    },
    {
      title: "Finish Time", dataIndex: "FinishTimeStamp", width: 150, sorter: { multiple: 6 },
      order: 31,

      sortOrder: (filteredValue.sort && filteredValue.sort.filter((value) => value.field == "FinishTimeStamp").length > 0) ? filteredValue.sort.filter((value) => value.field == "FinishTimeStamp")[0].order : null,
    },
    {
      title: "Duration", dataIndex: "Duration", width: 100, 
      ...getColumnSearchProps("Duration"),
      order: 32,

      filteredValue: filteredValue['Duration'] || null
    },
    {
      title: "Archive", width: 100, dataIndex: "Archive" ,
      filters: [
          { text: "Yes", value: "" },
          { text: "", value: 'Yes' },

      ],
      order: 33,

      filteredValue: filteredValue['Archive'] || null
    },

  ];


  const ADD_NEW_ENTITY = "Add new customer";
  const DATATABLE_TITLE = "customers List";
  const ENTITY_NAME = "customer";
  const CREATE_ENTITY = "Create customer";
  const UPDATE_ENTITY = "Update customer";
  

  const modalConfig = {
    title: modalTitle,
    openModal,
    handleCancel
  };

  const openSortModal = () => {
    setSortModal(true)
  }

  const handleSortCancel = () => {
    setSortModal(false)
  }

  if(columns) {

    
    let cols = dataTableColumns.map((d, i) => {
      d.order = dataColumns[i].order
      return d
    })

    cols = cols.sort(GetSortOrder('order'))

    const sortModalConfig = {
      title: "Column Sort",
      openModal: sortModal,
      handleCancel: handleSortCancel,
      columns: cols,
      onSort:onSort
    };

    const config = {
      entity,
      panelTitle,
      dataTableTitle,
      ENTITY_NAME,
      CREATE_ENTITY,
      ADD_NEW_ENTITY,
      UPDATE_ENTITY,
      DATATABLE_TITLE,
      dataTableColumns: cols,
      dataTableColorList,
      onhandleSave,
      onHandleColorChange,
      handleSaveColor,
      getDefaultColors,
      getPreviousColors,
      openEditModal,
      openAddModal,
      getItems,
      reload,
      progressEntity,
      onCopied,
      getFilterValue,
      workEntity,
      showProcessFilters,
      userList: users,
      onWorkSaved,
      onRowMarked,
      WQFilterEntity ,
      getFullList,
      updateTime,
      reset,
      filtersUpdate: () => {
        localStorage.setItem('force-filter', true)
        setCurrentUser('')
      } ,
      openSortModal: openSortModal
    };
  
    return (columns && users.length > 0) ?
      <div>
        <Modals config={modalConfig} >
        {
            modalType == "EDIT" ?
            textModal : null
          }
          {
            modalType == "VIEW" ?
              viewModal : null
          }
          {
            modalType == "ERROR" ?
            selectModal : null
          }
          {
            modalType == "ERROR TRACKING" ?
              selectModal : null
          }
        </Modals>

        <SortModal config={sortModalConfig} ></SortModal>
        <FullDataTableModule config={config} />

      </div>
      : null
  } else {
    return ""
  }
}
