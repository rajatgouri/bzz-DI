import React from "react";

import { Layout } from "antd";

const { Content } = Layout;

export default function WQTableLayout({ children }) {
  return (
    <Layout className="site-layout table-view" style={{ minHeight: "200vh", maxHeight: "200vh", minWidth: "1333px",  padding: "35px 35px 10px 35px " }}>
      <Content
        className="site-layout-background"
        style={{
          padding: "35px ",
          width: "100%",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}
