import React, { useRef, useState, useEffect } from "react";
import {  Divider, Tag, Row, Col, Button, notification,  Radio } from "antd";

import { Column, Liquid, Pie, Gauge , Line} from "@ant-design/charts";
import { request } from "@/request";

import { DashboardLayout } from "@/layout";
import Socket from "../../socket";
import CheckmarkCalendar from "@/components/Calendar";
import KPI from "../KPI";




const AllKPIDocumentGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let KPI = totalkpisyear.result;

    let obj = {
      WQEDCOMCKPI: (KPI.map(res => ({
        value: res.WQEDCOMCDocumentProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      WQEDCOMFKPI: (KPI.map(res => ({
        value: res.WQEDCOMFDocumentProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (KPI.map(res => ({
        value: res.WQEDCOMFDocumentProcessed + res.WQEDCOMCDocumentProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    console.log(obj)
    debugger

    if (value == 'WQEDCOMF') {
      setData(obj.WQEDCOMFKPI.reverse())
    } else if (value == "WQEDCOMC") {
      setData(obj.WQEDCOMCKPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Total Documents Processed
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'WQEDCOMC'}>WQEDCOMC</Radio>
          <Radio value={'WQEDCOMF'}>WQEDCOMF</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            // color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};

const AllKPIGraph = ({ usersList = [] }) => {

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState('');
  const [value, setValue] = useState('Total');



  useEffect(async () => {
    // const response = await request.list("compliance-user"); 
    if (usersList.length > 0) {
      setUser(usersList[0].FIRST_NAME)
      setUsers(usersList)
      asyncFetch(value, usersList[0].FIRST_NAME);

    }

  }, [usersList]);


  const asyncFetch = async (value, user) => {

    var [totalkpisyear] = await Promise.all([request.list("totalkpisyear", {})]);
    let KPI = totalkpisyear.result;

    let obj = {
      WQEDCOMCKPI: (KPI.map(res => ({
        value: res.WQEDCOMCPagesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      WQEDCOMFKPI: (KPI.map(res => ({
        value: res.WQEDCOMFPagesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

      wqTotalKPI: (KPI.map(res => ({
        value: res.WQEDCOMFPagesProcessed + res.WQEDCOMCPagesProcessed,
        year: res.ActionTimeStamp.split('T')[0].replace(/-/g, '/'),
        category: res.User
      }))),

    }

    console.log(obj)

    if (value == 'WQEDCOMF') {
      setData(obj.WQEDCOMFKPI.reverse())
    } else if (value == "WQEDCOMC") {
      setData(obj.WQEDCOMCKPI.reverse())
    } else {
      setData(obj.wqTotalKPI.reverse())
    }

  };


  const onChange = e => {
    setData([])
    setValue(e.target.value);
    asyncFetch(e.target.value, user);
  };

  const onChangeUser = e => {
    setData([])
    setUser(e);
    asyncFetch(value, e);
  };

  return (
    <div>

      <div style={{position: "absolute",
                marginTop: "-40px",
                fontWeight: "500"}}>
        Total Pages Processed
      </div>
      <div className="bar-chart-switcher-container1" style={{ marginTop: "-40px" }}>

        <Radio.Group onChange={onChange} value={value}>
          <Radio value={'Total'}>Both WQs</Radio>
          <Radio value={'WQEDCOMC'}>WQEDCOMC</Radio>
          <Radio value={'WQEDCOMF'}>WQEDCOMF</Radio>
        </Radio.Group>

      </div>
      {
        data.length > 0 ?
          <Line {...{
            data,
            height: 380,
            padding: 'auto',
            xField: 'year',
            yField: 'value',
            seriesField: 'category',
            renderer: "svg",
            legend: {
              reversed: true
            },
            xAxis: {
              tickCount: 10,

              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"
                }
              }
            },

            yAxis: {
              label: {
                style: {
                  fontSize: 12,
                  fontWeight: "bold"

                }
              }
            },
            
            // color: ["#ff92a5", "#97e997", '#cf2085bd', '#728fce', '#ff0833' ],
            slider: {
              start: data.length > 60 ? 0.6 : 0.6,
              end: 1,
            },
            tooltip: {
              customItems: (originalItems) => {
                // process originalItems, 
                return (originalItems.sort((a,b) => a['data']['value'] - b['data']['value'] )).reverse()
              },
              fields: ['year', 'value', 'category'],
              formatter: (datum) => {
                return { ...datum,  name: datum.category,value: datum.value };
              
              },
            }

          }} />
          : <span style={{ marginTop: "-30px", position: 'absolute', display: 'block' }}>Loading...</span>
      }

    </div>

  )
};

const DemoGauge = ({ percent }) => {

  var config = {
    percent: +percent / 100,
    type: 'meter',
    innerRadius: 0.75,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#F4664A', '#FAAD14', '#30BF78'],
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

  const [totalProductivity, setTotalProductivity] = useState(0);
  const [totalWQEDCOMFProductivity, setTotalWQEDCOMFProductivity] = useState(0);
  const [epicData, setEpicData] = useState([])
  const [usersList, setUsersList] = useState([])


  useEffect(() => {
    Socket.on('updated-wqs', () => {
      load()
    });

    load()
  }, [])

  const load = () => {
    (async () => {

      const [WQEDCOMCProgress, WQEDCOMFProgress] = await Promise.all([request.list("WQEDCOMCprogress"), request.list("WQEDCOMFprogress")]);

      let WQEDCOMC = WQEDCOMCProgress.result;
      let WQEDCOMF = WQEDCOMFProgress.result;
      // setEpicData(dailyProgress.result)

      let sumWQEDCOMC = 0;
      let sumWQEDCOMF = 0;
      debugger

      for (let i = 0; i < WQEDCOMC.length; i++) {
        sumWQEDCOMC += WQEDCOMC[i] ? parseFloat(WQEDCOMC[i].ChargesProcessed) : 0;
        sumWQEDCOMF += WQEDCOMF[i] ? parseFloat(WQEDCOMF[i].ChargesProcessed) : 0;
      }

      console.log(sumWQEDCOMF)
      console.log(sumWQEDCOMC)
      setTotalWQEDCOMFProductivity(((sumWQEDCOMF / (WQEDCOMF.length * 100)) * 100).toFixed(2))
      setTotalProductivity(((sumWQEDCOMC / (WQEDCOMC.length * 100)) * 100).toFixed(2))

      const response = await request.list("admin");
      setUsersList(response.result.filter((re) => re.ManagementAccess != 1))

    })()
  }


  return (
    <DashboardLayout style={dashboardStyles}>

      <Row gutter={[24, 24]}>
     
      <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              <AllKPIGraph usersList={usersList} />
            </div>
          </div>
        </Col>

        <Col className="gutter-row" style={{ width: "50%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div className="pad20 demo-chart-container" style={{ marginTop: "40px" }} >

              <AllKPIDocumentGraph usersList={usersList} />
            </div>
          </div>
        </Col>

        

        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              <DemoGauge width={148} percent={totalWQEDCOMFProductivity} />
              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQEDCOMF</h1>

            </div>
          </div>
        </Col>
        <Col className="gutter-row" style={{ width: "20%" }}>
          <div className="whiteBox shadow" style={{ height: "455px" }}>
            <div
              className="pad20"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <h3 style={{ color: "#22075e", marginBottom: 30 }}>
                Productivity Preview
              </h3>

              <DemoGauge width={148} percent={totalProductivity} />

              <Divider />
              <p style={{ color: "#22075e", margin: " 30px 0" }}>
                Total Work Done
              </p>

              <h1 className="calendar-header">WQEDCOMC</h1>
            
            </div>
          </div>
        </Col>
      </Row>

    </DashboardLayout>
  );
}
