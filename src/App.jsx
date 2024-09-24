import { Button, Table } from "antd";
import Dragger from "antd/es/upload/Dragger";
import ImportFile from "./components/FileUpload";
import { useState } from "react";

const columns = [
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Password",
    dataIndex: "password",
  },
  {
    title: "Recovery Email",
    dataIndex: "recoveryEmail",
  },
  {
    title: "Recovery Password",
    dataIndex: "recoveryPassword",
  },
  {
    title: "Channel Link",
    dataIndex: "channelLink",
  },
  {
    title: "Airtalbes Token",
    dataIndex: "airtableToken",
  },
  {
    title: "Airtalbes Link",
    dataIndex: "airtableLink",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

const dataSource = [
  {
    key: "1",
    email: "hamza@gmail.com",
    password: "dummy",
    recoveryEmail: "recovery@gmail.comm",
    recoveryPass: "duhh",
    channel: "httpsyoutube.com",
    token: "hello",
    link: "hello ",
  },
];

function App() {
  const [tableData, setTableData] = useState([]);
  return (
    <>
      <ImportFile setData={setTableData} />
      <Table dataSource={tableData} columns={columns} />
    </>
  );
}

export default App;
