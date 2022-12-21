import React, { useRef, useState, useEffect } from "react";
import { Layout, Form, Breadcrumb, Statistic, Progress,Divider, Tag, Row, Col, Button, notification } from "antd";

import {TrophyTwoTone} from "@ant-design/icons";
import { Column, Liquid, Pie , Gauge} from "@ant-design/charts";
import { request } from "@/request";
import PageLoader from "@/components/PageLoader";

import { DashboardLayout } from "@/layout";
import TopCard from "@/components/TopCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import Modals from "@/components/Modal";
import TextArea from "rc-textarea";
import Socket from "../../socket";

const barChartConfig = {
  width: 110,
  height: 110,
  style: {
    display: "inline-block",
    marginRight: "5px",
  }
}

const DemoGauge = ({percent}) => {

  var config = {
    percent: +percent / 100,
    type: 'meter',
    innerRadius: 0.75,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A',  '#FAAD14', '#30BF78' ],
    },
    
    indicator: {
      pointer: { style: { display: 'none' } },
      pin: { style: { stroke: '#D0D0D0' } },
    },
    axis: {
      label: {
        formatter: function formatter(v) {
          return Number(v) * 100;
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '18px',
          lineHeight: '20px',
          color: "#000000",
          fontWeight: "600",
          marginTop: "15px"
        },
      },
    },
  };
  return <Gauge height={150} {...config} />;
};


const DemoLiquid = () => {
  var config = {
    percent: 0.25,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: { length: 128 },
  };
  return <Liquid   {...config} />;
};
const DemoPie = () => {
  var data = [
    {
      type: "A+",
      value: 27,
    },
    {
      type: "A-",
      value: 25,
    },
    {
      type: "AB+",
      value: 18,
    },
    {
      type: "AB-",
      value: 15,
    },
    {
      type: "O+",
      value: 10,
    },
    {
      type: "O-",
      value: 5,
    },
  ];
  var config = {
    appendPadding: 10,
    data: data,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      type: "spider",
      labelHeight: 28,
      content: "{name}\n{percentage}",
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
  };
  return <Pie {...config} />;
};

const dashboardStyles = {
  content: {
    "boxShadow": "none",
    "padding": "35px",
    "width": "100%",
    "overflow": "auto",
    "background": "#eff1f4"
  },
  section: {
    minHeight: "100vh",
    maxHeight: "100vh",
    minWidth: "1300px"
  }
}

