import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Upload, Button, message, Input, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

interface ChannelInfo {
  email: string;
  password: string;
  recoveryEmail: string;
  recoveryPassword: string;
  channelLink: string;
  airtableToken: string;
  airtableLink: string;
  action: ReactNode;
  views: string;
  subs: string;
  videos: string;
}

const FileUploader = (props) => {
  const { setData, apiKey, fetchData } = props;
  const [channelDetails, setChannelDetails] = useState(null);
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

      const parsedData: ChannelInfo[] = lines.map((line, idx) => {
        const [email, password, recoveryEmail, recoveryPassword, ...rest] = line
          .split(":")
          .map((item) => item.trim());

        const channelLink = `${rest[0]}${rest[1]}`
        const airtableToken = rest[2]
        const airtableLink = `${rest[3]}${rest[4]}`

        // Rejoin the rest of the array elements as a string

        return {
          apiKey: apiKey,
          key: idx,
          email: email || "",
          password: password || "",
          recoveryEmail: recoveryEmail || "",
          recoveryPassword: recoveryPassword || "",
          channelLink: channelLink || "",
          airtableToken: airtableToken || "",
          airtableLink: airtableLink || "",
          action: (
            <Button
              onClick={async () => {
                fetchData(channelLink, idx);
              }}
            >
              Update
            </Button>
          ),
        };
      });

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
      </Space>
    </>
  );
};

export default FileUploader;
