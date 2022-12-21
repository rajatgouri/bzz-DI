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
  Select,
  Row,
  Col,
  DatePicker,
  Popconfirm,
  Progress,
  Divider
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

// import BarChart from "@/components/Chart/barchat";
import { CaretDownOutlined, CloseOutlined, CopyOutlined, EditOutlined, EyeFilled, CloudDownloadOutlined, DeleteOutlined, SortAscendingOutlined, ReloadOutlined, UploadOutlined, EyeInvisibleFilled, SettingOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { crud } from "@/redux/crud/actions";
import { selectListItems } from "@/redux/crud/selectors";
import { FilterOutlined } from "@ant-design/icons";
import moment from 'moment';
import uniqueId from "@/utils/uinqueId";
import inverseColor from "@/utils/inverseColor";
const EditableContext = React.createContext(null);
let { request } = require('../../request/index')
import LiquidChart from "@/components/Chart/liquid";
import { selectAuth } from "@/redux/auth/selectors";
// import { filter } from "@antv/util";
import CheckerFlags from "../../assets/images/checker-flags.png";
import ProgressChart from "@/components/Chart/progress";
import WhiteDot from "assets/images/white-dot.png"
import RedDot from "assets/images/red-dot.png"
import GreenDot from "assets/images/green-dot.png"
import Modals from "@/components/Modal";
import ModalDataTableModule from "../ModalDataTableModule";
import { getDate, getDay } from "@/utils/helpers";
import axios from "axios";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "@/config/serverApiConfig";
import { token as tokenCookies } from "@/auth";

import PageLoader from "@/components/PageLoader";


const { Option } = Select
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;


var date = new Date();
var utcDate = new Date(date.toUTCString());
utcDate.setHours(utcDate.getHours() - 7);
var usDate = new Date(utcDate)


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

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
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
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const renderCustomizedLabel = (props) => {
  const { x, y, width, value } = props;
  const radius = 10;

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - radius}
        fill="#000000"
        style={{
          fontSize: "9px"
        }}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value}
      </text>
    </g>
  );
};

