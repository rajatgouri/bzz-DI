

   
import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Divider } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList
} from "recharts";
import LiquidChart from "@/components/Chart/liquid";
let { request } = require('@/request')
import { CheckOutlined, DollarTwoTone, CheckSquareTwoTone, ConsoleSqlOutlined } from "@ant-design/icons";
import ReactTooltip from 'react-tooltip';
import CheckImage from "../../assets/images/check.png";
import Halloween from "../../assets/images/halloween.png";
import logo from "../../assets/images/logo.png";
import SantaBag from "../../assets/images/santa-gift-bag.png";
import ExternalPumpkin from "../../assets/images/external-pumpkin.png";
import CandyCaneBow from "../../assets/images/candy-cane-bow.png";
import CandyCane from "../../assets/images/candy-cane.png";
import Candy from "../../assets/images/candy.png";
import Candy1 from "../../assets/images/candy1.png";
import Autumn from "../../assets/images/autumn.png";
import SealOfExellence from "../../assets/images/seal-of-exellence.png";
import CheckerFlags from "../../assets/images/checker-flags.png";
import BearBadge from "../../assets/images/bear1.png";
import FireworksBadge from "../../assets/images/balloons1.png";
import PencilBadge from "../../assets/images/pencil1.png";
import StarBadge from "../../assets/images/star1.png";
import RibbonBadge from "../../assets/images/ribbon1.png";
import ThumbsupBadge from "../../assets/images/thumbs-up1.png";
import ProgressChart from "../Chart/progress";
import { getDate } from "@/utils/helpers";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment'
import { Line } from '@ant-design/charts';


const DemoLine = ({ data , value}) => {

  console.log(data)
  console.log(value)

  
  const config = {
    data,
    width: 110,
    height: 80,
    autoFit: false,
    padding: 'auto',
    xField: 'year',
    yField: 'value',
    renderer: "svg",
    legend: false,
    xAxis: {
      tickCount: 10,

      label: {
        style: {
          fontSize: 6
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fontSize: 6
        }
      }
    },
    point: {
      size: 3,
      shape: 'diamond',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    tooltip: {
      customContent: (title, data) => {
        return `<div class='linechart-tooltip'>

          <div ><span class="bold"> Date </span>:  ${title} </div> 
          <div ><span class="bold">${value}</span> :  ${data[0] ? data[0].value : ""} </div> 
        </div>`;
      }
    }
  };
  return <Line {...config} />;
};


const barChartConfig = {
  width: 115,
  height: 110,
  style: {
    display: "flex",
    margin: "auto",
    marginTop: "20px"

  }
}

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
        {value > 1000 ? (value / 1000).toFixed(1) + "K" : value}
      </text>
    </g>
  );
};


