import React from "react";
import { Modal } from "antd";


export default function Modals({ config, children}) {
  let { title,  openModal, handleCancel , width = 400, minHeight = "0px", close} = config;

  return (
    <>
    <Modal maskClosable={false} bodyStyle={{minHeight: minHeight}} centered title={title} visible={openModal} closeIcon={close ?  <span style={{visibility: "hidden"}} >"."</span> : "" } onCancel={handleCancel} footer={null}  width={width}>
        {children}
      </Modal>
    </> 
  );
}