export default function DataTable({ config }) {

  const inputColorRef = useRef(null);
  const [timer, setTimer] = useState(0)
  const [activeButton, setActiveButton] = useState();

  const countRef = useRef(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [tableItemsList, setTableItemsList] = useState([]);
  const [coloredRow, setColoredRow] = useState({});
  const [isDropDownBox, setDropDownBox] = useState(false);
  const [pickerColor, setPickerColor] = useState("#FFFFFF");
  const [colorIndex, setColorIndex] = useState(null);
  const [status, setStatus] = useState("Done")
  const [colorList, setColorList] = useState([]);
  const [EMPID, setEMPID] = useState(1);
  const [month, setMonth] = React.useState(moment().month() + 1)
  const [year, setYear] = React.useState(moment().year())
  const [amountList, setAmountList] = useState([]);
  const [inCopiedMode, setInCopiedMode] = useState(false);
  const [previousEntity, setPreviousEntity] = useState('');
  let { entity, WQFilterEntity, dataTableColumns, dataTableTitle, onhandleSave, openEditModal, openAddModal, getItems, reload, progressEntity, workEntity, onWorkSaved, onCopied, getFilterValue, showProcessFilters, userList, onRowMarked, getFullList, updateTime, filtersUpdate , reset, openSortModal} = config;
  const [copied, setCopied] = useState(true)

  const [users, setUsers] = useState(userList)
  const [process, setProcess] = useState('QA Review');
  const [startTime, setStartTime] = useState()
  const [selectedRowID, setSelectedRowID] = useState();
  const [openModal, setOpenModal] = useState(false)
  const [showClock, setShowClock] = useState(true)
  const [activeMRN, setActiveMRN] = useState()
  const [MRNFilter, setMRNFilter] = useState(false)
  const [filters1, setFilters1] = useState([])

  const [openDistributionModal, setOpenDistributionModal] = useState(false)
  const [distributionList, setDistributionsList] = useState()
  const [distributionForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const [openExportModal, setOpenExportModal] = useState(false)
  const [openEpicModal, setOpenEpicModal] = useState(false)
  const [epicList, setEpicList] = useState([]);
  const [fullList1, setFullList1] = useState([])
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [resetRow, setResetRow] = useState({})
  const [totalDocProcess, setTotalDocProcess] = useState(0)


  const [openExport1Modal, setOpenExport1Modal] = useState(false)
  const ref = useRef();
  const [exportform] = Form.useForm()




  const headersInstance = { [ACCESS_TOKEN_NAME]: tokenCookies.get() };

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      ...headersInstance,
    },
    onUploadProgress: data => {
      console.log(Math.round((100 * data.loaded) / data.total))
    },
  });




  useEffect(() => {
    setPreviousEntity(entity)
    setDataSource([])
    items= []
    let clock = localStorage.getItem('clock')
    setShowClock(JSON.parse(clock))
  
  }, [entity])
  /***************/


  const getCurrentDate = () => {
    return getDate()
  }

  const resetClock = () => {
    setActiveButton(null)
    setTimeout(() => setActiveButton(null), 10)
    clearInterval(countRef.current)
    setSelectedRowID(null)
    setSelectedRowKeys([])
    setStartTime(null)
    setTimer(0)
  }

  // const handleStart = async (id, row) => {
  //   debugger
  //   if (selectedRowID != null && selectedRowID == id) {
  //     setActiveButton(null)
  //     clearInterval(countRef.current)
  //     setSelectedRowID(null)
  //     setStartTime(null)
  //     setTimer(0)
  //     setActiveMRN(row['Batch Id'])
  //     if (row['Status'] != 'Done') {
  //       updateTime([id], { StartTimeStamp: null, 'Batch Id': row['Batch Id'] }, () => { }, 'Reset')
  //     }
  //     return
  //   } else if ((selectedRowID == id || selectedRowID == undefined)) {

  //     if (row['Duration'] == null) {
  //       setActiveButton(id)
  //       countRef.current = setInterval(() => {
  //         setTimer((timer) => timer + 1)
  //       }, 1000)
  //       setSelectedRowID(id);
  //       if (selectedRowKeys.length > 0) {
  //         setActiveButton(id)
  //         countRef.current = setInterval(() => {
  //           setTimer((timer) => timer + 1)
  //         }, 1000)
  //         setSelectedRowID(id);
  //         let date = getCurrentDate();
  //         setStartTime(date);

  //         updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')

  //       } else {
        
  //         let date = getCurrentDate();
  //         updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')
  //       }
  //     } else {
      

  //       let date = getCurrentDate();
  //       updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')
  //     }

  //     setSelectedRowID(id);
  //     setActiveMRN(row['Batch Id'])
  //     copy(id,row['Batch Id'], row['Batch Id'], false);
  //   }

  // }

  const handleStart = async (id, row, cp, dataIndex= '') => {
    if (selectedRowID != null && selectedRowID == id) {
      setActiveButton(null)
      clearInterval(countRef.current)
      setSelectedRowID(null)
      setStartTime(null)
      setTimer(0)
      setActiveMRN(row['Patient MRN'])
      if (row['Status'] != 'Done') {
        updateTime([id], { StartTimeStamp: null, 'Patient MRN': row['Patient MRN'] }, () => { }, 'Reset')
      }
      return
    } else if ((selectedRowID == id || selectedRowID == undefined)) {

      if (row['Duration'] == null) {

        if (selectedRowKeys.length > 0) {
          setActiveButton(selectedRowKeys[0])
          // countRef.current = setInterval(() => {
          //   setTimer((timer) => timer + 1)
          // }, 1000)
          setSelectedRowID(id);
          let date = getCurrentDate();
          setStartTime(date);

          updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')

        } else {
           setActiveButton(id)
          // countRef.current = setInterval(() => {
          //   setTimer((timer) => timer + 1)
          // }, 1000)
          setSelectedRowID(id);
          let date = getCurrentDate();
          setStartTime(date);
          updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')
        }
      } else {

        setActiveButton(id)
        countRef.current = setInterval(() => {
          setTimer((timer) => timer + 1)
        }, 1000)

        setSelectedRowID(id)
        let date = getCurrentDate();
        setStartTime(date);

        updateTime([id], { StartTimeStamp: date, 'Batch Id': row['Batch Id'] }, () => { }, 'Start')
      }

      setSelectedRowID(id);
      setActiveMRN(row['Batch Id'])
      copy(id,row['Batch Id'], row['Batch Id'], row, cp, dataIndex);

    }

  }

  const handleReset = (id, row) => {
    setResetRow(row)
    if (selectedRowID != id && selectedRowID == id) {
      return
    } else if (selectedRowID == id) {

      setOpenModal(true)
     
    }

  }

  const handleEpicModal = async () => {
    let response = await request.list(entity + '-epic', { entity })
    setOpenEpicModal(true)
    setEpicList(response.result.reverse())

  }


  // const handleColorChange = (color) => {
  //   const tmpObj = {};
  //   selectedRowKeys.map((x) => {
  //     tmpObj[x] = color;
  //   });

  //   clearInterval(countRef.current)
  //   setSelectedRowID(null)
  //   setActiveButton(null)
  //   setStartTime(null)

  //   setTimer(0)

  //   let data = colorList.filter(list => list.color == color)[0]

  //   if (openModal) {
  //     let date = getCurrentDate();
  //     console.log((new Date(date) - new Date(startTime)).toString());
  //     updateTime([resetRow.ID], { StartTimeStamp: startTime, FinishTimeStamp: date, 'Batch Id': resetRow['Batch Id'], Duration: (new Date(date) - new Date(startTime)).toString() }, () => { }, 'Stop', data)
  //   }

  //   // saves the color to database //
  //   setTimeout(() => {
  //   config.onHandleColorChange(selectedRowKeys, data)
      
  //   }, 2000)

  //   setColoredRow({ ...coloredRow, ...tmpObj });
  //   setOpenModal(false)
  //   setSelectedRowKeys([]);
  // };

  const handleColorChange = (color, keys=[], all) => {
    const tmpObj = {};
    
    if(keys.length > 0) {
      keys.map((x) => {
        tmpObj[x] = color;
      });
    } else {
      keys = selectedRowKeys
      keys.map((x) => {
        tmpObj[x] = color;
      });
    }
   

   
    clearInterval(countRef.current)
    setSelectedRowID(null)
    setActiveButton(null)
    setStartTime(null)
    setTimer(0)

    console.log(keys)

    let data = colorList.filter(list => list.color == color)[0]
    let d = data

    if (all) {
      d.text1 = data.text + " All"
    } else {
      d.text1 = data.text
    }

    if (openModal) {
      let date = getCurrentDate();
      let row = (items.filter(i => i.ID == resetRow.ID)[0])
      updateTime([resetRow.ID], { StartTimeStamp: startTime, FinishTimeStamp: date, 'Batch Id': resetRow['Batch Id'], Duration: (new Date(date) - new Date(startTime)).toString() }, () => { 
        
      }, 'Stop', data, row)
    }

    setTimeout(() => {
      config.onHandleColorChange( keys , d, selectedRowID)
    }, 2000)


    setActiveButton(null)

    setColoredRow({ ...coloredRow, ...tmpObj });
    setActiveMRN(null)
    setSelectedRowID(null)
    setOpenModal(false)
    setSelectedRowKeys([]);
  };

  const load = async () => {
    const { result = [] } = await request.listinlineparams('billingcalendarstaff', { month, year, date_column: 'WhenPosted' })
    // let currentDate = new Date().toISOString().split('T')[0];

    let date = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    const y = (new Date(date).getFullYear())
    var m = (new Date(date).getMonth())
    var d = (new Date(date).getDate())
    var fullDate = y

    if (m < 9) {
      m = ('0' + m + 1)
    } else {
      m = (m + 1)
      fullDate += "-" + m
    }


    if (d < 10) {
      d = ('-0' + d)
      fullDate += d
    } else {
      d = ('-' + d)
      fullDate += d
    }

    let getTodayResults = (result.filter(res => res['WhenPosted'].split("T")[0] == fullDate));

    const foundOnCalendar = getTodayResults.map(c => {
      return users.findIndex((el) => el.name.toLowerCase() == c.FirstName.split(" ")[0].toLowerCase())
    })

    for (let i = 0; i < foundOnCalendar.length; i++) {
      if (foundOnCalendar[i] >= 0) {
        let userList = users;

        userList[foundOnCalendar[i]].status = 'error'
        setUsers(userList)
      }
    }
  }

  React.useEffect(() => {
    load();
  }, [month, year])



  function MakeNewColor({ colorsList }) {

    const onDefault = () => {
      config.getDefaultColors((colors) => {
        setColorList(colors)
        onSaveColors(colors)
      })
    }

    const onChangeColorPicker = (e) => {
      if (colorList[colorIndex].color !== '#FFFFFF') {
        setPickerColor(e.target.value)
        if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return

        colorList[colorIndex].color = e.target.value;
        setColorList(colorList)
      }
    };

    const onSelectColor = (index, color) => {
      setColorIndex(index);
      setPickerColor(color);
      setStatus(colorList[index].text)
      handleColorChange(color);
      makeSelectedHightlight(index)
    }

    

    const makeSelectedHightlight = (index) => {
      let list = colorList;
      for (let i = 0; i < colorList.length; i++) {
        list[i].selected = false
      }
      list[index].selected = true;
    }

 
    const colorsButton = colorsList.map((element, index) => {
      let borderStyleColor = "lightgrey"
      return (
        <div className="colorPicker" key={uniqueId()}>
          <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: element.text == "QA Review" ? "bold" : "" }} className="digital"> {element.total < 999 ? ('000' + element.total).substr(-3) : element.total}</div>
          <Button
            type="primary"
            shape="circle"
            style={{
              background: element.color,
              borderColor: element.selected ? '#000000' : borderStyleColor,
              margin: "auto",
              marginBottom: "5px",
              display: element.text == "QA Review" ? "block" : "inline-block"

            }}
            onClick={(e) => {
              onSelectColor(index, element.color)
            }}
          >
            &nbsp;
          </Button>
          <span >{element.text}</span>
        </div>
      );
    });

    const popUpContent = (
      <div className="dropDownBox">
        <div >
          <span className="float-left"></span>
          <span className="float-right padding-right padding-top" >
            <CloseOutlined onClick={() => onCloseColor()} />
          </span>
        </div>

        <div className="pad20" style={{ width: "345px", height: "180px", marginTop: "20px" }}>

          <div >{colorsButton}</div>
          <div >

            <input
              type="color"
              autoFocus
              ref={inputColorRef}
              value={pickerColor}
              onChange={onChangeColorPicker}
              style={{
                width: "94%",
                marginBottom: '18px',
                marginTop: '5px',
                float: "left",
                marginLeft: "10px"
              }}
            />
            <Button style={{ float: "left" }} type="link" onClick={() => onDefault()}>Reset to Default Colors</Button>
            <Button style={{ float: "right", marginRight: "12px" }} type="primary" className="mb-1" onClick={() => onSaveColors(colorList)}>Save</Button>
          </div>
        </div>
      </div>
    );


    const onCloseColor = () => {
      config.getPreviousColors()
      setColorIndex(null)
      setPickerColor("#FFFFFF")
      setStatus("Done")
      setDropDownBox(!isDropDownBox)
    }

    const onSaveColors = (colors) => {

      const data = {
        Color1: colors[0].color,
        Color2: colors[1].color,
        Color3: colors[2].color,
        Color4: colors[3].color,
        Color5: colors[4].color,
        Color6: "#FFFFFF",
        Category1: colors[0].text,
        Category2: colors[1].text,
        Category3: colors[2].text,
        Category4: colors[3].text,
        Category5: colors[4].text,
        Category6: 'QA Review'
      }


      config.handleSaveColor(EMPID, data);
      onCloseColor()

    }

    const handleDropDownClick = () => {
      setDropDownBox(!isDropDownBox);
    };

    return (
      <>

        <div style={{ display: "inline-block", position: "relative", width: "350px" }} className="color-box">
          {colorsButton}

          <Dropdown
            overlay={popUpContent}
            trigger={["click"]}
            visible={isDropDownBox}
            // onVisibleChange={openColorBox}
            onClick={handleDropDownClick}
          >
            <Button shape="circle" style={{ top: "8px", position: "absolute", height: "28px" }} icon={<SettingOutlined />} />
          </Dropdown>
        </div>
      </>
    );
  }

  const onCopiedEvent = (textToCopy, filter) => {
    debugger
    if (filter) {

      if (current.managementAccess) {

        if (process == 'QA Review') {
          filters['Status'] = ['QA Review', 'Pending',  'Misc', 'Deferred']
        } else {
          filters['Status'] = ['Returned']
      }
    }
      
      handelDataTableLoad(1, { ...filters, 'Batch Id': [textToCopy]  }, sorters)

    } else {
      if (current.managementAccess) {
        let status = []

        if (process == 'QA Review') {
          status = ['QA Review', 'Pending',  'Misc', 'Deferred']
        } else {
          status = ['Returned']
        }
        handelDataTableLoad(1, { ...filters, 'Batch Id': [textToCopy], Status: status }, sorters)
      } else {
        handelDataTableLoad(1, { ...filters, 'Batch Id': [textToCopy] }, sorters)
      }
    }

    setInCopiedMode(true)
  }


  function copy(id, batchID, textToCopy, row,  filter = false,  text = '') {
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
      
      if (filter) {

        onCopied(id, batchID, textToCopy, text)
        notification.success({ message: text +  " Copied!", duration: 3 })
        
        if(text == 'Batch Id' && !inCopiedMode && row['Status'] != 'Done') {
          onCopiedEvent(textToCopy, filter)
          setStartProcess(true)
        }
        

      } else {
        onCopiedEvent(textToCopy, filter)
        setStartProcess(true)


      }
    
    });
  }

 




  const exportTable = async () => {
    notification.success({message: "Downloading..."})
    let response = await request.list(entity + "-exports");

    setFileName(response.result.name)
    setFileUrl(response.result.file)
    setOpenExportModal(true)
  }

  const onDistribution = async (value) => {

    if (value.distributions < 1) {
      return
    }


    if (typeof value['Status'] == 'string') {
      value["Status"] = [value['Status']]
    }

    if (typeof value['UserAssigned'] == 'string') {
      value["UserAssigned"] = [value['UserAssigned']]
    }

    if ( value['UserAssigned'] == 'All') {
      let user = users.slice()
      user.push({name: null})
      value["UserAssigned"] = user.map(u => u.name)
    }

    if (typeof value['Batch Capture Class'] == 'string') {
      value["Batch Capture Class"] = [value['Batch Capture Class']]
    }

    value['User'] = [""]


    if (value['ReleaseDate']) {
      value['ReleaseDate'] = new Date(value['ReleaseDate'][0]._d).toISOString().split('T')[0] + "T" + new Date(value['ReleaseDate'][1]._d).toISOString().split('T')[0]
    }

    setDistributionsList([])
    let response = await request.create('distributions', { Distributions: value.distributions, Model: entity, values1: value })
    if (!response.success) {
      notification.error({ message: "Distributions exceed the number of charges available!" })

      return
    }
    let result = (response.result)

    if (!response.success) {
      notification.error({ message:response.message})
      setDistributionsList(null)
      return
    }


    result = result.map((res) => {
      return ({
        userAssigned: "",
        result: res
      })
    })
    setDistributionsList(result);
  }

  const onAssignDestribution = async (value) => {
    filtersUpdate(true)
    let filter = distributionForm.getFieldValue()
    delete filter['distributions']
    
    let keys = Object.keys(value)
    let obj = keys.map((v, i) => {
      return {
        UserAssigned: value['distributions-' + i],
        'Batch Id': distributionList[i].result.map(re => re['Batch Id'])
      }
    })

    let dup = (obj.map((o) => o['UserAssigned']).filter((item, index) => obj.map((o) => o['UserAssigned']).indexOf(item) !== index))

    if (dup.length > 0) {
      notification.error({ message: "Duplicate Entry!" })
      return
    }



    handleCancel()
    distributionForm.resetFields()
    assignForm.resetFields()
    setDistributionsList(null)


    if (typeof filter['Status'] == 'string') {
      filter["Status"] = [filter['Status']]
    }

    if (typeof filter['UserAssigned'] == 'string') {
      filter["UserAssigned"] = [filter['UserAssigned']]
    }

    if ( filter['UserAssigned'] == 'All') {
      let user = users.slice()
      user.push({name: null})
      filter["UserAssigned"] = user.map(u => u.name)
    }

    filter['User'] = [""]


    if (filter['ReleaseDate']) {
      filter['ReleaseDate'] = new Date(filter['ReleaseDate'][0]._d).toISOString().split('T')[0] + "T" + new Date(filter['ReleaseDate'][1]._d).toISOString().split('T')[0]
    }

    if (typeof filter['Batch Capture Class'] == 'string') {
      filter["Batch Capture Class"] = [filter['Batch Capture Class']]
    }


    let response = await request.create('distributions-assigned', { Obj: obj, filter: filter, Model: entity })
    loadTable()


    if (response.success) {
      notification.success({ message: "Charges redistributed successfully!" })

    } else {
      notification.error({ message: "Something went wrong!" })
    }
  }

  const assignModalContent = (
    <Row gutter={[24, 24]}>
      
      <Col span={24}>
        <Form
          name="basic"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          onFinish={onAssignDestribution}
          autoComplete="off"
          form={assignForm}
        >

          <div className="charges-list">

            <Row gutters={[24, 24]}>

              <Col span={11}>
                {
                  distributionList && distributionList.map((distribution, i) => {
                    return (
                      <div className="distributions-list">
                        {
                          distribution.result[0] ?
                            <div>
                              <span className="bold"> {i + 1}.</span> {distribution.result[0]['Batch Id']} -  {distribution.result[distribution.result.length - 1]['Batch Id']}
                            </div>
                            : null
                        }
                      </div>
                    )
                  })
                }
              </Col>
              <Col span={3}>
                {
                  distributionList && distributionList.map((distribution, i) => {
                    return (
                      <div className="distributions-list">
                        {distribution.result.length}
                      </div>
                    )
                  })
                }
              </Col>
              <Col span={10} style={{ paddingRight: "15px" }}>
                {
                  distributionList && distributionList.map((distribution, i) => {
                    return (
                      <Form.Item
                        label=""
                        name={"distributions-" + i}
                        rules={[
                          {
                            required: true,
                            message: "please select user"
                          },
                        ]}
                      >

                        <Select style={{ width: "100%" }}>
                          {
                            users.map((user => {
                              return <Option key={user.EMPID} value={user.EMPID}>{user.text}</Option>
                            }))
                          }

                        </Select>
                      </Form.Item>

                    )
                  })
                }

              </Col>
            </Row>
          </div>


          <Form.Item wrapperCol={{ offset: 20 }}>
            <Button type="primary" htmlType="submit" style={{ marginLeft: "50px", marginBottom: "5px" }}>
              Assign
            </Button>
          </Form.Item>
        </Form>
      </Col>

    </Row>


  )

  const assginDistribution = (

    <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>
      <Col span={24} style={{ paddingTop: "6px", paddingRight: "48px" }}>
        <Row >
          <Col span={11} >
            <h4>Distributions</h4>
          </Col>
          <Col span={3} style={{ padding: "0px 5px" }}>
            <h4>Total</h4>
          </Col>
          <Col span={10} style={{ padding: "0px 10px" }}>
            <h4>User Assigned</h4>
          </Col>
        </Row>
      </Col>

      <Col span={24} className="charges-container">
        {
          distributionList && distributionList.length > 0 ?
            assignModalContent
            :
            distributionList && distributionList.length == 0 ?
              <PageLoader />
              :
              <div style={{ textAlign: "center" }}>
                {/* <h6 style={{marginTop: "16%"}}>No Data, Please enter value greater than 1 !</h6> */}
              </div>
        }
      </Col>


    </Row>

  )


  const distributionModal = (

    <Row gutter={[24, 24]} className="filter-distribuions">
      <Col span={24}>
        <Form
          name="basic"
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
          onFinish={onDistribution}
          autoComplete="off"
          form={distributionForm}
        >

          <Row gutter={[24, 24]} style={{ rowGap: "0px" }}>

            <Col span={8}>
              <h4>Status <span style={{ color: "red" }}>*</span></h4>

              <Form.Item
                label="Status"
                name="Status"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >

                <Select style={{ width: "100%" }} mode="multiple">
                  <Option value="QA Review">QA Review</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Deferred">Deferred</Option>
                  <Option value="Returned">Returned</Option>
                  <Option value="Misc">Misc</Option>
                </Select>
              </Form.Item>

            </Col>

            <Col span={8}>
              <h4>Batch Capture Class</h4>

              <Form.Item
                label="Batch Capture Class"
                name="Batch Capture Class"
              >
                <Select style={{ width: "100%" }} mode="multiple">

                  {
                    filters1.filter((d) => d.column == 'Batch Capture Class')[0] ?
                      filters1.filter((d) => d.column == 'Batch Capture Class')[0].recordset
                        .sort((a, b) => {
                          a = a['Batch Capture Class']
                          b = b['Batch Capture Class']
                          return (a < b) ? -1 : (a > b) ? 1 : 0;
                        })

                        .map((m) => {
                          return <Option value={m['Batch Capture Class']} >{m['Batch Capture Class']}</Option>
                        })
                      : null
                  }

                </Select>
              </Form.Item>
            </Col>




            <Col span={8}>
              <h4>Release Date</h4>
              <Form.Item
                label="Release Date"
                name="ReleaseDate"
              >
                <RangePicker />
              </Form.Item>
            </Col>

            <Col span={8}>
              <h4>User Assigned</h4>

              <Form.Item
                label="User Assigned"
                name="UserAssigned"
              >
                <Select style={{ width: "100%" }} mode="multiple">
                  <Option key={100} value={""}></Option>
                  <Option key={100} value={"All"}>All</Option>


                  {
                    users.map((user, index) => {
                      return <Option key={index} value={user.name}>{user.name}</Option>
                    })
                  }

                </Select>
              </Form.Item>
            </Col>


            <Col span={8}>
              <h4>Number of Staff <span style={{ color: "red" }}>*</span></h4>
              <Form.Item
                label=""
                name="distributions"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input type="number" min={1} style={{ width: "100%" }} className="box-shadow" />
              </Form.Item>

            </Col>

            <Col span={8}>
              <Form.Item style={{ textAlign: "end" }}>
                <Button type="primary" htmlType="submit" style={{ marginTop: "30px", width: "100%" }}>
                  Distribute
                </Button>
              </Form.Item>
            </Col>
          </Row>


        </Form>
      </Col>

      <Col span={24}>

        {
          distributionList && distributionList.length > 0 ?
            <div>
              <Divider />
              {assginDistribution}
            </div>

            : null
        }
      </Col>

    </Row>

  )


  const newDataTableColumns = dataTableColumns.map((obj) => {

    if (obj.dataIndex == "Batch Id" || obj.dataIndex == "Document Id") {


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
                {text} <CopyOutlined onClick={() => {
                  debugger
                  if (obj.dataIndex == 'Batch Id' && !inCopiedMode) {
                    handleStart(row.ID, row, true, obj.dataIndex) 
                  } else {
                    copy(row.ID,row['Batch Id'], row[obj.dataIndex], row, true, obj.dataIndex, );
                  }
                }}/>
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "StartTimeStamp" || obj.dataIndex == "FinishTimeStamp") {
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





    if (obj.dataIndex == "START") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div className="start-button">
                {
                   row["Status"] == 'Done' ?
                    <div style={{ height: "45px" }}></div> :
                    <Button type={activeButton != row.ID ? "primary" : "danger"} onClick={() => handleStart(row.ID, row, false, '')}>{activeButton == row.ID ? "RESET" : "START"}</Button>
                }
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Duration") {
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
                {text ? formatTime1(+text / 1000) : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "FINISH") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {
                   row["Status"] == 'Done'?
                    null :
                    <Button className="checker-background" onClick={() => handleReset(row.ID, row)}>      </Button>

                }
              </div>
            )
          };
        },
      })
    }



    if (obj.dataIndex == "Comments") {
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
                <EditOutlined onClick={() => {
                  openEditModal(row.ID, "Comments", "EDIT", "Edit Comments", "Edit ")
                }} />  {text ? <EyeFilled onClick={() => openAddModal(row.ID)} style={{ marginLeft: "10px" }} /> : ""}
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "Error Tracking") {
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
              <div style={{ width: "100%" }}>
                {/* <span style={{ display: "inline-block", height: "23px", width: "100%" }} onClick={() => openEditModal(row.ID, "Error Tracking", "ERROR TRACKING", "Error Tracking", "Edit Error Tracking")}>
                  {text}
                </span> */}
                <Select defaultValue={text} style={{ zIndex: 1000, width: "100%" }} onChange={(e) => {
                  onRowMarked(row, e, 'Error Tracking')
                }}>
                  <Option value="Yes">Yes</Option>
                  <Option value="No">No</Option>
                  <Option value=""></Option>
                </Select>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Error Type") {
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
              <div style={{ width: "100%" }}>
                <span style={{ display: "inline-block", width: "100%" }} onClick={() => openEditModal(row.ID, 'Error Type', 'ERROR', 'Error Type', 'Edit Error Type')}>
                  {text}
                </span>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Error") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {/* {text ? <img src={RedDot} width="9px" onClick={() => onRowMarked(row, true, 'Error')} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked(row, false, 'Error')} />} */}
                <Select value={text} style={{ zIndex: 1000, width: "100%" }} onChange={(e) => {
                  onRowMarked(row, e, 'Error')
                }}>
                  <Option value={'Yes'}>Yes</Option>
                  <Option value={'No'}>No</Option>
                  <Option value={''}></Option>
                </Select>
              </div>
            )
          };
        },
      })
    }

    if (obj.dataIndex == "Correct") {
      return ({
        ...obj,
        render: (text, row) => {

          return {
            props: {
              style: {
                background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
                color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
                textAlign: "center"
              },
            },
            children: (
              <div>
                {/* {text ? <img src={GreenDot} className="green-dot" width="15px" onClick={() => onRowMarked(row, true, 'Correct')} /> : <img src={WhiteDot} width="10px" onClick={() => onRowMarked(row, false, 'Correct')} />} */}
                <Select value={text} style={{ zIndex: 1000, width: "100%" }} onChange={(e) => {
                  onRowMarked(row, e, 'Correct')
                }}>
                  <Option value={'Yes'}>Yes</Option>
                  <Option value={'No'}>No</Option>
                  <Option value={''}></Option>

                </Select>
              </div>
            )
          };
        },
      })
    }


    if (obj.dataIndex == "Release Date" || obj.dataIndex == "Order Date" || obj.dataIndex == "Min Days End Date") {
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
                {text ?
                  text.split("T")[0].split('-')[1] + "-" +
                  text.split("T")[0].split('-')[2] + "-" +
                  text.split("T")[0].split('-')[0]

                  + " " + text.split("T")[1]?.substring(0, 5) : ""}
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
          props: {
            style: {
              background: coloredRow[row.ID] ? coloredRow[row.ID] : "",
              color: coloredRow[row.ID] ? inverseColor(coloredRow[row.ID]) : "",
            },
          },
          children:
            typeof text === "boolean" ? <Checkbox checked={text} /> : text,
        };
      },
    })
  });

  var { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);

  var { pagination, items, filters, sorters, colors } = listResult;
  const [dataSource, setDataSource] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [donePercent, setDonePercent] = useState(1);
  const [processPercent, setProcessPercent] = useState(0);
  const { current } = useSelector(selectAuth);
  const [selectedID, setSelectedID] = useState(0);
  const [fullList, setFullList] = useState([]);
  const [totalDocumentPages, setTotalDocumentPages] = useState(0);
  const [totalDocument, setTotalDocument] = useState(0);

  const [user, setUser] = useState({});
  const [amountToReview, setAmountToReview] = useState([])
  const [loading, setLoading] = useState(true)
  const [prevPage, setPrevPage] = useState(1);
  const [scroller, setScroller] = useState(0);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [totalProcess, setTotalProcess] = useState(0)
  const [countDown, setCountDown] = useState(10)
  const [stopLoading, setStopLoading] = useState(true)
  const [percentage, setPercentage] = useState(0)
  const [openDoneModal, setOpenDoneModal] = useState(false)
  const [archive, setArchieve] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState([])
  const [allSelectedRowsKeys, setAllSelectedRowsKeys] = useState([])
  const [startProcess, setStartProcess] = useState(false);





  useEffect(() => {
    setLoading(listIsLoading)
  }, [listIsLoading])

  useEffect(() => {
    if (config.dataTableColorList && colors && items.length > 0) {
      let list = config.dataTableColorList
      list = list.map(li => {

        li.total = colors[li.text][0]['count']
        return li
      })



      setColorList(list)
    }
  }, [config, items])


  useEffect(() => {

    if (config.dataTableColorList && items && items.length == 0) {

      let list = config.dataTableColorList
      list = list.map(li => {
        li.total = 0
        return li
      })

      setColorList(list)
    }
  }, [config])

  const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
  const preparebarChartData = async (dP, pP, totalProcess = 0, totalDocProcessed = 0) => {


    if (!current.managementAccess) {

      dispatch(crud.create(progressEntity, { ChargesProcessed: (pP * 100).toFixed(2), ChargesToReview: (dP * 100).toFixed(2), KPI: JSON.stringify({ totalProcess, totalDocProcessed}) }));

    }
  }

  // set Default color to each row //
  const setRowBackgroundColor = (items) => {
    const tmpObj = {};
    items.map(({ ID, Color }) => {
      tmpObj[ID] = Color
    });

    setColoredRow({ ...coloredRow, ...tmpObj });
  }

  useEffect(() => {

    if (items.length > 0) {
      setRowBackgroundColor(items)

      if (filters1.length > 0) {

        let DocTypeList = selectedFilter.filter(res => res['Document Type'] != "").map(res => (res['Document Type']))
        let CapLocList = selectedFilter.filter(res => res['Capture Location'] != "").map(res => (res['Capture Location']))
        let DocDescList = selectedFilter.filter(res => res['Document Description'] != "").map(res => (res['Document Description']))

        let docTypeList = filters1.filter((d) => d.column == 'Document Type')[0].recordset
          .map((m) => m['Document Type'])

        let capLocList = filters1.filter((d) => d.column == 'Capture Location')[0].recordset
          .map((m) => m['Capture Location'])

        let docDescList = filters1.filter((d) => d.column == 'Document Description')[0].recordset
          .map((m) => m['Document Description'])

        let defaultFilter = {}
        defaultFilter['Document Type'] = (docTypeList.filter(x => !DocTypeList.includes(x)))
        defaultFilter['Capture Location'] = (capLocList.filter(x => !CapLocList.includes(x)))
        defaultFilter['Document Description'] = (docDescList.filter(x => !DocDescList.includes(x)))


        let i = items.map(item => {
          item.key = item.id

          return item
        })

        getItems(items)
        setDataSource(i)
      }

      if (inCopiedMode) {
        selectAllRows(items)
      }
    } else {
      getItems(items)
      setDataSource([])

    }
  }, [items, filters1])


  const selectAllRows = (items) => {

    let ids = items.map((item) => item.ID);
    setAllSelectedRowsKeys(ids)

    if (!startProcess) {

      let index = items.findIndex((item) => item.ID == selectedRowID )
      let id = items.map((item) => item.ID).filter((i) => i == selectedRowID)[0];
      setSelectedRowKeys([id]);
      setActiveButton([id]);
      setSelectedRowID(id);
      console.log(items.move(index,0))

    }

  }

  // const selectAllRows = (items) => {
  //   setSelectedRowKeys(items.map((item) => item.ID))
  // }

  const getPercentage = (fullList = []) => {

    if (fullList) {


      let chargesProcessedCount = fullList.data.chargesProcessedCount[0]["count"] / fullList.data.document[0]["count"]
      let chargesToReviewCount = fullList.data.chargesReviewCount[0]["count"] / fullList.data.document[0]["count"]
      let list = fullList.data.notToReview
      setDonePercent(chargesToReviewCount)
      setProcessPercent(chargesProcessedCount)
      let TC = fullList.data.document[0]["count"]? fullList.data.document[0]["count"] : 0
      let TDC = fullList.data.documentPages[0]['count'] ? fullList.data.documentPages[0]['count'] : 0
      let TP = fullList.data.pagesProcessed[0]["count"]?fullList.data.pagesProcessed[0]["count"]: 0
      let TDP = fullList.data.documentPagesProcessed[0]['count'] ? fullList.data.documentPagesProcessed[0]['count']: 0
      setTotalDocument(TC)
      setTotalDocumentPages(TDC)
      setTotalProcess(TP )
      setTotalDocProcess(TDP)
      preparebarChartData(chargesToReviewCount, chargesProcessedCount, fullList.data.pagesProcessed[0]["count"]? fullList.data.pagesProcessed[0]["count"]: 0, fullList.data.documentPagesProcessed[0]['count'])

    }

  }


  const dispatch = useDispatch();

  const handelDataTableLoad = (pagination, filters = {}, sorter = {}, copied) => {

    setCountDown(10)

    if (inCopiedMode && !filters['Batch Id'] && copied) {
      setSelectedRowKeys([])
      setInCopiedMode(false)
    }

    delete filters['sort']


    let filteredArray = []
    if (sorter.length == undefined && sorter.column) {
      filteredArray.push(sorter)
    } else if (sorter.length > 0) {
      filteredArray = sorter
    }


    filteredArray = (filteredArray.map((data) => {
      if (data?.column?.fiters) {
        delete data.column.filters
      }
      return data
    }))

    if (!current.managementAccess && !filters.hasOwnProperty('Status') && !current.outside) {
      filters.Status = ['QA Review']
    }

    if (!current.managementAccess && !filters.hasOwnProperty('UserAssigned') && !current.outside) {
      filters.UserAssigned = [current.name]
    }


    const option = {
      page: pagination.current || 1,
      filter: (filters) || ({}),
      sorter: sorter ? (filteredArray) : ([])
    };

    filters.sort = (filteredArray);

    if (previousEntity == entity) {
      getFilterValue(filters);
    }

    dispatch(crud.list1(entity, option));

    (async () => {
      const response = await request.list(entity + "-full-list");

      getPercentage(response.result)
    })()
  };

  const loadTable = async () => {

    setLoading(true)
    let filterValueList = {};
    let filters = {};
    if (current.managementAccess) {


      filters = {
        ...filterValueList,
        UserAssigned: [],
        Status: ['Done', 'Pending', 'Deferred', 'Misc', 'QA Review']

      }
    } else {
      filters = {
        ...filterValueList,
        UserAssigned: [current.name], Status: ['QA Review'],
      }
    }

    getFilterValue(filters)


    delete filters['sort']

    const option = {
      page: localStorage.getItem(entity) != 'undefined' && localStorage.getItem(entity) != null ? localStorage.getItem(entity) : 1,
      filter: filters,
      sorter: ([])
    };

    dispatch(crud.list1(entity, option));

    (async () => {

      const response = await request.list(entity + "-full-list");
      getPercentage(response.result)

    })()

  }

  useEffect(() => {

    (async() => {
      setDataSource([])
      loadTable()
      const response2 = await request.list(entity + "-filters");
      setFilters1(response2.result.filters)
      getFullList(response2.result)
    })()
   

  }, []);

  useEffect(() => {
    setPrevPage(pagination.current)
  }, [pagination])


  const formatTime1 = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div>
        <span >{getHours} </span> :  <span>{getMinutes}</span> : <span>{getSeconds}</span>

      </div>
    )
  }

  const formatTime = (timer) => {
    const getSeconds = `0${(timer % 60)}`.slice(-2)
    const minutes = `${Math.floor(timer / 60)}`
    const getMinutes = `0${minutes % 60}`.slice(-2)
    const getHours = `0${Math.floor(timer / 3600)}`.slice(-2)

    return (
      <div className="timer-box-container">
        <span className="time-box">{getHours}</span> <span className="time-box">{getMinutes}</span>  <span className="time-box">{getSeconds}</span>
      </div>
    )
  }


  useEffect(async () => {

    if (dataSource.length == 0) {
      return
    }

    



    if (!reload) {

      
      if (inCopiedMode ) {

        if (!MRNFilter && copied && pagination.total < 100) {
          delete filters['Batch Id']
          setInCopiedMode(false)
        } else if (MRNFilter && copied && activeButton) {
          setInCopiedMode(true)
        } else {
          setInCopiedMode(false)
        }
      }


      if (previousEntity == entity) {

        // delete filters['sort']
        handelDataTableLoad(pagination, filters, sorters)
      } else {

        handelDataTableLoad(pagination, {}, {})
      }

    } else {
      setLoading(true)
    }

  }, [reload])

  useEffect(() => {

    const listIds = items.map((x) => x.ID);
    setTableItemsList(listIds);

  
  }, [items]);

  Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

  useEffect(() => {

    if (items.length > 0) {
      setRowBackgroundColor(items)
      getItems(items)
      setDataSource(items)
      if (selectedRowID) {
        let index = items.findIndex((item) => item.ID == selectedRowID )
        items.move(index,0)
        setSelectedRowKeys([selectedRowID])
      }


      if (inCopiedMode) {
        selectAllRows(items)
      } 
    } else {
      setDataSource([])
      getItems(items)

    }
  }, [items])

  useEffect(async () => {
    if (reset) {
      resetClock()
      // if (current.managementAccess) {
        delete filters['Batch Id']
        handelDataTableLoad(pagination, filters, sorters)
      // }
    }
  }, [reset])


  const [firstRow, setFirstRow] = useState();

  const [onSelect, setSelect] = useState(false);

  const onClickRow = (record, rowIndex) => {
    return {
      onClick: () => {
        setSelectedID(record.ID)

      },
      onMouseDown: (e) => {
        setFirstRow(rowIndex);

        if (inCopiedMode) {

          if (e.target.innerHTML == 'START' || e.target.innerHTML == 'RESET' || e.target.innerHTML == '<span>      </span>') {

            if (dataSource.length == 1) {
              setMRNFilter(false)
              setTimeout(() => setMRNFilter(false), 10)
            } else if (dataSource.length == selectedRowKeys.length) {
              setMRNFilter(false)

              setTimeout(() => setMRNFilter(false), 10)
            } else {
              setMRNFilter(true)
              setTimeout(() => setMRNFilter(true), 10)
            }

            setSelectedRowKeys([...selectedRowKeys])

          } else if (e.target.localName == 'img' || e.target.localName == 'span' || e.target.localName == 'path' || e.target.localName == 'div') {

            setMRNFilter(true)
            setTimeout(() => setMRNFilter(true), 10)
          }
          else if (inCopiedMode && !activeButton) {

            setMRNFilter(true)
            setTimeout(() => setMRNFilter(true), 10)
            setSelectedRowKeys([record.ID]);

          }


        } else {
          setSelectedRowKeys([record.ID]);
          setMRNFilter(false)
          setTimeout(() => setMRNFilter(false), 10)
        }

        setSelect(true);

      },
      onMouseEnter: () => {
        if (onSelect) {
          let tableList = []

          if (tableItemsList.length > 100) {

            tableList = (tableItemsList.filter(list => {
              return (tableItemsList.indexOf(list) < (pagination.current * 100) && tableItemsList.indexOf(list) > ((pagination.current - 1) * 100) - 1)
            }))

            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          } else {
            tableList = tableItemsList
            const selectedRange = tableList.slice(firstRow, rowIndex + 1);
            setSelectedRowKeys(selectedRange);

          }
        }


      },
      onMouseUp: () => {
        setSelect(false);


      },
      onDoubleClick: () => {

        if (!activeButton) {
          setOpenModal(true)

          setSelectedRowKeys([record.ID])
          setInCopiedMode(false)
        }
      }

    };
  };
  // const onClickRow = (record, rowIndex) => {
  //   return {
  //     onClick: () => {
  //       setSelectedID(record.ID)
  //     },
  //     onMouseDown: (e) => {
  //       setFirstRow(rowIndex);
  //       setSelectedRowKeys([record.ID]);
  //       setSelect(true);

  //     },
  //     onMouseEnter: () => {
  //       if (onSelect) {
  //         let tableList = []

  //         if (tableItemsList.length > 100) {

  //           tableList = (tableItemsList.filter(list => {
  //             return (tableItemsList.indexOf(list) < (pagination.current * 100) && tableItemsList.indexOf(list) > ((pagination.current - 1) * 100) - 1)
  //           }))

  //           const selectedRange = tableList.slice(firstRow, rowIndex + 1);
  //           setSelectedRowKeys(selectedRange);

  //         } else {
  //           tableList = tableItemsList
  //           const selectedRange = tableList.slice(firstRow, rowIndex + 1);
  //           setSelectedRowKeys(selectedRange);

  //         }
  //       }
  //     },
  //     onMouseUp: () => {
  //       setSelect(false);
  //     }
  //   };
  // };

  const handelColorRow = (checked, record, index, originNode) => {
    return {
      props: {
        style: {
          background: coloredRow[record.ID] ? coloredRow[record.ID] : "",
        },
      },
      // children: originNode,
    };
  };

  const onSelectChange = (selectedKeys, selectedRows) => {
    setSelectedRowKeys(selectedKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    hideSelectAll: true,
    columnWidth: 0,
    renderCell: handelColorRow,
    selectedRowKeys: selectedRowKeys,
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

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

  const handleSave = (row) => {
    const newData = [...items];
    const index = newData.findIndex((item) => row.ID === item.ID);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData)
    onhandleSave(row)

    setTimeout(() => handelDataTableLoad({}), 2000)
  }


  const handleClock = (value) => {
    setShowClock(value)
    localStorage.setItem('clock', JSON.stringify(value))
  }


  const getpercent = () => {
    let percent = 1
    let interval = setInterval(() => {
      percent += 2
      setPercentage(percent)
      if (percent > 99) {
        setPercentage(99)
        loadTable()

        clearInterval(interval)
        setOpenDoneModal(true)
        notification.success({ message: "Data is uploaded successfully!" })
        setPercentage(0)
      }
    }, 2000)
  }

  const handleEpicExport = async (file) => {
    setEpicList([])
    setLoading(true)
    let response = await request.create(entity + "-exports", { file: file, entity: entity })

    setOpenEpicModal(false)
    getpercent()
    if (response.success) {
      notification.success({ message: "Data is uploading.." })
    } else {
      notification.success({ message: "File doesn't match current date!" })

    }
  }



  const epicModal = (

    <Row gutter={[24, 24]} style={{ height: "300px", overflow: "auto" }}>
      <Col span={24}>
        {
          epicList && epicList.length > 0 ?

            epicList.map((list) => {
              return <div className="epic-list" onClick={(e) => handleEpicExport(list)}>
                {list}
              </div>
            })

            : <PageLoader />

        }
      </Col>

    </Row>

  )



  useEffect(() => {

    let interval;
    document.getElementById('scroller').addEventListener('mouseenter', () => {
      let body = document.getElementsByClassName('ant-table-body')[0]
      interval = setInterval(() => {
        body.scrollTop = body.scrollTop + 50
      }, 100)
    })

    document.getElementById('scroller').addEventListener('mouseleave', () => {
      clearInterval(interval)
    })
    setLoading(true)
    setDataSource([])
  }, [])

  const onProcessChanged = (e) => {
    const value = e.target.value;
    setProcess(value)
    setInCopiedMode(false)
    handelDataTableLoad(1, { 'Status': [value] }, {})
  }

  const barChartConfig = {
    width: 115,
    height: 95,
    data: chartData,
    style: {
      display: "inline-block",
      marginRight: "5px",
      marginTop: "10px"
    }
  }

  const handleCancel = () => {
    loadTable()
    setOpenModal(false)
    setOpenFilterModal(false)
    setOpenDistributionModal(false)
    distributionForm.resetFields()
    assignForm.resetFields()
    setDistributionsList(null)
  }


  const handleOpenModalCancel = () => {
    setOpenModal(false)
  }


  const modalTableConfig = {
    entity: WQFilterEntity,
    closeModal: handleCancel,
    dataTableData: filters1
  }

  function ColorListBox({ colorsList, show }) {

    const onDefault = () => {
      config.getDefaultColors((colors) => {
        setColorList(colors)
        onSaveColors(colors)
      })
    }

    const onChangeColorPicker = (e) => {
      if (colorList[colorIndex].color !== '#FFFFFF') {
        setPickerColor(e.target.value)
        if (colorIndex == null || e.target.value.substring(0, 2) == "#f") return

        colorList[colorIndex].color = e.target.value;
        setColorList(colorList)
      }
    };


    const onSelectColor = (index, color, all = false) => {
      debugger
      let keys = []
      if (all ) {

        let item = items.filter(item => item.ID == selectedRowKeys[0])[0]
        let BatchId = item['Batch Id']
        let Duration = item['Duration']


      
          keys = (items.filter(item => (item.Status != 'Done' ) && item['Batch Id'] == BatchId)).map(item => item.ID)

        setMRNFilter(false)
        setInCopiedMode(true)


      } else {
        keys = selectedRowKeys

      }

      handleColorChange(color, keys, all);
      makeSelectedHightlight(index)

      setColorIndex(index);
      setPickerColor(color);
      setStatus(colorList[index].text)

    }
    // const onSelectColor = (index, color) => {

    //   setColorIndex(index);
    //   setPickerColor(color);
    //   setStatus(colorList[index].text)
    //   handleColorChange(color);
    //   makeSelectedHightlight(index)
    // }

    const makeSelectedHightlight = (index) => {
      let list = colorList;
      for (let i = 0; i < colorList.length; i++) {
        list[i].selected = false
      }
      list[index].selected = true;
    }

    const colorsButton = colorsList.map((element, index) => {
      let borderStyleColor = "lightgrey"
      return (
        <div className="colorPicker" key={uniqueId()}>
          <div style={{ marginBottom: "5px", fontSize: "9px", fontWeight: element.text == "QA Review" ? "bold" : "" }} className="digital"> {element.total < 999 ? ('000' + element.total).substr(-3) : element.total}</div>
          <Button
            type="primary"
            shape="circle"
            style={{
              background: element.color,
              borderColor: element.selected ? '#000000' : borderStyleColor,
              margin: "auto",
              marginBottom: "5px",
              display: element.text == "QA Review" ? "block" : "inline-block"

            }}
            onClick={(e) => {
              onSelectColor(index, element.color)
            }}
          >
            &nbsp;
          </Button>
          <span >{element.text}</span>
        </div>
      );
    });




    const onCloseColor = () => {
      config.getPreviousColors()
      setColorIndex(null)
      setPickerColor("#FFFFFF")
      setStatus("Done")
      setDropDownBox(!isDropDownBox)
    }

    const onSaveColors = (colors) => {

      const data = {
        Color1: colors[0].color,
        Color2: colors[1].color,
        Color3: colors[2].color,
        Color4: colors[3].color,
        Color5: colors[4].color,
        Color6: "#FFFFFF",
        Category1: colors[0].text,
        Category2: colors[1].text,
        Category3: colors[2].text,
        Category4: colors[3].text,
        Category5: colors[4].text,
        Category6: 'QA Review'
      }

      config.handleSaveColor(EMPID, data);
      onCloseColor()

    }


    return (
      <>
        {
          show ?

            <div style={{ 'display': 'block', 'float': 'left' }}>
              <div>
                <h2
                  className="ant-page-header-heading-title"
                  style={{ fontSize: "36px", marginRight: "18px", width: "170px" }}
                >
                  {dataTableTitle}
                </h2>
              </div>
              <div style={{ marginTop: "-32px" }}>

                <div className="timer-container">
                  <div className="timer">
                    <p style={{ marginBottom: "3px" }}>{formatTime(timer)}</p>
                  </div>
                </div>
              </div>
            </div>

            : null
        }

        <div>
        <div style={{ display: "inline-block", position: "relative", width: "330px" , height: "148px" , marginBottom: "0px"}} className="color-box">
          {colorsButton}
          <div>
          <Button value={'all'} className="shadow-1" style={{ background: config.dataTableColorList.filter(li => li.text == 'Done')[0]['color']}} onClick={() => onSelectColor(0, config.dataTableColorList.filter(li => li.text == 'Done')[0]['color'], true)}>Done All</Button>
        </div>
        </div>
      
        </div>
      

      </>
    );
  }


  const handleDeleteModal = async () => {
    setOpenDeleteModal(false)

    await request.delete(entity, 1)
    loadTable()
  }


  const handleEpicCancel = () => {
    setOpenEpicModal(false)
    setEpicList([])
  }

  const modalConfig1 = {
    title: <span style={{ paddingLeft: "13px", fontWeight: 700 }}> {entity.toUpperCase() + " Assignments"} </span>,
    openModal: openDistributionModal,
    handleCancel,
    width: 800,
    minWidth: "800px"
  };

  const modalConfig2 = {
    title: entity.toUpperCase() + " Exports",
    openModal: openEpicModal,
    handleCancel: handleEpicCancel,
    width: 500,
  };


  const deleteModal = () => {
    setOpenDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setOpenDeleteModal()

  }


  const modalConfig4 = {
    title: "Delete Entries ",
    openModal: openDeleteModal,
    handleCancel: closeDeleteModal,
  };

  const modalConfig = {
    title: "",
    openModal,
    handleCancel: handleOpenModalCancel,
    width: 352,
    
  };

  const closeExportModal = () => {
    setOpenExportModal(false)
  }

  const closeExport1Modal = () => {
    setOpenExport1Modal(false)
    setSelectedFile({})
    exportform.resetFields()

  }

  const handleFileModal = () => {

    setOpenExport1Modal(true)
  }

  const handleFileUpoad = async () => {
    const formData = new FormData();

    if (!selectedFile.name) {
      return
    }

    formData.append(
      "myFile",
      selectedFile,
      selectedFile.name
    );
    closeExport1Modal()


    setLoading(true)
    // getpercent()
    // notification.success({ message: "Data is uploading..." })

    let response = await request.create("upload-file-" + entity.toUpperCase(), formData)

    if (response.success) {
      setLoading(true)
      filtersUpdate()

      closeExport1Modal()

      getpercent()
      setSelectedFile(null)
    } else {
      setPercentage(0)
      clearInterval(interval)
    }
    // setTimeout(() => {

    //   loadTable()

    // }, 120000)

  }

  const modalConfig7 = {
    title: "Upload File",
    openModal: openExport1Modal,
    handleCancel: closeExport1Modal,
    width: 500
  };


  const closeDoneModal = () => {
    setOpenDoneModal(false)
  }

  const modalConfig8 = {
    title: "Success",
    openModal: openDoneModal,
    handleCancel: closeDoneModal,
    width: 500
  };


  const [selectedFile, setSelectedFile] = useState()
  const uploadFile = async (e) => {

    console.log(e.target.files)
    if (e.target.files[0].type ==  "application/vnd.ms-excel" || e.target.files[0].type ==  "text/csv") {
      setSelectedFile(e.target.files[0])
    } else {
      notification.error({ message: "Please choose CSV file!" })
    }
  }



  const modalConfig6 = {
    title: "Download File",
    openModal: openExportModal,
    handleCancel: closeExportModal,
    width: 500
  };

  return (
    <div className="wq-table">
      <div style={{ 'display': 'block', marginBottom: "30px" }}>
        <h2
          className="ant-page-header-heading-title"
          style={{ fontSize: "36px", marginRight: "18px", width: "68%", display: "inline-block" }}
        >
          {dataTableTitle}

        </h2>
        <div style={{ width: "30%", display: "inline-block", textAlign: "end" }}>

        <Button className="ml-3" size="small" onClick={() => {
         openSortModal()
        }} key={`${uniqueId()}`}>
          <SortAscendingOutlined />
        </Button>

          <Button title="Load" style={{ marginLeft: "10px", marginTop: "2px" }} size="small" onClick={() => handleFileModal()}>
            <UploadOutlined />
          </Button>




              <Button title="Distribute" style={{ marginLeft: "10px" }} size="small" onClick={() => {
                setOpenDistributionModal(true)
                distributionForm ? distributionForm.resetFields() : ""
              }}>
                <UnorderedListOutlined />
              </Button>
           

          <Button title="Filter" size="small" style={{ marginLeft: "10px" }} onClick={() => setOpenFilterModal(true)} key={`${uniqueId()}`}>
            <FilterOutlined />
          </Button>


          <Button title="Export" style={{ marginLeft: "10px", marginTop: "2px" }} size="small"  >
            <CloudDownloadOutlined onClick={() => exportTable()} />
          </Button>

          {
            !showClock ?

              <Button title="Unhide" size="small" style={{ marginLeft: "10px" }} key={`${uniqueId()}`}>
                <EyeFilled onClick={() => handleClock(true)} />
              </Button>
              :

              <Button title="Hide" size="small" style={{ marginLeft: "10px" }} key={`${uniqueId()}`}>
                <EyeInvisibleFilled onClick={() => handleClock(false)} />
              </Button>

          }

          <Button title="Refresh" style={{ marginLeft: "10px", marginTop: "2px" }} size="small" onClick={() => handelDataTableLoad(1, entity == "wq5508" ? { 'Process Type': filters['Process Type'] } : {}, {})} key={`${uniqueId()}`}>
            <ReloadOutlined />
          </Button>

        </div>
      </div>

      <PageHeader
        style={{
          "padding": "0px",
          "marginTop": "-5px",
          "marginBottom": "10px"
        }}
        ghost={false}
        tags={
          <div style={{ width: "550px" }}>
            <div className="inline-block clock-container">

              <div>


              </div>
              <div className="timer-container">
                <div className="timer">
                  {
                    showClock ?
                      <p style={{ marginBottom: "3px" }}>{formatTime(timer)}</p>
                      : null
                  }
                </div>
              </div>
            </div>
            <div className="inline-block color-container">
              {
                colorList.length > 0 ?
                  <MakeNewColor
                    colorsList={colorList}
                  /> : null
              }
            </div>
          </div>

        }
        extra={[
          <div className="text-right flex ">

            {/* <div className="counter-container" >
              <div style={{ height: "84px" }}>
                <div>
                  <p className="amount-container digital">{
                    (parseInt(totalProcess)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                  <p className="general-label">Pages Processed</p>
                </div>

              </div>
            </div> */}

            <div className="counter-container" >
              <div style={{ height: "84px" }}>
                <div>
                  <p className="amount-container digital">{
                    (parseInt(totalProcess)).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  } </p>
                  <p className="general-label">Pages Processed</p>
                </div>
                <div>
                  <p className="total-container digital">{totalDocProcess?totalDocProcess: 0 }</p>
                  <p className="general-label">Documents Processed</p>
                </div>
              </div>
            </div>
            {/* <ProgressChart percent={(processPercent * 100).toFixed(2)} text={"Work Done"} /> */}
            {/* <LiquidChart percent={donePercent} text={"Charges to Review"} /> */}
            {/* <ProgressChart percent={(donePercent * 100).toFixed(2)} color="#f89321" text={"Work to Do"} wq1={false} /> */}


            <div>

            <div className="chart-container">
                <div className="empty-aging-days" style={{
                  padding: "5px",
                  width: "106px",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                    {/* <img src={CheckerFlags} width="65" height="35"></img> */}
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "23px" }} className="digital"> {('00000' + totalDocument).substr(-5)}</div>
                      {/* {} */}
                    </div>

                  </div>
                </div>

                <div >

                </div>

                <p className="barchart-label" style={{ marginTop: "-18px" }}>Total Document</p>
              </div>
            <div className="chart-container">
                <div className="empty-aging-days" style={{
                  padding: "5px",
                  width: "106px",
                  margin: "auto",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                    {/* <img src={CheckerFlags} width="65" height="35"></img> */}
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "23px" }} className="digital"> {('00000' + totalDocumentPages).substr(-5)}</div>
                      {/* {} */}
                    </div>

                  </div>
                </div>

                <div >

                </div>

                <p className="barchart-label" style={{ marginTop: "-18px" }}>Total Pages</p>
              </div>

            

             
            </div>
            {/* : null
            }
             */}

            <div className="user-members" style={{ minWidth: "115px" }}>
              <div style={{ height: "92px", padding: "5px 0px", overflowX: "inherit" }} >
                {
                  users.map((user) => {
                    return <Badge className="mr-3 text-shadow fnt-10 d-block" status={user.status} text={user.name} />
                  })
                }
              </div>

              <p className="general-label" style={{ marginRight: "0px" }}>Attendance</p>

            </div>

          </div>
        ]}
       
      ></PageHeader>
      <Table
        columns={columns}
        rowKey="ID"
        rowSelection={rowSelection}
        onRow={onClickRow}
        rowClassName={(record, index) => {
          return 'wq-rows'
        }}
        // rowClassName={setRowClassName}
        scroll={{ y: 'calc(100vh - 29.3em)' }}

        dataSource={dataSource}
        pagination={pagination}
        loading={{
          spinning: loading ? true : false,
          indicator: <div>
            <PageLoader></PageLoader>
            {
              percentage > 1 ?
                <Progress percent={percentage}></Progress>
                : null
            }
          </div>
        }}
        // components={components}
        onChange={handelDataTableLoad}
        footer={
          () => (
            <Row gutter={[24, 24]}>
              <Col style={{ width: "45%" }}>
                        <Radio.Group value={process} onChange={onProcessChanged}>
                          <Radio.Button value="QA Review" className="box-shadow " >QA Review</Radio.Button>
                          <Radio.Button value="Returned" className="box-shadow mr-3" >Returned</Radio.Button>
            </Radio.Group>

              </Col>
              <Col style={{ width: "10%" }}>
                <div className="text-center" >
                  <Button type="text" id="scroller">
                    <CaretDownOutlined />
                  </Button>
                </div>
              </Col>
              <Col span={4}>

              </Col>

            </Row>
          )
        }
      />
      <div style={{ marginTop: "-30px" }}>
      </div>

      <div>
        {
          // fullList1.length > 0 ?
          <Modals config={{
            title: "",
            openModal: openFilterModal,
            handleCancel,
            width: 1030,
            close: true,
            minHeight: "410px"
          }}>
            <ModalDataTableModule config={modalTableConfig}></ModalDataTableModule>
          </Modals>
          // : null
        }

      </div>

      <Modals config={modalConfig}>
        <div className="color-box-container">
          {
            colorList.length > 0 ?
              <ColorListBox colorsList={colorList} show={false} />
              : null
          }
        </div>
      </Modals>



      {/* Number of split charges */}
      <div className="distribution-modal">
        <Modals config={modalConfig1}>
          {distributionModal}
        </Modals>
      </div>

      <div className="epic-modal">
        <Modals config={modalConfig2}>
          {epicModal}
        </Modals>
      </div>

      <div className="delete-modal">
        <Modals config={modalConfig4}>
          <p> Delete {entity.toUpperCase()}  data table entries?</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" danger onClick={() => handleDeleteModal()}>Yes</Button>
            <Button type="primary" style={{ marginLeft: "10px" }} onClick={() => closeDeleteModal()}>No</Button>

          </div>
        </Modals>
      </div>

      <div className="confirm-modal">
        <Modals config={modalConfig6}>
          <p> {fileName}</p>

          <div style={{ marginBottom: "12px", textAlign: "end" }}>
            <Button type="primary" href={fileUrl} onClick={() => closeExportModal()}>Yes</Button>
            <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExportModal()}>No</Button>

          </div>
        </Modals>
      </div>


      <div className="load-modal">
        <Modals config={modalConfig7}>

          <Form
            name="basic"
            labelCol={{ span: 0 }}
            wrapperCol={{ span: 24 }}
            // onFinish={onAssignDestribution}
            autoComplete="off"
            form={exportform}
          >

            <Form.Item
              label=""
              name="file"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input type="file" className="file-upload" ref={ref} id="file" style={{ width: "100%", marginBottom: "-5px", marginTop: "10px" }} onChange={(e) => uploadFile(e)} />

              {/* <Input type="number" min={1} style={{ width: "100%" }} className="box-shadow" /> */}
            </Form.Item>


            <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
              <Button type="primary" onClick={() => handleFileUpoad()}>Yes</Button>
              <Button type="primary" danger style={{ marginLeft: "10px" }} onClick={() => closeExport1Modal()}>No</Button>

            </div>
          </Form>
        </Modals>
      </div>

      <div className="done-modal">
        <Modals config={modalConfig8}>
          <h4>Data upload completed successfully!</h4>

          <div style={{ marginBottom: "12px", marginTop: "20px", textAlign: "end" }}>
            <Button type="primary" onClick={() => closeDoneModal()}>Close</Button>
          </div>
        </Modals>
      </div>
    </div>
  );
}
