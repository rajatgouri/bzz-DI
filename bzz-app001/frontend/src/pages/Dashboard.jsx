import React, { useEffect, useRef, useState } from "react";
import { Form, Input, InputNumber, Space, Divider, Row, Col } from "antd";
import { Layout, Breadcrumb, Statistic, Progress, Tag } from "antd";
import {TrophyTwoTone} from "@ant-design/icons";
import { DashboardLayout } from "@/layout";
import RecentTable from "@/components/RecentTable";
import CalendarBoard from "./CalendarBoard";
import { request } from "@/request";
// import ReactStars from "react-rating-stars-component";
import LiquidChart from "@/components/Chart/liquid";
import SealOfExellence from "../assets/images/seal-of-exellence.png";
import TopCard from "@/components/TopCard";
import Socket from "../socket";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";

const barChartConfig = {
  width: 110,
  height: 110,
  style: {
    display: "inline-block",
    marginRight: "5px",
  }
}



const PreviewState = ({ tag, color, value }) => {
  let colorCode = "#000";
  switch (color) {
    case "bleu":
      colorCode = "#1890ff";
      break;
    case "green":
      colorCode = "#95de64";
      break;
    case "red":
      colorCode = "#ff4d4f";
      break;
    case "orange":
      colorCode = "#ffa940";
      break;
    case "purple":
      colorCode = "#722ed1";
      break;
    case "grey":
      colorCode = "#595959";
      break;
    case "cyan":
      colorCode = "#13c2c2";
      break;
    case "brown":
      colorCode = "#614700";
      break;
    default:
      break;
  }
  return (
    <div style={{ color: "#595959", marginBottom: 5 }}>
      <div className="left alignLeft">{tag}</div>
      <div className="right alignRight">{value} %</div>
      <Progress
        percent={value}
        showInfo={false}
        strokeColor={{
          "0%": colorCode,
          "100%": colorCode,
        }}
      />
    </div>
  );
};
export default function Dashboard() {
  const [reminders, setReminders] = useState("");  
  const [cardData, setCardData] = useState([]);

  

  useEffect(() => {    

    Socket.on('updated-wqs', () => {
      load();
    });

    Socket.on('updated-reminder', () => {
      loadReminder();
    });

    load();
    loadReminder();
  }, [])


  const loadReminder = () => {
    (async () => {
      const resposne = await request.read('billingreminder', 1);
      if(resposne.result) {
        setReminders(resposne.result[0]?.Reminder)
      }
    })()
  }


  const load = () => {
    (async () => {
      // const wq5508Progress = await request.list("wq5508progress");
      // const wq1075Progress = await request.list("wq1075progress");
      // const feedbackProgress = await request.list("feedback");
      const WQEDCOMCWorkProgress = await request.list("WQEDCOMCWork");
      const WQEDCOMFWorkProgress = await request.list("WQEDCOMFWork");

      const [ WQEDCOMCProgress, WQEDCOMFProgress , feedbackProgress, ] = await Promise.all([ request.list("WQEDCOMCprogress"), request.list("WQEDCOMFprogress"), request.list("feedback"), ]);

      let wq1 = WQEDCOMCProgress.result;
      let wq2 = WQEDCOMFProgress.result;
      let feedback = feedbackProgress.result; 
      let wq1Work = WQEDCOMCWorkProgress.result; 
      let wq2Work = WQEDCOMFWorkProgress.result; 

      
      let merged = [];

      for(let i=0; i<wq1.length; i++) {
        merged.push({
          EMPID: wq1[i].EMPID,
          wq1: wq1[i],
          wq2: wq2.filter(wq => wq.EMPID == wq1[i].EMPID)[0],
          feedback: feedback.filter(f => f.EMPID == wq1[i].EMPID)[0],
          wq1Work: wq1Work.filter(w => w.EMPID == wq1[i].EMPID)[0],
          wq2Work: wq2Work.filter(w => w.EMPID == wq1[i].EMPID)[0],

        });
      }

      setCardData(merged)

      
    })()
  }


  const leadColumns = [
    {
      title: "Client",
      dataIndex: "client",
    },
    {
      title: "phone",
      dataIndex: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color = status === "pending" ? "volcano" : "green";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];


  const ratingChanged = async (id, rating) => {
    const feedback = await request.create("feedback", {EMPID: id, Stars: rating});
    if(feedback.success) {
      notification.success({message: "Feedback given successfully!"})
    } 
  }

  
  const productColumns = [
    {
      title: "Product Name",
      dataIndex: "productName",
    },

    {
      title: "Price",
      dataIndex: "price",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color = status === "available" ? "green" : "volcano";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const dashboardStyles = {
    content: {
      "boxShadow": "none",
      "padding": "35px",
      "width": "100%",
      "overflow": "auto",
      "background": "#eff1f4"
    },
    section : {
      minHeight: "100vh", 
      maxHeight: "100vh",
      minWidth: "1300px"
    }

  }

  return (
    <DashboardLayout style={dashboardStyles}>
      <Row gutter={[20, 20]}>
        
       {
          cardData.map(( data, index) => {

            return <TopCard
            key={index}
            EMPID={data.EMPID}
            feedback={data.feedback}
            WQ1WorkDone={data.wq1Work}
            WQ2WorkDone={data.wq2Work}
            title={data?.wq1?.Nickname}
            percent1={data?.wq1?.ChargesProcessed}
            percent2={data?.wq2?.ChargesProcessed}
            amountWQ1075= {data?.wq2?.Amount ? JSON.parse(data.wq2.Amount) : [] }
            amountWQ5508= {data?.wq1?.Amount? JSON.parse(data.wq1.Amount) : []}
            agingDaysWq1075={data?.wq2?.AgingDays ? JSON.parse(data.wq2.AgingDays) : [] }
            agingDaysWq5508={data?.wq1?.AgingDays ? JSON.parse(data.wq1.AgingDays) : [] }
            onRatingChanged={(id, rating) => ratingChanged(id ,rating)}
            notes={() => {}}
            />
          })
        }
      </Row>
      <div className="space30"></div>
      <Row gutter={[24, 24]}>
      <Col className="gutter-row" style={{width: "20%"}}>
          <div className="whiteBox shadow" style={{ height: "100%" }}>
            <div
              className="pad20"
            >
              <h3 className="calendar-header" style={{fontSize: '14px !important'}}>Reminders</h3>
              <div style={{marginTop: "-10px", textAlign: "left"}} className="reminders-container" dangerouslySetInnerHTML={{ __html: reminders }}>
              </div>  
              {/* <Progress type="dashboard" percent={25} width={148} />
              <p>New Customer this Month</p>
              <Divider />
              <Statistic
                title="Active Customer"
                value={11.28}
                precision={2}
                valueStyle={{ color: "#3f8600" }}
                prefix={<ArrowUpOutlined />}
                suffix="%"
              /> */}
            </div>
          </div>
        </Col>
        <Col className="gutter-row" style={{width: "80%"}}>
          <div className="whiteBox shadow "  style={{  overflow: "auto"}}>
            {/* <Row className="pad10" gutter={[0, 0]}>
              <Col className="gutter-row" span={8}>
                <div className="pad15">
                  <h3 style={{ color: "#22075e", marginBottom: 15 }}>
                    Lead Preview
                  </h3>
                  <PreviewState tag={"Draft"} color={"grey"} value={3} />
                  <PreviewState tag={"Pending"} color={"bleu"} value={5} />
                  <PreviewState tag={"Not Paid"} color={"orange"} value={12} />
                  <PreviewState tag={"Overdue"} color={"red"} value={6} />
                  <PreviewState
                    tag={"Partially Paid"}
                    color={"cyan"}
                    value={8}
                  />
                  <PreviewState tag={"Paid"} color={"green"} value={55} />
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                {" "}
                <div className="pad15">
                  <h3 style={{ color: "#22075e", marginBottom: 15 }}>
                    Quote Preview
                  </h3>
                  <PreviewState tag={"Draft"} color={"grey"} value={3} />
                  <PreviewState tag={"Pending"} color={"bleu"} value={5} />
                  <PreviewState tag={"Not Paid"} color={"orange"} value={12} />
                  <PreviewState tag={"Overdue"} color={"red"} value={6} />
                  <PreviewState
                    tag={"Partially Paid"}
                    color={"cyan"}
                    value={8}
                  />
                  <PreviewState tag={"Paid"} color={"green"} value={55} />
                </div>
              </Col>
              <Col className="gutter-row" span={8}>
                {" "}
                <div className="pad15">
                  <h3 style={{ color: "#22075e", marginBottom: 15 }}>
                    Order Preview
                  </h3>
                  <PreviewState tag={"Draft"} color={"grey"} value={3} />
                  <PreviewState tag={"Pending"} color={"bleu"} value={5} />
                  <PreviewState tag={"Not Paid"} color={"orange"} value={12} />
                  <PreviewState tag={"Overdue"} color={"red"} value={6} />
                  <PreviewState
                    tag={"Partially Paid"}
                    color={"cyan"}
                    value={8}
                  />
                  <PreviewState tag={"Paid"} color={"green"} value={55} />
                </div>
              </Col>
            </Row> */}
            <CalendarBoard editable={false}/>

          </div>
        </Col>

        
      </Row>
      <div className="space30"></div>
      {/* <Row gutter={[24, 24]}>
        <Col className="gutter-row" span={24}>
          <div className="whiteBox shadow">
            <div >
              
            </div>
            <CalendarBoard editable={false}/>
          </div>
        </Col>

      </Row> */}
    </DashboardLayout>
  );
}