export default function PerformanceCards() {

  const [cardData, setCardData] = useState([])
  const [totalProductivity, setTotalProductivity] = useState(0);
  const [totalWQEDCOMFProductivity, setTotalWQEDCOMFProductivity] = useState(0);
  const [selectedID, setSelectedID] = useState(0); 
  const [openModal, setOpenModal] = useState(false);
  const [editForm] = Form.useForm();
  const [admins, setAdmins] = useState([])


  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load()
    });

    load()
  }, [])


  const getCalendar = async (month, year, cb) => {
    
    
    cb(result)
  } 

  const load = () => {
    (async () => {
      let month = (new Date().getMonth() + 1)
      let year = (new Date().getFullYear())


      const performance = await request.list('performance');

      let {WQEDCOMCProgress, WQEDCOMFProgress, feedbackProgress, adminlist, WQEDCOMFWorkProgress =  [], WQEDCOMCWorkProgress = [], kpi} = performance.result

      let WQEDCOMC = WQEDCOMCProgress;
      let WQEDCOMF = WQEDCOMFProgress;
      let feedback = feedbackProgress;
      let WQEDCOMCWork = WQEDCOMCWorkProgress;
      let WQEDCOMFWork = WQEDCOMFWorkProgress;
      let admin = adminlist;

      let liAdmin = (admin.filter(list => (list.ManagementAccess == 1 && list.First != "Admin" && list.First != "Jason") || list.SpecialAccess != 1))
      let user  =  admin.filter(list => list.ManagementAccess != 1 )

      let b = liAdmin[liAdmin.findIndex((li) => li.Nickname == "Carmen")];
      liAdmin[liAdmin.findIndex((li) => li.Nickname == "Carmen")] = liAdmin[liAdmin.findIndex((li) => li.Nickname == "Ashleigh")];
      liAdmin[liAdmin.findIndex((li) => li.Nickname == "Ashleigh")] = b;

      setAdmins(liAdmin)

      let merged = [];

      WQEDCOMC = (WQEDCOMC.sort((a,b) => {
        return a.First.localeCompare(b.First)
      }))      

      for (let i = 0; i < user.length; i++) {
        let KPI = kpi.filter(k => k.EMPID == user[i].EMPID)
      
       
       let obj = {
        WQEDCOMCKPI: (KPI.map(res => ({
          value: res.WQEDCOMCPagesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5), 
        WQEDCOMFKPI: (KPI.map(res => ({
          value: res.WQEDCOMFPagesProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5),
        WQEDCOMCDOCKPI: (KPI.map(res => ({
          value: res.WQEDCOMCDocumentProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5), 
        WQEDCOMFDOCKPI: (KPI.map(res => ({
          value: res.WQEDCOMFDocumentProcessed,
          year: res.ActionTimeStamp.split('T')[0].substr(5,10).replace('-', '/') 
        }))).splice(0,5),
        
       }  

      console.log(obj)

        merged.push({
          EMPID: user[i].EMPID,
          WQEDCOMC: WQEDCOMC[i],
          WQEDCOMCKPI: obj.WQEDCOMCKPI.reverse(),
          WQEDCOMFKPI: obj.WQEDCOMFKPI.reverse(),
          WQEDCOMCDOCKPI: obj.WQEDCOMCDOCKPI.reverse(),
          WQEDCOMFDOCKPI: obj.WQEDCOMFDOCKPI.reverse(),
          user: user[i],
          WQEDCOMF: WQEDCOMF.filter(wq => wq.EMPID == user[i].EMPID)[0],
          feedback: feedback.filter(f => f.EMPID == user[i].EMPID)[0],
          WQEDCOMCWork: WQEDCOMCWork.filter(w => w.EMPID == user[i].EMPID)[0],
          WQEDCOMFWork: WQEDCOMFWork.filter(w => w.EMPID == user[i].EMPID)[0],

        });
      }

      setCardData(merged)
 
     })()
  }

  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", {EMPID: id, Stars: rating});
    if(feedback.success) {
      notification.success({message: "Feedback given successfully!"})
    } 
  }

  const addNote = (id) => {

    setSelectedID(id)
    setOpenModal(true)
  }

  const handleCancel = () => {
    setOpenModal(false)
  }


  const modalConfig = {
    title: "Add a Note",
    openModal,
    handleCancel
  };

  const onEditItem = async (values) => {
    console.log(selectedID)
    await request.update("WQEDCOMCWork", selectedID , {Notes: values.Notes ? values.Notes : "" });
    editForm.resetFields()
    setOpenModal(false)
  }

  return (
    <DashboardLayout style={dashboardStyles}>

{
        cardData.length > 0 ?
        <Row gutter={[20, 20]}style={{ width: "100%", display: "block", marginLeft: "0px" }}>
        <Col className="" style={{ width: "100%", textAlign: "left", padding: "0px"  }}>
              <div
                className="whiteBox shadow"
                style={{ color: "#595959", fontSize: 13 }}
              >

                <Row gutter={[24, 24]} className="texture">
                  {
                    admins && admins.map((admin) => {
                      return <Col style={{ width: "20%", height: "142px" }}>
                        <div
                          className="pad5 strong"
                          style={{ textAlign: "left" }}
                        >
                          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">

                            {admin.Nickname}

                          </h3>

                          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
                            {
                              admin && admin.Avatar && admin.Avatar != "null" ?
                                <img src={admin.Avatar} className="user-avatar scale2"></img>
                                : null
                            }
                          </div>

                        </div>
                      </Col>
                    })
                  }

                  <Col  style={{ width: "260px", position: "absolute", right: "0px", display: "flex" ,height: "142px"}}>
                      <span  className="topbar-header">Management</span>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          : null
      }
      <div className="space30"></div>

      <Row gutter={[24, 24]}>
      {
          cardData.length > 0 ?
          cardData.map(( data) => {

            return <TopCard
            EMPID={data.EMPID}
            user={data.user}
            KPI= {{
              WQEDCOMF :data.WQEDCOMFKPI,
              WQEDCOMC : data.WQEDCOMCKPI,
              WQEDCOMCDOC: data.WQEDCOMCDOCKPI,
              WQEDCOMFDOC: data.WQEDCOMFDOCKPI 
            }}
            feedback={data.feedback}
            WQEDCOMCWorkDone={data.WQEDCOMCWork}
            WQEDCOMFWorkDone={data.WQEDCOMFWork}
            title={data?.user?.Nickname}
            showCalendar={true} 
            kpi1={data?.WQEDCOMC?.KPI}
            kpi2={data?.WQEDCOMF?.KPI}
            percent1={data?.WQEDCOMC?.ChargesProcessed}
            percent2={data?.WQEDCOMF?.ChargesProcessed}
            amountWQEDCOMF= {data?.WQEDCOMF?.Amount ? JSON.parse(data.WQEDCOMF.Amount) : [] }
            amountWQEDCOMC= {data?.WQEDCOMC?.Amount? JSON.parse(data.WQEDCOMC.Amount) : []}
            agingDaysWQEDCOMF={data?.WQEDCOMF?.AgingDays ? JSON.parse(data.WQEDCOMF.AgingDays) : [] }
            agingDaysWQEDCOMC={data?.WQEDCOMC?.AgingDays ? JSON.parse(data.WQEDCOMC.AgingDays) : [] }
            onRatingChanged={(id, rating) => ratingChanged(id ,rating)}
            showBadge={true}
            notes={(id) => addNote(id)}

            />
          })
          
          :
          <PageLoader />
        }
      </Row>
      <div className="space30"></div>
     
        <Modals config={modalConfig} >
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
              label="Notes"
              name="Notes"
            >
              <TextArea type="text" style={{ width: "100%", marginBottom: "-5px" }} rows={2} />
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 18 }}>
              <Button type="primary" htmlType="submit" className="mr-3">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modals>
    </DashboardLayout>
  );
}
