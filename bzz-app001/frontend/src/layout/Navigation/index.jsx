import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown } from "antd";
import { request } from "@/request";
import { useSelector, useDispatch } from "react-redux";
import logo from "../../assets/images/logo.png";

import {
  SettingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  TeamOutlined,
  ProfileOutlined,
  SlackOutlined,
  BarsOutlined,
  SearchOutlined
} from "@ant-design/icons";
import uniqueId from "@/utils/uinqueId";
import { selectListItems } from "@/redux/crud/selectors";
import { crud } from "@/redux/crud/actions";
import { logout } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";
import {user} from '@/redux/user/actions'

const { Sider } = Layout;
const { SubMenu } = Menu;


const showNew = true


function Navigation() {
  const { current } = useSelector(selectAuth);

  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useDispatch();

  const onCollapse = () => {
    setCollapsed(!collapsed);
  };

   useEffect(() => {
      dispatch(user.list('admin'))
  }, [])



  const switchUser = async (ID) => {
    // const response = await request.post("/admin/switch", {ID});
    // console.log(response)
  }

  const menu = (
    <Menu>
      <Menu.Item key={`${uniqueId()}`} style={{ fontWeight: 'bold ' }} onClick={() => dispatch(logout())}>Log Out </Menu.Item>
    </Menu>
  );
  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        style={{
          zIndex: 1000,
          background: "#fff",
          overflow: "hidden"
        }}
      >
        <div className="logo">
          <Dropdown overlay={menu} placement="bottomRight" arrow>
            <div>

              <div style={{ width: "180px" }}>
                <div style={{ width: "50px", display: "contents" }}>
                  <img style={{ height: "50px", marginTop: "-5px" }} src={logo} />
                </div>
                <div className="" style={{ width: "150px", display: "contents" }} >
                  <span style={{ verticalAlign: "top", width: "125px", display: "inline-flex", flexDirection: "column" }}>
                    <span className="text-center sub-header">Document Imaging</span>
                    <span className="header username">{current ? current.name.split(" ")[0].split('-')[0] : ""}</span>

                  </span>

                </div>
              </div>


            </div>

          </Dropdown>
        </div>

        {
          current.outside ?
            <Menu mode="inline">
              <Menu.Item key="1" icon={<DashboardOutlined />}>
                <NavLink to="/wq1262" />
                WQ1262
              </Menu.Item>
              <Menu.Item key="50" icon={<SlackOutlined />}>
                <NavLink to="/work-assignments" />
                Work Assignments
              </Menu.Item>
            </Menu>
            :

            current.managementAccess ?
              (
                <Menu mode="inline" defaultOpenKeys={['sub9']}>

                  <SubMenu
                    key="sub9"
                    icon={<DashboardOutlined />}
                    title="DI Team Dashboard"
                  >
                    <Menu.Item key="92">
                      <NavLink to="/di-team-dashboard-cards" />
                      Performance Cards
                    </Menu.Item>

                    <Menu.Item key="91">
                      <NavLink to="/di-team-dashboard-reminders" />
                      Reminders
                    </Menu.Item>
                   
                    <Menu.Item key="93">
                      <NavLink to="/di-team-dashboard-calendar" />
                      Calendar
                    </Menu.Item>

                    <Menu.Item key="94">
                      <NavLink to="/di-team-dashboard-avatars" />
                      Avatars 
                      {
                          showNew ?
                          <span style={{color: "#1DA57A", fontSize: "9px", marginLeft: "5px"}}>(New)</span>
                          : null
                        }
                    </Menu.Item>

                  </SubMenu>

                  <Menu.Item key="2" icon={<ProfileOutlined />}>
                    <NavLink to="/WQEDCOMC" />
                    WQ EDCO MC
                  </Menu.Item>

                  <Menu.Item key="3" icon={<ProfileOutlined />}>
                    <NavLink to="/WQEDCOMF" />
                    WQ EDCO MF
                  </Menu.Item>

                  {/* <Menu.Item key="4" icon={<ProfileOutlined />}>
                    <NavLink to="/wq1262" />
                    WQ1262
                  </Menu.Item> */}

                  <SubMenu
                    key="sub3"
                    icon={<TeamOutlined />}
                    title="Administration"
                  >
                    <Menu.Item key="31">
                      <NavLink to="/coverage" />
                      Coverage
                    </Menu.Item>
                    <Menu.Item key="32">
                      <NavLink to="/irb" />
                      Data Collection
                    </Menu.Item>

                    <Menu.Item key="18">
                      <NavLink to="/documentation" />
                      Documentation
                    </Menu.Item>
                 

                  </SubMenu>

                

                  {/* <Menu.Item key="6" icon={<AppstoreOutlined />}>
                    <NavLink to="/executive-services" />
                    <span className="italic" style={{ fontSize: "14px !important" }}>Executive Services</span>
                  </Menu.Item> */}
                  {/* 
                  <Menu.Item key="15" icon={<AppstoreOutlined />}>
                    <NavLink to="/predictive-billing" />
                    <span >Predictive Billing</span>
                  </Menu.Item>

                  <Menu.Item key="16" icon={<AppstoreOutlined />}>
                    <NavLink to="/nlp-routing" />
                    <span >NLP Routing</span>
                  </Menu.Item> */}

                 

                  <SubMenu
                    key="sub2"
                    icon={<AppstoreOutlined />}
                    title={<div style={{ display: "flex", flexDirection: "column" }}><span className="header" style={{ marginTop: "5px", fontSize: "14px !important" }} className="italic">Management Services</span>  </div>}
                  >
                    {/* <Menu.Item key="21">
                      <NavLink to="/work-assignments" />
                      Work Assignments
                    </Menu.Item>
                     */}
                    

                    <Menu.Item key="17" >
                        <NavLink to="/performance-cards" />
                        <span >Performance Cards</span>
                      </Menu.Item>
                      
                    <SubMenu
                    key="sub8"
                    
                    title={<span style={{fontSize: "12.8px"}}>Professionals Center</span>}
                  >
                     <Menu.Item key="18">
                          <NavLink to="/productivity-metrics/graphs" />
                              Graphs
                          </Menu.Item>
                          <Menu.Item key="19">
                          <NavLink to="/productivity-metrics/tables" />
                              Tables
                          </Menu.Item>         
                  </SubMenu>
                  <Menu.Item key="2600">
                          <NavLink to="/intake-request" />
                          Intake Requests
                        </Menu.Item>
                  
                    <Menu.Item key="28">
                      <NavLink to="/management-roadmap" />
                      Roadmap 
                    </Menu.Item>

                    
                    <Menu.Item key="2923">
                      <NavLink to="/emaillogger" />
                       Email Logger
                    </Menu.Item>   


                  
                      <Menu.Item key="220" className="large-content" >
                      <NavLink to="/master-staff-list" />
                      Master Staff List
                    </Menu.Item>

                                        
                    <Menu.Item key="222" className="large-content" >
                      <NavLink to="/hims-master-task-list" />
                      HIMS Master Task List
                    </Menu.Item>

                    <Menu.Item key="221" className="large-content" >
                      <NavLink to="/hims-calendar-schedule" />
                      HIMS Calendar Schedule
                    </Menu.Item>


                  </SubMenu>

                  {/* <SubMenu
                    key="sub4"
                    icon={
                      <img src="https://img.icons8.com/ios/50/000000/progress-indicator.png" height="15" width="15" />
                    }
                    title={<span style={{ fontSize: "12.8px" }}>Professionals Center</span>}
                  >
                    {
                      users.map((user, index) => {
                        return <Menu.Item key={100 + index}>
                          <NavLink to={"/professionals-center?id=" + user.EMPID} />
                          {user.First}
                        </Menu.Item>
                      })
                    }

                  </SubMenu> */}


                  {/* <SubMenu
                    key="sub5"
                    icon={<SearchOutlined />}
                    title={'Collaboration Center'}
                    style={{ fontSize: "12.8px" }}
                  >
                    

                  </SubMenu> */}

                  
                  <SubMenu
                    key="sub123"
                    icon={<SettingOutlined />}
                    title={'Settings'}
                    style={{fontSize: "12.8px"}}
                  >
                    <Menu.Item key="1900">
                      <NavLink to="/change-password" />
                        Change Password
                    </Menu.Item>
                    
                  </SubMenu>

                </Menu>
              )
              : (
                <Menu mode="inline" defaultOpenKeys={['sub9']}>
                  {/* <Menu.Item key="1" icon={<DashboardOutlined />}>
                    <NavLink to="di-team-dahboard" />
                    DI Team Dashboard
                  </Menu.Item> */}

                  <SubMenu
                    key="sub9"
                    icon={<DashboardOutlined />}
                    title="DI Team Dashboard"
                  >
                    
                    <Menu.Item key="92">
                      <NavLink to="/di-team-dashboard-cards" />
                      Performance Cards
                    </Menu.Item>
                    <Menu.Item key="91">
                      <NavLink to="/di-team-dashboard-reminders" />
                      Reminders
                    </Menu.Item>
                    <Menu.Item key="93">
                      <NavLink to="/di-team-dashboard-calendar" />
                      Calendar
                    </Menu.Item>
                    <Menu.Item key="94">
                      <NavLink to="/di-team-dashboard-avatars" />
                      Avatars
                       {
                          showNew ?
                          <span style={{color: "#1DA57A", fontSize: "9px", marginLeft: "5px"}}>(New)</span>
                          : null
                        }
                    </Menu.Item>


                  </SubMenu>

                  <Menu.Item key="2" icon={<ProfileOutlined />}>
                    <NavLink to="/WQEDCOMC" />
                    WQ EDCO MC
                  </Menu.Item>

                  <Menu.Item key="3" icon={<ProfileOutlined />}>
                    <NavLink to="/WQEDCOMF" />
                    WQ EDCO MF
                  </Menu.Item>

                  {/* <Menu.Item key="4" icon={<ProfileOutlined />}>
                    <NavLink to="/wq1262" />
                    WQ1262
                  </Menu.Item> */}

                  <SubMenu
                    key="sub3"
                    icon={<TeamOutlined />}
                    title="Administration"
                  >
                    <Menu.Item key="31">
                      <NavLink to="/coverage" />
                      Coverage
                    </Menu.Item>
                    <Menu.Item key="32">
                      <NavLink to="/irb" />
                      Data Collection
                    </Menu.Item>
                    {/* <Menu.Item key="33">
                      <NavLink to="/no-pcc-studies" />
                      No PCC Studies
                    </Menu.Item> */}

                  </SubMenu>


                  <SubMenu
                    key="sub123"
                    icon={<SettingOutlined />}
                    title={'Settings'}
                    style={{fontSize: "12.8px"}}
                  >
                    <Menu.Item key="1900">
                      <NavLink to="/change-password" />
                        Change Password
                    </Menu.Item>
                    
                  </SubMenu>
                </Menu>
              )
        }
      </Sider>
    </>
  );
}
export default Navigation;