export default function TopCard({ EMPID, kpi1, kpi2, user, title, KPI, percent1 = 0, percent2 = 0, agingDaysWQEDCOMF, agingDaysWQEDCOMC, amountWQEDCOMC = [], amountWQEDCOMF = [], feedback = {}, WQEDCOMCWorkDone = {}, WQEDCOMFWorkDone = {}, onRatingChanged, showBadge = false, notes, showCalendar }) {

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [badges, setBadges] = useState([
    { badge: StarBadge, index: 1, active: false, notes: "" },
    { badge: BearBadge, index: 2, active: false, notes: "" },
    { badge: RibbonBadge, index: 3, active: false, notes: "" },
    { badge: ThumbsupBadge, index: 4, active: false, notes: "" },
    { badge: PencilBadge, index: 5, active: false, notes: "" },
    { badge: FireworksBadge, index: 6, active: false, notes: "" }
  ])

  const [selectedBadge, setSelectedBadge] = useState({});
  const [WQEDCOMCRating, setWQEDCOMCRating] = useState(feedback.Stars);
  const [value, setValue] = useState(new Date());

  const [WQEDCOMCWork, setWQEDCOMCWork] = useState(WQEDCOMCWorkDone)
  const [WQEDCOMFWork, setWQEDCOMFWork] = useState(WQEDCOMFWorkDone)

  const [WQEDCOMCWorkingDays, setWQEDCOMCWorkingDays] = useState([]);
  const [WQEDCOMFWorkingDays, setWQEDCOMFWorkingDays] = useState([]);

  const [weeksWQEDCOMC, setWeeksWQEDCOMC] = useState([]);
  const [weeksWQEDCOMF, setWeeksWQEDCOMF] = useState([]);
  const [calendarCheckmark, setCalendarCheckmark] = useState([])
  const [calendar, setCalendar] = useState([])

  const disableTile = ({ date }) => {


    if ((user.StartDay == 'Sun' && date.getDay() == 5) || (user.StartDay != 'Sun' && date.getDay() == 0) || date.getDay() == 6 || calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)) {
      return true
    }

  }

  const onViewChange = (event) => {
    console.log(event)
  }


  const tileContent = ({ date, view }) => {
    let entry = calendar.find(x => x['WhenPosted'] ? x['WhenPosted'].split('T')[0] == moment(date).format("YYYY-MM-DD") : false)
    if (entry && entry.Status) {
      return entry.Status.split(', ')[1]
    }


    if (calendarCheckmark.length > 0) {

      let tick = calendarCheckmark.find(x => x['Date'] ? x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 1 : false)
      let cross = calendarCheckmark.find(x => x['Date'] ? x['Date'].split('T')[0] == moment(date).format("YYYY-MM-DD") && x['Checked'] == 0 : false)

      if (tick) {
        return <span style={{ color: "green", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block" }}>✓</span>
      }

      if (cross) {
        return <span style={{ color: "red", fontSize: "12px", fontWeight: 600, transform: "rotate(10deg)", display: "block" }}>X</span>
      }

    }

  }


  const getCheckmarkData = async () => {
    const response1 = await request.list1("dailycheckmark", 
    { data: JSON.stringify({ EMPID: EMPID, date: (new Date().getFullYear()) })});
    
    setCalendarCheckmark(response1.result)
  }

  const onDayClick = async (value, event) => {
    let date = (value.toISOString().split('T')[0])
    await request.create("dailycheckmark", { EMPID: EMPID, Date: date });
    getCheckmarkData()
  }

  useEffect(() => {
    if(showCalendar) {
      getCheckmarkData()
    }

    (async () => {
      getCheckmarkData()
      const response = await request.list1("admin-one", { data: JSON.stringify({
        EMPID: EMPID
      }) });
      let result = (response.result)[0];
      if (result) {

        let wdays = days.slice(days.indexOf(result.StartDay), days.indexOf(result.StartDay) + 5)
        setWQEDCOMCWorkingDays(wdays)
        setWQEDCOMFWorkingDays(wdays)

        // weeks
        let WQEDCOMCWeekList = [];
        let WQEDCOMFWeekList = [];


        for (let i = 1; i < 5; i++) {

          WQEDCOMCWeekList.push(WQEDCOMCWork['Week' + i])
          WQEDCOMFWeekList.push(WQEDCOMFWork['Week' + i])
        }

        setWeeksWQEDCOMC(WQEDCOMCWeekList)
        setWeeksWQEDCOMF(WQEDCOMFWeekList)

        if (WQEDCOMCWork.AdminAssignedBadge) {
          let badgesList = badges;
          let selected = badges.filter(badge => badge.index == WQEDCOMCWork.AdminAssignedBadge)[0]


          if (selected) {
            badgesList[selected.index - 1].active = true
            badgesList[selected.index - 1].notes = WQEDCOMCWork.Notes

            setSelectedBadge(selected)

            setTimeout(() => setBadges([...badgesList]), 1000)


          }
        }

      }
    })()


  }, [WQEDCOMCWork, WQEDCOMFWork, EMPID])


  useEffect(() => {
  }, [KPI])

  const onChange = (date) => {
    console.log(date)
    setValue(date)
  }

  const onBageAssigned = async (index) => {

    // let badgeIndex = badges.findIndex(badge => badge.index = index);
    let badgeList = badges;

    badgeList.map((badge) => {
      if (badge.index != index) {
        badge.active = false
      }
    })

    badgeList[index - 1].active = !badgeList[index - 1].active;

    let response;
    if (badgeList[index - 1].active) {
      setSelectedBadge(badgeList[index - 1])
      response = await request.update("WQEDCOMCWork", EMPID, { AdminAssignedBadge: badgeList[index - 1].index });
      notes(EMPID)

    } else {
      setSelectedBadge({})
      response = await request.update("WQEDCOMCWork", EMPID, { AdminAssignedBadge: null });
    }


    setTimeout(() => setBadges([...badgeList]), 0)
  }

  const ratingChanged = (newRating) => {
    setWQEDCOMCRating(newRating)
    onRatingChanged(EMPID, newRating)
  };

  useEffect(async () => {
    if(showCalendar) {
      let year = (new Date().getFullYear())
      const { result: calendar } = await request.listinlineparams('billingcalendarstaff1', { year: year, date_column: "ReportDate", EMPID: user.EMPID })
      setCalendar(calendar)
  
    }
    

  }, [user])

  return (
    <Col className="gutter-row topcard" >
      <div
        className="whiteBox shadow"
        style={{ color: "#595959", fontSize: 13 }}
      >
        <div
          className="pad5 strong"
          style={{ textAlign: "left", justifyContent: "center" }}
        >
          <h3 style={{ color: "#22075e", margin: "3px auto", fontSize: "10px !important", textAlign: "center" }} className="header">
            {/* {
              selectedBadge.badge ?
                <span >
                  <p data-tip={selectedBadge.notes} style={{ display: "contents" }}>
                    <img className="scale1" src={selectedBadge.badge} style={{ position: "absolute", width: "45px", marginTop: "-6px", left: "12px" }}></img>
                  </p>
            
                  <ReactTooltip />
                </span>

                : null
            } */}
            {title}
            {/* {
              WQEDCOMCWork.Badge ?
                <img height="30" width="23" className="scale3" src={SealOfExellence} style={{ marginLeft: "10px" }}></img>
                : null
            } */}
          </h3>

          <div style={{ textAlign: "center", height: "55px", marginBottom: "7px" }}>
            {
              user ?

                user.Avatar && user.Avatar != "null" ?
                  <img src={user.Avatar} style={{ filter: user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
                  :
                  <img src={logo} style={{ borderRadius: "0px", filter: user.Online ? "" : "grayscale(100%)", opacity: user.Online ? 1 : 0.4 }} className="user-avatar scale2"></img>
                : null
            }
          </div>
          <div className="badges">
            <Row gutter={[0, 0]}>
              {/* <Col className="gutter-row" span={12} >
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQEDCOMF.map(week => {
                        return <img src={Autumn} className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginRight: "5px" }} />
                      })
                    }
                    
                  </span>
                </div>
              </Col>
              <Col className="gutter-row" span={12} style={{ textAlign: "right" }}>
                <div className="text-center">
                  <span style={{ right: "10px" }}>
                    {
                      weeksWQEDCOMC.map((week, index) => {
                        return <img src={Autumn} key={index} className="scale1" height="18" width="18" style={{ filter: !week ? "grayscale(100%)" : "", opacity: !week ? "0.25" : "", marginLeft: "5px" }} />
                      })
                    }
                  </span>
                </div>

              </Col> */}
            </Row>
          </div>
        </div>

        <Divider style={{ padding: 0, margin: 0, borderColor: "#dbdbdb" }}></Divider>
        <div >
          <Row gutter={[0, 0]} style={{ padding: "0px 6px" }}>
            <Col className="gutter-row top-card-left" span={12} style={{ textAlign: "left", paddingBottom: "5px" }}>
              <div className="text-center">
                <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>WQEDCOMF</div>
                   

                <div style={{ textAlign: "center" }}>
                  {/* <div className="counter-container" style={{marginTop: "10px"}}>
                    <div style={{ height: "84px" }}>
                      <div>
                        <p className="amount-container digital">
                          {
                            (parseInt(kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                          }
                        </p>
                        <p className="general-label">Pages Processed</p>
                      </div>
                    </div>
                  </div> */}
                  <div className="counter-container" >
                    <div style={{ height: "84px" }}>
                      <div>
                        <p className="amount-container digital">
                          {
                            (parseInt(kpi2 ? JSON.parse(kpi2)['totalProcess'] : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                          }
                        </p>
                        <p className="general-label">Pages Processed</p>
                      </div>
                      <div>
                        <p className="total-container digital">{kpi2 ? JSON.parse(kpi2)['totalDocProcessed'] : 0}</p>
                        <p className="general-label">Documents Processed</p>
                      </div>
                    </div>
                  </div>
                </div>
                {
                  KPI.WQEDCOMF && KPI.WQEDCOMF.length > 0 ?
                    
                    <div style={{ textAlign: "left !important", marginTop: "30px" }}>
                      <div >
                        <DemoLine data={KPI.WQEDCOMF} value={'Pages'} />
                      </div>

                    </div>
                    : (
                      <div className="empty-aging-days" style={{
                        padding: "25px",
                        width: "105px",
                        margin: "0px auto",
                        display: "flex",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="60" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label" style={{ marginTop: "5px" }}>Pages Processed</p>

                {
                  KPI.WQEDCOMFDOC && KPI.WQEDCOMFDOC.length > 0 ?
                    
                    <div style={{ textAlign: "left !important", marginTop: "30px" }}>
                      <div >
                        <DemoLine data={KPI.WQEDCOMFDOC} value={'Documents'}/>
                      </div>

                    </div>
                    : (
                      <div className="empty-aging-days" style={{
                        padding: "25px",
                        width: "105px",
                        margin: "0px auto",
                        display: "flex",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="60" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label" style={{ marginTop: "5px" }}>Documents Processed</p>

                {/* {
                  KPI.WQEDCOMFKPIAmount && KPI.WQEDCOMFKPIAmount.length > 0 ?
                    <BarChart
                      width={barChartConfig.width}
                      height={barChartConfig.height}
                      data={KPI.WQEDCOMFKPIAmount}
                      style={barChartConfig.style}
                    >
                      <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#25b24a" minPointSize={5}>
                        <LabelList dataKey="value" content={renderCustomizedLabel} />
                      </Bar>
                    </BarChart>

                    : (
                      <div className="empty-aging-days" style={{
                        padding: "5px",
                        width: "92px",
                        margin: "auto",
                        display: "flex",
                        marginTop: "20px",
                        flexDirection: "column"
                      }}>
                        <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%" }}>
                          <img src={CheckerFlags} width="60" height="35"></img>
                        </div>
                      </div>
                    )
                }

                <p className="barchart-label" style={{ marginTop: "-15px" }}>$ Amount Processed</p>
                 */}



              </div>
            </Col>


            <Col
              className="gutter-row top-card-right"
              span={12}
              style={{ paddingBottom: "5px" }}
            >
              <div style={{ textAlign: "center", marginTop: "5px", fontWeight: 600, marginBottom: "10px" }}>WQEDCOMC</div>
                 
                 {
                   console.log(kpi1)
                 }
              
              <div style={{ textAlign: "center" }}>
              <div className="counter-container" >
                    <div style={{ height: "84px" }}>
                      <div>
                        <p className="amount-container digital">
                          {
                            (parseInt(kpi1 ? JSON.parse(kpi1)['totalProcess'] : 0)).toLocaleString('en-US', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })
                          }
                        </p>
                        <p className="general-label">Pages Processed</p>
                      </div>
                      <div>
                        <p className="total-container digital">{kpi1 ? JSON.parse(kpi1)['totalDocProcessed'] : 0}</p>
                        <p className="general-label">Documents Processed</p>
                      </div>
                    </div>
                  </div>
              </div>

              {
                KPI.WQEDCOMC && KPI.WQEDCOMC.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "30px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={KPI.WQEDCOMC} value={'Pages'}/>
                    </div>
                  </div>

                  : (
                    <div className="empty-aging-days" style={{
                      padding: "25px",
                      width: "105px",
                      margin: "0px auto",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "5px" }}>Pages Processed</p>



              {
                KPI.WQEDCOMCDOC && KPI.WQEDCOMCDOC.length > 0 ?
                  <div style={{ textAlign: "left !important", marginTop: "30px" }}>
                    <div style={{ textAlign: "center" }}>
                      <DemoLine data={KPI.WQEDCOMCDOC} value={'Documents'}/>
                    </div>
                  </div>

                  : (
                    <div className="empty-aging-days" style={{
                      padding: "25px",
                      width: "105px",
                      margin: "0px auto",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "5px" }}>Documents Processed</p>

   {/* {
                KPI.WQEDCOMCKPIAmount && KPI.WQEDCOMCKPIAmount.length > 0 ?
                  <BarChart
                    width={barChartConfig.width}
                    height={barChartConfig.height}
                    data={KPI.WQEDCOMCKPIAmount}
                    style={barChartConfig.style}
                  >
                    <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#25b24a" >
                      <LabelList dataKey="value" content={renderCustomizedLabel} />
                    </Bar>
                  </BarChart>

                  : (
                    <div className="empty-aging-days" style={{
                      padding: " 5px",
                      width: "92px",
                      margin: "auto",
                      display: "flex",
                      marginTop: "20px",
                      flexDirection: "column",
                      overflow: "hidden"

                    }}>
                      <div style={{ textAlign: "center", fontSize: "10px", fontWeight: "500", marginTop: "30%", }}>
                        <img src={CheckerFlags} width="60" height="35"></img>
                      </div>
                    </div>
                  )
              }

              <p className="barchart-label" style={{ marginTop: "-15px" }}>$ Amount Processed</p>
                */}


            </Col>

            {/* <div
              className="pad5 strong"
              style={{ textAlign: "left", justifyContent: "center", width: "100%", padding: "0px 0px 10px", marginBottom: "10px" }}
            >
              <div className="badges text-center">
                <Row gutter={[0, 0]}>
                  <Col className="gutter-row" span={12} >
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQEDCOMFWorkingDays.map(day => {
                            return WQEDCOMFWork[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
                          })
                        }

                      </span>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={12} style={{ textAlign: "right" }}>
                    <div className="text-center">
                      <span style={{ right: "10px" }}>
                        {
                          WQEDCOMCWorkingDays.map(day => {
                            return WQEDCOMCWork[day] ? <img src={CheckImage} height="17px" weight="16px" style={{ filter: "hue-rotate(293deg)", marginLeft: "1px" }} className="scale1" /> : <img style={{ filter: "grayscale(100%)", opacity: "0.25", marginLeft: "1px" }} className="scale1" src={CheckImage} height="16px" weight="16px" />
                          })
                        }
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </div> */}

            {/* {
              showCalendar && calendar ?
                <Col span={24} style={{ padding: "9px" }} inputRef={(ref) => {
                  this.calendar = ref

                  console.log(this.calendar)
                }}>

                  <Calendar
                    calendarType="US"
                    next2Label={null}
                    prev2Label={null}
                    maxDate={new Date(`${new Date().getFullYear()}-12-31`)}
                    onDrillUp={() => console.log('y')}
                    minDate={new Date(`${new Date().getFullYear()}-01-01`)}
                    tileDisabled={disableTile}
                    tileContent={tileContent}
                    onClickDay={onDayClick}
                    onViewChange={(e) => console.log(e)}
                    value={value}
                  />
                </Col>
                : null
            }

            {
              showBadge ?
                <Col span={24} style={{ display: "flex", marginBottom: "15px", marginTop: "10px", textAlign: "center" }} >
                  {
                    badges && badges.length > 0 && badges.map((badge, index) => {
                      if (badge.active) {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{}} />

                      } else {
                        return <img onClick={() => onBageAssigned(badge.index)} src={badge.badge} className="asssignedBadge" style={{ filter: !badge.active ? "grayscale(100%)" : "", opacity: !badge.active ? "0.35" : "" }} />

                      }
                    })
                  }
                </Col>
                : null
            } */}
          </Row>
        </div>
      </div>
    </Col>
  );
};


