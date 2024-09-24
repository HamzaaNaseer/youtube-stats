import React, { ReactNode } from "react";
import { Upload, Button, message, Input, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface ChannelInfo {
  email: string;
  password: string;
  recoveryEmail: string;
  recoveryPassword: string;
  channelLink: string;
  airtableToken: string;
  airtableLink: string;
  action: ReactNode;
}

const FileUploader = (props) => {
  const { setData } = props;
  // Function to check if the uploaded file is a text file
  const beforeUpload = (file) => {
    const isTxt = file.type === "text/plain";
    if (!isTxt) {
      message.error("You can only upload text files!");
    }
    return isTxt || Upload.LIST_IGNORE; // Only proceed if the file is a text file
  };

  // Function to handle the file upload and reading
  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      const lines = fileContent?.split("\n").map((line) => line.trim());
      console.log(fileContent); // Logs the content of the text file
      console.log("lines ", lines);

      const parsedData: ChannelInfo[] = lines.map((line) => {
        const [
          email,
          password,
          recoveryEmail,
          recoveryPassword,
          channelLink,
          airtableToken,
          airtableLink,
        ] = line.split(":").map((item) => item.trim());

        return {
          email: email || "",
          password: password || "",
          recoveryEmail: recoveryEmail || "",
          recoveryPassword: recoveryPassword || "",
          channelLink: channelLink || "",
          airtableToken: airtableToken || "",
          airtableLink: airtableLink || "",
          action: (
            <Button
              onClick={() => {
                console.log("clicked email", email);
              }}
            >
              Update
            </Button>
          ),
        };
      });
      console.log("parsed data is ", parsedData);

      setData(parsedData);
    };
    reader.readAsText(file); // Reads the file as text
  };

  return (
    <>
      <Space>
        <Upload
          beforeUpload={beforeUpload}
          customRequest={({ file, onSuccess }) => {
            handleUpload(file);
            onSuccess("ok"); // Mock successful upload
          }}
          showUploadList={false} // Hide the file list to prevent clutter
        >
          <Button icon={<UploadOutlined />}>Upload Text File</Button>
        </Upload>

        <Input placeholder="Enter api key" style={{ maxWidth: "500px" }} />
      </Space>
    </>
  );
};

export default FileUploader;
